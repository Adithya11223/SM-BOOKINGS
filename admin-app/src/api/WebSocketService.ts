import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Platform } from 'react-native';

// Polyfill text-encoding for React Native
if (Platform.OS !== 'web') {
  const TextEncodingPolyfill = require('text-encoding');
  Object.assign(global, {
    TextEncoder: TextEncodingPolyfill.TextEncoder,
    TextDecoder: TextEncodingPolyfill.TextDecoder,
  });
}

// Adjust this to your backend IP if running on device
const SOCKET_URL = 'http://10.0.2.2:8080/ws'; 

export type TopicHandler = (message: any) => void;

class WebSocketService {
  private client: Client | null = null;
  private subscriptions: Map<string, TopicHandler[]> = new Map();
  private stompSubscriptions: Map<string, any> = new Map();
  private connected = false;

  public connect(url: string = SOCKET_URL) {
    if (this.client && this.connected) {
        return;
    }

    // Determine correct local IP fallback based on platform if using emulator
    let finalUrl = url;
    if (url.includes('10.0.2.2') && Platform.OS === 'ios') {
        finalUrl = url.replace('10.0.2.2', 'localhost');
    }

    this.client = new Client({
      webSocketFactory: () => new SockJS(finalUrl),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('WebSocket Connected');
        this.connected = true;
        this.resubscribeAll();
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      },
      onWebSocketClose: () => {
        console.log('WebSocket Closed');
        this.connected = false;
      }
    });

    this.client.activate();
  }

  public disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.connected = false;
    }
  }

  public subscribe(topic: string, handler: TopicHandler) {
    if (!this.subscriptions.has(topic)) {
      this.subscriptions.set(topic, []);
    }
    const handlers = this.subscriptions.get(topic)!;
    handlers.push(handler);

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
          stompSub.unsubscribe();
          this.stompSubscriptions.delete(topic);
        }
      }
    }
  }

  private resubscribeAll() {
    this.subscriptions.forEach((handlers, topic) => {
      this.setupStompSubscription(topic);
    });
  }

  private setupStompSubscription(topic: string) {
    if (!this.client || !this.connected) return;

    // Prevent duplicate STOMP subscriptions
    if (this.stompSubscriptions.has(topic)) return;

    const sub = this.client.subscribe(topic, (message) => {
      if (message.body) {
        try {
          const body = JSON.parse(message.body);
          const handlers = this.subscriptions.get(topic) || [];
          handlers.forEach(handler => handler(body));
        } catch (e) {
          console.error(`Failed to parse message on topic ${topic}`, e);
        }
      }
    });
    
    this.stompSubscriptions.set(topic, sub);
  }
}

export const webSocketService = new WebSocketService();
