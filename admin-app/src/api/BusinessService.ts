import apiClient from './axios';
import { ApiResponse } from '../types/api';
import { BusinessSettings } from '../types/models';

export class BusinessService {
  static async getSettings(): Promise<BusinessSettings> {
    const response = await apiClient.get<ApiResponse<BusinessSettings>>('/business');
    return response.data.data;
  }

  static async updateSettings(settings: Partial<BusinessSettings>): Promise<BusinessSettings> {
    const response = await apiClient.put<ApiResponse<BusinessSettings>>('/business', settings);
    return response.data.data;
  }
}
