import apiClient from './axios';
import { ApiResponse, PageResponse } from '../types/api';
import { Service } from '../types/models';

export class ServiceService {
  static mapToFrontend(s: any): Service {
    return {
      ...s,
      duration: s.durationMinutes,
      categoryId: s.category === 'HAIR' ? 'cat-1' : s.category === 'FACE' ? 'cat-2' : s.category === 'NAILS' ? 'cat-3' : s.category === 'SPA' ? 'cat-4' : 'cat-2',
      type: s.type === 'HOME_SERVICE' ? 'event' : 'salon',
      visible: s.isVisible
    } as Service;
  }

  static mapToBackend(service: Partial<any>) {
    return {
      name: service.name,
      description: service.description,
      price: service.price,
      durationMinutes: service.duration,
      imageUrl: service.imageUrl,
      category: service.categoryId === 'cat-1' ? 'HAIR' : service.categoryId === 'cat-2' ? 'FACE' : service.categoryId === 'cat-3' ? 'NAILS' : service.categoryId === 'cat-4' ? 'SPA' : 'MAKEUP',
      type: service.type === 'party' || service.type === 'event' ? 'HOME_SERVICE' : 'SALON_VISIT'
    };
  }

  static async getAllServices(params?: any): Promise<Service[]> {
    const response = await apiClient.get<ApiResponse<PageResponse<any>>>('/services', { params });
    return response.data.data.content.map(this.mapToFrontend);
  }

  static async getServiceById(id: string): Promise<Service> {
    const response = await apiClient.get<ApiResponse<any>>(`/services/${id}`);
    return this.mapToFrontend(response.data.data);
  }

  static async createService(service: Partial<Service>): Promise<Service> {
    const response = await apiClient.post<ApiResponse<any>>('/services', this.mapToBackend(service));
    return this.mapToFrontend(response.data.data);
  }

  static async updateService(id: string, service: Partial<Service>): Promise<Service> {
    const payload = {
      ...this.mapToBackend(service),
      isVisible: service.visible !== undefined ? service.visible : true,
      displayOrder: 0
    };
    const response = await apiClient.put<ApiResponse<any>>(`/services/${id}`, payload);
    return this.mapToFrontend(response.data.data);
  }

  static async deleteService(id: string): Promise<void> {
    await apiClient.delete(`/services/${id}`);
  }

  static async toggleVisibility(id: string, isVisible: boolean): Promise<Service> {
    const response = await apiClient.patch<ApiResponse<any>>(`/services/${id}/visibility`, null, {
      params: { isVisible },
    });
    return this.mapToFrontend(response.data.data);
  }
}
