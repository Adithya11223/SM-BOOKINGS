import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';
import { theme } from '../../theme';
import { AdminRootStackParamList } from './AdminTypes';

import { AdminTabNavigator } from './AdminTabNavigator';
import AdminBookingDetailsScreen from '../../screens/admin/AdminBookingDetailsScreen';
import ServiceFormScreen from '../../screens/admin/ServiceFormScreen';
import BookingHistoryScreen from '../../screens/admin/BookingHistoryScreen';
import NotificationsScreen from '../../screens/admin/NotificationsScreen';
import AdminLoginScreen from '../../screens/admin/AdminLoginScreen';
import { useAuth } from '../../hooks/useAuth';
import * as Notifications from 'expo-notifications';

const Stack = createNativeStackNavigator<AdminRootStackParamList & { AdminLogin: undefined }>();

export const AdminRootNavigator = () => {
  const { user, isLoading } = useAuth();
  const response = Notifications.useLastNotificationResponse();
  const [navigatedFromNotif, setNavigatedFromNotif] = React.useState('');

  React.useEffect(() => {
    if (user && response && response.notification.request.identifier !== navigatedFromNotif) {
      const data = response.notification.request.content.data;
      if (data?.screen) {
        setNavigatedFromNotif(response.notification.request.identifier);
        const { navigate } = require('../navigationRef');
        setTimeout(() => {
          navigate(data.screen as any, data.bookingId ? { bookingId: data.bookingId } : undefined);
        }, 500); // Wait for stack to mount
      }
    }
  }, [user, response, navigatedFromNotif]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {!user ? (
        <Stack.Screen name="AdminLogin" component={AdminLoginScreen} options={{ animation: 'fade' }} />
      ) : (
        <>
          <Stack.Screen 
            name="AdminMainTabs" 
            component={AdminTabNavigator} 
            options={{ animation: 'fade' }} 
          />
          <Stack.Screen name="AdminBookingDetails" component={AdminBookingDetailsScreen} />
          <Stack.Screen name="ServiceForm" component={ServiceFormScreen} options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="BookingHistory" component={BookingHistoryScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

