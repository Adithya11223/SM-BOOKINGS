import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';

// Navigators
import { TabNavigator } from './TabNavigator';
import { AuthNavigator } from './AuthNavigator';

import { useAuth } from '../context/AuthContext';
import * as Notifications from 'expo-notifications';

// Screens
import SplashScreen from '../screens/SplashScreen';
import VisitSalonScreen from '../screens/VisitSalonScreen';
import HomeMakeupScreen from '../screens/HomeMakeupScreen';
import ServiceDetailsScreen from '../screens/ServiceDetailsScreen';
import CartScreen from '../screens/CartScreen';
import SalonBookingFormScreen from '../screens/booking/SalonBookingFormScreen';
import EventMakeupBookingFormScreen from '../screens/booking/EventMakeupBookingFormScreen';
import BookingSuccessScreen from '../screens/booking/BookingSuccessScreen';
import BookingDetailsScreen from '../screens/BookingDetailsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const navigation = import('@react-navigation/native').then(m => m.useNavigation);
  const response = Notifications.useLastNotificationResponse();
  const [navigatedFromNotif, setNavigatedFromNotif] = React.useState('');

  React.useEffect(() => {
    if (isLoaded && isSignedIn && response && response.notification.request.identifier !== navigatedFromNotif) {
      const data = response.notification.request.content.data;
      if (data?.screen) {
        setNavigatedFromNotif(response.notification.request.identifier);
        import('./navigationRef').then(({ navigate }) => {
          setTimeout(() => {
            navigate(data.screen as any, data.bookingId ? { bookingId: data.bookingId } : undefined);
          }, 500); // Wait for stack to mount
        });
      }
    }
  }, [isLoaded, isSignedIn, response, navigatedFromNotif]);

  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="Splash" 
        component={SplashScreen} 
        options={{ animation: 'fade' }} 
      />

      {isLoaded && isSignedIn ? (
        <>
          <Stack.Screen 
            name="MainTabs" 
            component={TabNavigator} 
            options={{ animation: 'fade' }} 
          />
          
          {/* Feature Screens */}
          <Stack.Screen name="VisitSalon" component={VisitSalonScreen} />
          <Stack.Screen name="HomeMakeup" component={HomeMakeupScreen} />
          <Stack.Screen name="ServiceDetails" component={ServiceDetailsScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          
          {/* Booking Flow */}
          <Stack.Screen 
            name="Cart" 
            component={CartScreen} 
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }} 
          />
          <Stack.Screen name="SalonBookingForm" component={SalonBookingFormScreen} />
          <Stack.Screen name="EventMakeupBookingForm" component={EventMakeupBookingFormScreen} />
          
          {/* Post-Booking */}
          <Stack.Screen 
            name="BookingSuccess" 
            component={BookingSuccessScreen} 
            options={{ gestureEnabled: false, animation: 'fade' }} 
          />
          
          {/* Details */}
          <Stack.Screen name="BookingDetails" component={BookingDetailsScreen} />
        </>
      ) : isLoaded && !isSignedIn ? (
        <Stack.Screen 
          name="Auth" 
          component={AuthNavigator} 
          options={{ animation: 'fade' }} 
        />
      ) : null}
    </Stack.Navigator>
  );
};
