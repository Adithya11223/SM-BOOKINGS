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
}

export interface MakeupService extends Service {
  type: MakeupType;
}

export interface CartItem {
  service: Service | MakeupService;
  quantity: number;
}

export interface Booking {
  id: string;
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
  venueAddress?: string;
  mapLink?: string;
  numberOfPeople?: number;
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
