import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/axios';
import { webSocketService } from '../api/WebSocketService';
import { useAuth } from '../hooks/useAuth';

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
  
  const { user } = useAuth();

  useEffect(() => {
    registerForPushNotificationsAsync().then(async (tokenData) => {
      if (tokenData) {
        setExpoPushToken(tokenData.token || null);
        setDeviceId(tokenData.deviceId);
        await sendTokenToBackend(tokenData.token || null, tokenData.deviceId, user?.id);
      }
    });

    const subscription = Notifications.addNotificationReceivedListener(notification => {
      const content = notification.request.content;
      const data: any = content.data || {};
      
      const newNotification: NotificationItem = {
        id: data.id || ('notif-' + Date.now()),
        title: content.title || 'New Notification',
        message: content.body || '',
        type: data.notificationType || 'GENERAL',
        bookingId: data.bookingId || undefined,
        isRead: false,
        createdAt: data.createdAt || new Date().toISOString(),
      };

      setNotifications(prev => {
        const exists = prev.find(n => (newNotification.id && n.id === newNotification.id) || (n.title === newNotification.title && n.message === newNotification.message));
        if (exists) return prev;
        return [newNotification, ...prev];
      });

      fetchNotifications();
    });
    
    const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
      const data: any = response?.notification?.request?.content?.data || {};
      
      // When user clicks the FCM notification to enter the app, mark that specific notification as read immediately
      if (data?.id) {
        markAsRead(data.id);
      } else if (data?.bookingId) {
        setNotifications(prev => {
          const match = prev.find(n => n.bookingId === data.bookingId);
          if (match) {
            markAsRead(match.id);
          }
          return prev;
        });
      }

      if (data?.screen) {
        const { navigate } = require('../navigation/navigationRef');
        navigate(data.screen as any, data.bookingId ? { bookingId: data.bookingId } : undefined);
      }
    };

    // Cold-start response listener (when app was closed and opened via notification tap)
    Notifications.getLastNotificationResponseAsync().then(response => {
      if (response) {
        handleNotificationResponse(response);
      }
    });

    // Background/Foreground response listener
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      handleNotificationResponse(response);
    });

    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  }, [user?.id]);

  useEffect(() => {
    fetchNotifications();

    webSocketService.connect();
    
    const handleWsNotification = (parsed: any) => {
      const item: NotificationItem = {
        id: parsed.id || ('ws-' + Date.now()),
        title: parsed.title || 'New Notification',
        message: parsed.message || '',
        type: parsed.type || 'GENERAL',
        bookingId: parsed.booking ? parsed.booking.id : parsed.bookingId,
        isRead: parsed.isRead || false,
        createdAt: parsed.createdAt || new Date().toISOString(),
      };

      setNotifications(prev => {
        const exists = prev.find(n => n.id === item.id);
        if (exists) {
          return prev.map(n => n.id === item.id ? item : n);
        }
        return [item, ...prev].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      });

      // Trigger local push notification banner in foreground
      Notifications.scheduleNotificationAsync({
        content: {
          title: item.title,
          body: item.message,
          data: { screen: 'Notifications', bookingId: item.bookingId, id: item.id },
          sound: true,
        },
        trigger: null,
      }).catch(() => {});
    };

    const adminTopic = `/topic/admin/notifications`;
    webSocketService.subscribe(adminTopic, handleWsNotification);

    return () => {
      webSocketService.unsubscribe(adminTopic, handleWsNotification);
    };
  }, [user?.id, deviceId]);

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

  const sendTokenToBackend = async (token: string | null, devId: string, adminId?: string) => {
    if (!token) return;
    try {
      await api.post('/fcm/token', {
        token,
        deviceId: devId,
        receiverType: 'ADMIN',
        ...(adminId && adminId.length === 36 ? { adminId } : {})
      });
    } catch (error) {
      console.error('Failed to register FCM token:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      if (!user?.id) return; // Admin must be logged in
      const response = await api.get(`/notifications?receiverType=ADMIN`);
      if (response.data.success) {
        setNotifications(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      await api.patch(`/notifications/${id}/read`);
    } catch (error) {
      console.error('Failed to mark as read:', error);
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    try {
      if (!user?.id) return;
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      await api.patch(`/notifications/read-all?receiverType=ADMIN`);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      fetchNotifications();
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
      setNotifications([]);
      await api.delete(`/notifications/clear-all?receiverType=ADMIN`);
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
