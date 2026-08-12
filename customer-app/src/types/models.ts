import { BookingStatus, BookingType, MakeupType } from './enums';

export interface Category {
  id: string;
  name: string;
  icon: string; // Material Icon name
}

export interface Service {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  duration: number; // minutes
  price: number;
  imageUrl?: string;
  inclusions: string[];
  visible?: boolean; // For admin toggle
  type?: 'event' | 'salon' | string; // For backend mapping
}

export interface MakeupService extends Service {
  makeupType?: MakeupType;
}

export interface CartItem {
  service: Service | MakeupService;
  quantity: number;
}

export interface Booking {
  id: string;
  bookingNumber?: string;
  type: BookingType;
  items: CartItem[];
  totalPrice: number;
  totalDuration: number;
  date: string; // ISO string
  time: string; // HH:mm formatted string
  status: BookingStatus;
  
  // Salon specific
  customerName: string;
  customerPhone: string;
  notes?: string;
  
  // Event specific
  eventType?: string;
  address?: string;
  googleMapsLink?: string;
  peopleCount?: number;
  
  hasUnreadAdminUpdates?: boolean;
  hasUnreadCustomerUpdates?: boolean;
}

export interface BusinessSettings {
  businessName: string;
  tagline: string;
  phoneNumber: string;
  whatsappNumber: string;
  address: string;
  openingTime: string;
  closingTime: string;
  instagram: string;
  facebook: string;
  description: string;
  logoUrl?: string;
  coverImageUrl?: string;
  ownerName?: string;
  ownerTitle?: string;
  youtube?: string;
  threads?: string;
  isShopOpen?: boolean;
  isServiceOpen?: boolean;
  adImageUrl?: string;
}
