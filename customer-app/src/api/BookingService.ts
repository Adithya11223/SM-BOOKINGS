import apiClient from './axios';
import { ApiResponse, PageResponse } from '../types/api';
import { Booking } from '../types/models';
import { BookingStatus } from '../types/enums';

export class BookingService {
  static mapToFrontend(b: any): Booking {
    return {
      ...b,
      bookingNumber: b.bookingNumber || b.reference || b.id || '',
      customerName: b.customer?.name || b.customerName,
      customerPhone: b.customer?.phoneNumber || b.customerPhone,
      type: b.bookingType === 'SALON_VISIT' ? 'salon' : 'home',
      totalPrice: b.totalAmount,
      totalDuration: b.totalDuration,
      date: b.bookingDate || new Date().toISOString(),
      time: b.bookingTime || '00:00',
      status: b.bookingStatus?.toLowerCase() || 'pending',
      items: (b.items || []).map((i: any) => ({
        quantity: i.quantity || 1,
        service: {
          id: i.serviceId,
          name: i.serviceNameSnapshot || 'Service',
          price: i.priceSnapshot || 0,
          duration: i.durationSnapshot || 0,
        }
      })),
    } as Booking;
  }
  static async getBookings(params?: any): Promise<Booking[]> {
    const response = await apiClient.get<ApiResponse<PageResponse<any>>>('/bookings', { params });
    return response.data.data.content.map(this.mapToFrontend);
  }

  static async getBookingById(id: string): Promise<Booking> {
    const response = await apiClient.get<ApiResponse<any>>(`/bookings/${id}`);
    return this.mapToFrontend(response.data.data);
  }

  static async getBookingByReference(reference: string): Promise<Booking> {
    const response = await apiClient.get<ApiResponse<any>>(`/bookings/reference/${reference}`);
    return this.mapToFrontend(response.data.data);
  }

  static async getBookingsByReferences(references: string[]): Promise<Booking[]> {
    const response = await apiClient.post<ApiResponse<any[]>>(`/bookings/bulk-references`, references);
    return response.data.data.map(this.mapToFrontend);
  }

  static mapToBackend(booking: any) {
    return {
      customerName: booking.customerName,
      customerPhoneNumber: booking.customerPhone,
      customerEmail: booking.customerEmail || 'customer@example.com',
      bookingType: booking.type === 'salon' ? 'SALON_VISIT' : 'HOME_SERVICE',
      bookingDate: booking.date.split('T')[0],
      bookingTime: booking.time,
      notes: booking.notes,
      address: booking.address,
      googleMapsLink: booking.googleMapsLink,
      eventType: booking.eventType,
      peopleCount: booking.peopleCount,
      items: booking.items.map((item: any) => ({
        serviceId: item.service.id,
        quantity: item.quantity
      })),
      deviceId: booking.deviceId
    };
  }

  static async createBooking(booking: Partial<any>): Promise<Booking> {
    const response = await apiClient.post<ApiResponse<any>>('/bookings', this.mapToBackend(booking));
    return this.mapToFrontend(response.data.data);
  }

  static async updateBookingStatus(id: string, status: BookingStatus): Promise<Booking> {
    const response = await apiClient.patch<ApiResponse<any>>(`/bookings/${id}/status`, { bookingStatus: status.toUpperCase() });
    return this.mapToFrontend(response.data.data);
  }
}
