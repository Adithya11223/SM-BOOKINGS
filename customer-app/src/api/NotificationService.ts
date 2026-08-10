import apiClient from './axios';
import { ApiResponse } from '../types/api';

export class NotificationService {
  static async getNotifications(bookingId: string): Promise<any[]> {
    const response = await apiClient.get<ApiResponse<any[]>>('/notifications', { params: { bookingId } });
    return response.data.data;
  }

  static async markAsRead(id: string): Promise<void> {
    await apiClient.patch(`/notifications/${id}/read`);
  }
}
