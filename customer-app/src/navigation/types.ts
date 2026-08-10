import { NavigatorScreenParams } from '@react-navigation/native';
import { Service, MakeupService } from '../types';

export type MainTabParamList = {
  Home: undefined;
  MyBookings: undefined;
  Profile: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: { phoneNumber?: string };
  ResetPassword: { phoneNumber: string };
};

export type RootStackParamList = {
  Splash: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  
  // Feature Screens
  VisitSalon: undefined;
  HomeMakeup: undefined;
  ServiceDetails: { service: Service | MakeupService };
  Notifications: undefined;

  // Booking Flow
  Cart: undefined;
  SalonBookingForm: undefined;
  EventMakeupBookingForm: undefined;
  BookingSuccess: { bookingId: string };
  BookingDetails: { bookingId: string };
};
