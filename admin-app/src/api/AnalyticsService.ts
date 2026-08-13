import apiClient from './axios';
import { ApiResponse } from '../types/api';

export interface DailyRevenue {
  dateStr: string;
  dayLabel: string;
  revenue: number;
}

export interface PopularService {
  serviceId: string;
  serviceName: string;
  bookingCount: number;
  revenueGenerated: number;
}

export interface AdminAnalyticsOverview {
  todayRevenue: number;
  currentWeekRevenue: number;
  currentMonthRevenue: number;
  previousMonthRevenue: number;

  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;

  completionRate: number;
  cancellationRate: number;

  totalCustomers: number;
  customersWithCompletedBookings: number;
  repeatCustomers: number;

  revenueTrend: DailyRevenue[];
  popularServices: PopularService[];
}

export class AnalyticsService {
  static async getOverview(): Promise<AdminAnalyticsOverview> {
    const response = await apiClient.get<ApiResponse<AdminAnalyticsOverview>>('/admin/analytics/overview');
    return response.data.data;
  }
}
