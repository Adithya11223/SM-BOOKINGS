import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Platform, AppState } from 'react-native';

// Polyfill text-encoding for React Native
if (Platform.OS !== 'web') {
  const TextEncodingPolyfill = require('text-encoding');
  Object.assign(global, {
    TextEncoder: TextEncodingPolyfill.TextEncoder,
    TextDecoder: TextEncodingPolyfill.TextDecoder,
  });
}

import { API_URL } from './axios';

// Dynamically derive the WebSocket URL from the API_URL (works for both dev and prod)
const SOCKET_URL = API_URL.replace('/api/v1', '/ws');

export type TopicHandler = (message: any) => void;

class WebSocketService {
  private client: Client | null = null;
  private subscriptions: Map<string, TopicHandler[]> = new Map();
  private stompSubscriptions: Map<string, any> = new Map();
  private connected = false;
  private isConnecting = false;

  constructor() {
    // Listen for app coming to foreground to ensure active socket connection
    AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        if (!this.connected && !this.isConnecting) {
          console.log('[WebSocket] App returned to foreground, reconnecting...');
          this.connect();
        }
      }
    });
  }

  public connect(url: string = SOCKET_URL) {
    if (this.connected || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    // Determine correct local IP fallback based on platform if using emulator
    let finalUrl = url;
    if (url.includes('10.0.2.2') && Platform.OS === 'ios') {
      finalUrl = url.replace('10.0.2.2', 'localhost');
    }

    const wsUrl = finalUrl.replace(/^http/, 'ws');

    try {
      this.client = new Client({
        webSocketFactory: () => {
          // Prefer native WebSocket on mobile for reliable Cloud Run connection
          try {
            if (typeof WebSocket !== 'undefined') {
              return new WebSocket(wsUrl);
            }
          } catch (e) {
            console.warn('[WebSocket] Native WS failed, falling back to SockJS:', e);
          }
          return new SockJS(finalUrl);
        },
        reconnectDelay: 3000,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
        onConnect: () => {
          console.log('[WebSocket] Connected successfully to', wsUrl);
          this.connected = true;
          this.isConnecting = false;
          // Clear any stale STOMP subscription references from previous session
          this.stompSubscriptions.clear();
          // Resubscribe to all active topics
          this.resubscribeAll();
        },
        onStompError: (frame) => {
          console.error('[WebSocket] STOMP Broker error:', frame.headers['message']);
          console.error('[WebSocket] Details:', frame.body);
          this.isConnecting = false;
        },
        onWebSocketClose: () => {
          console.log('[WebSocket] Connection closed');
          this.connected = false;
          this.isConnecting = false;
          this.stompSubscriptions.clear();
        },
        onDisconnect: () => {
          console.log('[WebSocket] Disconnected');
          this.connected = false;
          this.isConnecting = false;
          this.stompSubscriptions.clear();
        },
      });

      this.client.activate();
    } catch (err) {
      console.error('[WebSocket] Error during activation:', err);
      this.isConnecting = false;
    }
  }

  public disconnect() {
    if (this.client) {
      try {
        this.client.deactivate();
      } catch (e) {
        console.warn('[WebSocket] Error during deactivate:', e);
      }
      this.client = null;
      this.connected = false;
      this.isConnecting = false;
      this.stompSubscriptions.clear();
    }
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public subscribe(topic: string, handler: TopicHandler) {
    if (!this.subscriptions.has(topic)) {
      this.subscriptions.set(topic, []);
    }
    const handlers = this.subscriptions.get(topic)!;
    handlers.push(handler);

    // Auto-connect if not already connected or connecting
    if (!this.connected && !this.isConnecting) {
      this.connect();
    }

    // If already connected, establish the subscription immediately if it's the first handler
    if (this.connected && this.client && handlers.length === 1) {
      this.setupStompSubscription(topic);
    }
  }

  public unsubscribe(topic: string, handler: TopicHandler) {
    const handlers = this.subscriptions.get(topic);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
      
      // If no handlers left, unsubscribe from STOMP
      if (handlers.length === 0) {
        const stompSub = this.stompSubscriptions.get(topic);
        if (stompSub) {
          try {
            stompSub.unsubscribe();
          } catch (e) {
            console.warn('[WebSocket] Error unsubscribing:', e);
          }
          this.stompSubscriptions.delete(topic);
        }
      }
    }
  }

  private resubscribeAll() {
    this.subscriptions.forEach((handlers, topic) => {
      if (handlers.length > 0) {
        this.setupStompSubscription(topic);
      }
    });
  }

  private setupStompSubscription(topic: string) {
    if (!this.client || !this.connected) return;

    // Prevent duplicate STOMP subscriptions for the same topic
    if (this.stompSubscriptions.has(topic)) return;

    try {
      const sub = this.client.subscribe(topic, (message) => {
        if (message.body) {
          try {
            const body = JSON.parse(message.body);
            const handlers = this.subscriptions.get(topic) || [];
            handlers.forEach(handler => handler(body));
          } catch (e) {
            console.error(`[WebSocket] Failed to parse message on topic ${topic}`, e);
          }
        }
      });
      
      this.stompSubscriptions.set(topic, sub);
    } catch (e) {
      console.error(`[WebSocket] Failed to subscribe to topic ${topic}`, e);
    }
  }
}

export const webSocketService = new WebSocketService();
