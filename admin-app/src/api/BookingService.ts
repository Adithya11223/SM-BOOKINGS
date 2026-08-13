import apiClient from './axios';
import { ApiResponse, PageResponse } from '../types/api';
import { Booking } from '../types/models';
import { BookingStatus } from '../types/enums';

export class BookingService {
  static mapToFrontend(b: any): Booking {
    const rawStatus = (b.bookingStatus || b.status || 'PENDING').toString().toLowerCase();
    return {
      ...b,
      bookingNumber: b.bookingNumber || b.reference || b.id || '',
      customerName: b.customerName || b.customer?.name || 'Customer',
      customerPhone: b.customerPhone || b.customer?.phoneNumber || 'N/A',
      type: (b.bookingType === 'SALON_VISIT' || b.type === 'salon') ? 'salon' : 'home',
      totalPrice: b.totalAmount !== undefined ? b.totalAmount : b.totalPrice,
      totalDuration: b.totalDuration,
      date: b.bookingDate || b.date || new Date().toISOString(),
      time: b.bookingTime || b.time || '00:00',
      status: rawStatus,
      bookingStatus: rawStatus,
      items: (b.items || []).map((i: any) => ({
        id: i.id,
        quantity: i.quantity || 1,
        service: {
          id: i.serviceId || i.service?.id || i.id,
          name: i.serviceNameSnapshot || i.service?.name || 'Service',
          price: i.priceSnapshot || i.service?.price || 0,
          duration: i.durationSnapshot || i.service?.duration || 0,
        }
      })),
      hasUnreadAdminUpdates: b.hasUnreadAdminUpdates,
      hasUnreadCustomerUpdates: b.hasUnreadCustomerUpdates,
      createdAt: b.createdAt,
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

  static async createBooking(booking: Partial<Booking>): Promise<Booking> {
    const response = await apiClient.post<ApiResponse<any>>('/bookings', booking);
    return this.mapToFrontend(response.data.data);
  }

  static async updateBookingStatus(id: string, status: BookingStatus): Promise<Booking> {
    const response = await apiClient.patch<ApiResponse<any>>(`/bookings/${id}/status`, { bookingStatus: status.toUpperCase() });
    return this.mapToFrontend(response.data.data);
  }

  static async partialAcceptBooking(id: string, acceptedServiceIds: string[]): Promise<Booking> {
    const response = await apiClient.patch<ApiResponse<any>>(`/bookings/${id}/partial-accept`, acceptedServiceIds);
    return this.mapToFrontend(response.data.data);
  }

  static async deleteBooking(id: string): Promise<void> {
    await apiClient.delete(`/bookings/${id}`);
  }

  static async markAdminViewed(id: string): Promise<void> {
    await apiClient.patch(`/bookings/${id}/mark-admin-read`);
  }
}
