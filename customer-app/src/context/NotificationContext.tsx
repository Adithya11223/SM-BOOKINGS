import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform, AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/axios';
import { webSocketService } from '../api/WebSocketService';
import { useAuth } from '../hooks/useAuth';
import { navigate } from '../navigation/navigationRef';
import { BookingService } from '../api/BookingService';

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
  markBookingNotificationsAsRead: (bookingId: string) => Promise<void>;
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
  markBookingNotificationsAsRead: async () => {},
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
      const content = notification.request.content;
      const data: any = content.data || {};
      
      if (data?.id) {
        const newNotification: NotificationItem = {
          id: data.id,
          title: content.title || 'New Notification',
          message: content.body || '',
          type: data.notificationType || 'GENERAL',
          bookingId: data.bookingId || undefined,
          serviceId: data.serviceId || undefined,
          isRead: false,
          createdAt: data.createdAt || new Date().toISOString(),
        };

        setNotifications(prev => {
          const exists = prev.find(n => n.id === newNotification.id);
          if (exists) return prev;
          return [newNotification, ...prev];
        });
      } else {
        fetchNotifications();
      }
    });
    
    const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
      const data: any = response?.notification?.request?.content?.data || {};
      
      // When user clicks the FCM notification to enter the app, mark that specific notification as read immediately
      if (data?.id) {
        markAsRead(data.id);
      } else if (data?.bookingId) {
        markBookingNotificationsAsRead(data.bookingId);
      }

      if (data?.screen) {
        if (data.screen === 'ServiceDetails' && data.serviceId) {
          navigate('ServiceDetails' as any, { serviceId: data.serviceId });
        } else if (data.screen === 'Services') {
          navigate('Services' as any, data.serviceId ? { serviceId: data.serviceId } : undefined);
        } else {
          navigate(data.screen as any, data.bookingId ? { bookingId: data.bookingId } : undefined);
        }
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
  }, [isSignedIn, user?.id]);

  useEffect(() => {
    if (!isSignedIn) {
      setNotifications([]);
      Notifications.setBadgeCountAsync(0).catch(() => {});
      if (deviceId) {
        api.post('/fcm/token/unregister', { deviceId }).catch(() => {});
      }
      return;
    }

    fetchNotifications();

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // App came to foreground -> sync with server as source of truth
        fetchNotifications();
        if (expoPushToken && deviceId && user?.id) {
          sendTokenToBackend(expoPushToken, deviceId, user.id);
        }
      }
    };
    const appStateSub = AppState.addEventListener('change', handleAppStateChange);

    const receiverId = user?.id || deviceId;
    
    // Always connect to WebSockets so that Bookings, Services, and Business Config get real-time updates
    webSocketService.connect();
    
    const handleWsNotification = (parsed: any) => {
      if (parsed?.action === 'READ_ALL') {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        return;
      }
      if (parsed?.action === 'CLEAR_ALL') {
        setNotifications([]);
        return;
      }

      if (!parsed?.id) {
        fetchNotifications();
        return;
      }

      const item: NotificationItem = {
        id: parsed.id,
        title: parsed.title || 'New Notification',
        message: parsed.message || '',
        type: parsed.type || 'GENERAL',
        bookingId: parsed.booking ? parsed.booking.id : parsed.bookingId,
        serviceId: parsed.service ? parsed.service.id : parsed.serviceId,
        isRead: parsed.isRead || false,
        createdAt: parsed.createdAt || new Date().toISOString(),
      };

      setNotifications(prev => {
        const exists = prev.find(n => n.id === item.id);
        if (exists) {
          return prev.map(n => n.id === item.id ? { ...n, ...item } : n);
        }
        return [item, ...prev].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      });

      // Only trigger local push notification banner if the notification is unread (not a read receipt sync)
      if (!item.isRead) {
        const targetScreen = item.serviceId ? 'ServiceDetails' : (item.bookingId ? 'BookingDetails' : 'Notifications');
        Notifications.scheduleNotificationAsync({
          content: {
            title: item.title,
            body: item.message,
            data: { screen: targetScreen, bookingId: item.bookingId, serviceId: item.serviceId, id: item.id },
            sound: true,
          },
          trigger: null,
        }).catch(() => {});
      }
    };

    const broadcastTopic = `/topic/customer/all/notifications`;
    webSocketService.subscribe(broadcastTopic, handleWsNotification);

    let privateTopic: string | null = null;
    if (receiverId) {
      privateTopic = `/topic/customer/${receiverId}/notifications`;
      webSocketService.subscribe(privateTopic, handleWsNotification);
    }

    return () => {
      appStateSub.remove();
      webSocketService.unsubscribe(broadcastTopic, handleWsNotification);
      if (privateTopic) {
        webSocketService.unsubscribe(privateTopic, handleWsNotification);
      }
    };
  }, [isSignedIn, deviceId, user?.id]);

  useEffect(() => {
    if (!isSignedIn) {
      setNotifications([]);
      Notifications.setBadgeCountAsync(0).catch(() => {});
      if (deviceId) {
        api.post('/fcm/token/unregister', { deviceId }).catch(() => {});
      }
    }
  }, [isSignedIn, deviceId]);

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
      if (!isSignedIn) return;
      const response = await api.get('/notifications');
      if (response.data.success) {
        setNotifications(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const targetNotif = notifications.find(n => n.id === id);
      // Optimistic update
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      await api.patch(`/notifications/${id}/read`);
      if (targetNotif?.bookingId) {
        BookingService.markCustomerViewed(targetNotif.bookingId).catch(() => {});
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
      fetchNotifications(); // Revert on fail
    }
  };

  const markAllAsRead = async () => {
    try {
      if (!isSignedIn) return;
      const unreadWithBookings = notifications.filter(n => !n.isRead && n.bookingId);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      await api.patch('/notifications/read-all');
      unreadWithBookings.forEach(n => {
        if (n.bookingId) {
          BookingService.markCustomerViewed(n.bookingId).catch(() => {});
        }
      });
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      fetchNotifications(); // Revert on fail
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    Notifications.setBadgeCountAsync(unreadCount).catch(() => {});
    if (unreadCount === 0) {
      Notifications.setBadgeCountAsync(0).catch(() => {});
      Notifications.dismissAllNotificationsAsync().catch(() => {});
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
      if (!isSignedIn) return;
      setNotifications([]);
      await api.delete('/notifications/clear-all');
    } catch (error) {
      console.error('Failed to clear all notifications:', error);
      fetchNotifications();
    }
  };

  const markBookingNotificationsAsRead = async (bookingId: string) => {
    try {
      const matching = notifications.filter(n => n.bookingId === bookingId && !n.isRead);
      if (matching.length > 0) {
        setNotifications(prev => prev.map(n => n.bookingId === bookingId ? { ...n, isRead: true } : n));
        for (const notif of matching) {
          api.patch(`/notifications/${notif.id}/read`).catch(() => {});
        }
      }
    } catch (error) {
      console.error('Failed to mark booking notifications as read:', error);
    }
  };

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount, expoPushToken, deviceId, markAsRead, markAllAsRead, markBookingNotificationsAsRead, deleteNotification, clearAllNotifications, fetchNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
