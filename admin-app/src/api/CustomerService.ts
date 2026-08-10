import apiClient from './axios';
import { ApiResponse, PageResponse } from '../types/api';

export class CustomerService {
  static async getCustomers(params?: any): Promise<any[]> {
    const response = await apiClient.get<ApiResponse<PageResponse<any>>>('/customers', { params });
    return response.data.data.content;
  }
}
