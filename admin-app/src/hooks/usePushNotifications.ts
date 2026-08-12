import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/axios';
import { useAuth } from './useAuth';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string>('');
  const [notification, setNotification] = useState<Notifications.Notification | false>(false);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return; // Only register if logged in

    registerForPushNotificationsAsync().then(token => {
      if (token) {
        setExpoPushToken(token);
        sendPushTokenToBackend(token, user.id);
      }
    });

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response);
      const data = response.notification.request.content.data;
      if (data && data.screen) {
        import('../navigation/navigationRef').then(({ navigationRef }) => {
          if (navigationRef.isReady()) {
            if (data.bookingId) {
              navigationRef.navigate(data.screen as never, { bookingId: data.bookingId } as never);
            } else {
              navigationRef.navigate(data.screen as never);
            }
          }
        });
      }
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [user]); // Re-run if user changes (e.g. logs in)

  const sendPushTokenToBackend = async (token: string, adminId: string) => {
    try {
      const deviceIdStr = await AsyncStorage.getItem('deviceId');
      let deviceId = deviceIdStr;
      if (!deviceId) {
        deviceId = Math.random().toString(36).substring(2, 15);
        await AsyncStorage.setItem('deviceId', deviceId);
      }

      await api.post('/fcm/token', {
        token: token,
        deviceId: deviceId,
        receiverType: 'ADMIN',
        adminId: adminId
      });
      console.log('Admin Push token sent to backend successfully');
    } catch (error) {
      console.error('Failed to send admin push token to backend:', error);
    }
  };

  return {
    expoPushToken,
    notification,
  };
}

async function registerForPushNotificationsAsync() {
  let token;

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
      console.log('Failed to get push token for push notification!');
      return;
    }
    
    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      if (!projectId) {
        throw new Error('Project ID not found');
      }
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log('Expo Push Token:', token);
    } catch (e) {
      console.error('Error getting expo push token', e);
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}
