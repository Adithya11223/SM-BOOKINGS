import { NavigatorScreenParams } from '@react-navigation/native';
import { Service, MakeupService } from '../types';

export type MainTabParamList = {
  Home: undefined;
  MyBookings: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  VisitSalon: undefined;
  HomeMakeup: undefined;
  ServiceDetails: { service: Service | MakeupService };
  Cart: undefined;
  SalonBookingForm: undefined;
  EventMakeupBookingForm: undefined;
  BookingSuccess: { bookingId: string };
  BookingDetails: { bookingId: string };
};
