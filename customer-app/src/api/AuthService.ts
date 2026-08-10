import apiClient from './axios';
import { ApiResponse } from '../types/api';

export interface AuthResponse {
  token: string;
  type: string;
  name: string;
  email: string;
  role: string;
}

export class AuthService {
  static async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', {
      email,
      password,
    });
    return response.data.data;
  }

  static async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  }
}
