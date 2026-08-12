import { NavigatorScreenParams } from '@react-navigation/native';
import { Service, MakeupService } from '../../types';

export type AdminTabParamList = {
  AdminDashboard: undefined;
  AdminBookings: undefined;
  AdminServices: undefined;
  BusinessSettings: undefined;
};

export type AdminRootStackParamList = {
  AdminMainTabs: NavigatorScreenParams<AdminTabParamList>;
  AdminBookingDetails: { bookingId: string };
  ServiceForm: { service?: Service | MakeupService; defaultType?: 'salon' | 'event' }; // Undefined means Add, provided means Edit
  BookingHistory: { 
    initialStatus?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'active' | 'all';
    initialFromDate?: string; 
    initialToDate?: string;
  } | undefined;
  Notifications: undefined;
};
