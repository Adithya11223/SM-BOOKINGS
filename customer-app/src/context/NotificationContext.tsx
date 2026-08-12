import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/axios';
import { webSocketService } from '../api/WebSocketService';
import { useAuth } from '../hooks/useAuth';
import { navigate } from '../navigation/navigationRef';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  bookingId?: string;
  serviceId?: string;
  receiverType?: string;
  receiverId?: string;
}

interface NotificationContextProps {
  notifications: NotificationItem[];
  unreadCount: number;
  expoPushToken: string | null;
  deviceId: string | null;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
}

export const NotificationContext = createContext<NotificationContextProps>({
  notifications: [],
  unreadCount: 0,
  expoPushToken: null,
  deviceId: null,
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  deleteNotification: async () => {},
  clearAllNotifications: async () => {},
  fetchNotifications: async () => {},
});

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  
  const { user, isSignedIn } = useAuth();

  useEffect(() => {
    registerForPushNotificationsAsync().then(async (tokenData) => {
      if (tokenData) {
        setExpoPushToken(tokenData.token || null);
        setDeviceId(tokenData.deviceId);
        await sendTokenToBackend(tokenData.token || '', tokenData.deviceId, user?.id);
      }
    });

    const subscription = Notifications.addNotificationReceivedListener(notification => {
      fetchNotifications();
    });
    
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (data?.screen) {
        navigate(data.screen as any, data.bookingId ? { bookingId: data.bookingId } : undefined);
      }
    });

    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  }, [isSignedIn, user?.id]);

  useEffect(() => {
    fetchNotifications();

    const receiverId = user?.id || deviceId;
    
    // Always connect to WebSockets so that Bookings, Services, and Business Config can get real-time updates
    webSocketService.connect();
    
    if (receiverId) {
      const handleWsNotification = (parsed: any) => {
        setNotifications(prev => {
          const exists = prev.find(n => n.id === parsed.id);
          if (exists) {
            return prev.map(n => n.id === parsed.id ? parsed : n);
          }
          return [parsed, ...prev].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        });

        // Trigger local push notification instantly
        Notifications.scheduleNotificationAsync({
          content: {
            title: parsed.title || 'New Notification',
            body: parsed.message || 'You have a new update.',
            data: { screen: 'Notifications', bookingId: parsed.bookingId },
            sound: true,
          },
          trigger: null,
        });
      };

      const privateTopic = `/topic/customer/${receiverId}/notifications`;
      const broadcastTopic = `/topic/customer/all/notifications`;

      webSocketService.subscribe(privateTopic, handleWsNotification);
      webSocketService.subscribe(broadcastTopic, handleWsNotification);

      return () => {
        webSocketService.unsubscribe(privateTopic, handleWsNotification);
        webSocketService.unsubscribe(broadcastTopic, handleWsNotification);
      };
    }
  }, [isSignedIn, deviceId, user?.id]);

  const registerForPushNotificationsAsync = async () => {
    let token;
    let localDeviceId = await AsyncStorage.getItem('DEVICE_ID');
    
    if (!localDeviceId) {
      localDeviceId = 'DEVICE-' + Math.random().toString(36).substring(2, 15);
      await AsyncStorage.setItem('DEVICE_ID', localDeviceId);
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        return { token: null, deviceId: localDeviceId };
      }
      try {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId;
        if (!projectId) {
          console.error("No EAS projectId found in app.json");
        }
        token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      } catch (e) {
        console.error("Error getting push token", e);
      }
    }

    return { token, deviceId: localDeviceId };
  };

  const sendTokenToBackend = async (token: string | null, devId: string, customerId?: string) => {
    if (!token) return; // Do not send null tokens to the backend
    try {
      const payload: any = {
        token,
        deviceId: devId,
        receiverType: 'CUSTOMER'
      };
      if (customerId && customerId.length === 36) { // Basic UUID check
        payload.customerId = customerId;
      }
      await api.post('/fcm/token', payload);
    } catch (error) {
      console.error('Failed to register FCM token:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const receiverId = user?.id || deviceId;
      if (!receiverId) return;
      const response = await api.get(`/notifications?receiverType=CUSTOMER&receiverId=${receiverId}`);
      if (response.data.success) {
        setNotifications(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      // Optimistic update
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      await api.patch(`/notifications/${id}/read`);
    } catch (error) {
      console.error('Failed to mark as read:', error);
      fetchNotifications(); // Revert on fail
    }
  };

  const markAllAsRead = async () => {
    try {
      const receiverId = user?.id || deviceId;
      if (!receiverId) return;
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      await api.patch(`/notifications/read-all?receiverType=CUSTOMER&receiverId=${receiverId}`);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      fetchNotifications(); // Revert on fail
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    Notifications.setBadgeCountAsync(unreadCount);
    if (unreadCount === 0) {
      Notifications.dismissAllNotificationsAsync().catch(console.error);
    }
  }, [unreadCount]);

  const deleteNotification = async (id: string) => {
    try {
      setNotifications(prev => prev.filter(n => n.id !== id));
      await api.delete(`/notifications/${id}`);
    } catch (error) {
      console.error('Failed to delete notification:', error);
      fetchNotifications();
    }
  };

  const clearAllNotifications = async () => {
    try {
      const receiverId = user?.id || deviceId;
      if (!receiverId) return;
      setNotifications([]);
      await api.delete(`/notifications/clear-all?receiverType=CUSTOMER&receiverId=${receiverId}`);
    } catch (error) {
      console.error('Failed to clear all notifications:', error);
      fetchNotifications();
    }
  };

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount, expoPushToken, deviceId, markAsRead, markAllAsRead, deleteNotification, clearAllNotifications, fetchNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
