import api from './axios';

export interface ReviewResponse {
  id: string;
  rating: number;
  comment?: string;
  customerId: string;
  customerName: string;
  serviceId: string;
  bookingId: string;
  createdAt: string;
}

export interface ServiceRatingSummary {
  serviceId: string;
  averageRating: number;
  reviewCount: number;
}

export const submitReview = async (data: {
  bookingId: string;
  serviceId: string;
  rating: number;
  comment?: string;
}): Promise<ReviewResponse> => {
  const response = await api.post('/reviews', data);
  return response.data.data;
};

export const getServiceReviews = async (serviceId: string): Promise<ReviewResponse[]> => {
  const response = await api.get(`/services/${serviceId}/reviews`);
  return response.data.data;
};

export const getServiceRatingSummary = async (serviceId: string): Promise<ServiceRatingSummary> => {
  const response = await api.get(`/services/${serviceId}/rating-summary`);
  return response.data.data;
};
