import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://sm-bookings.onrender.com/api/v1';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error fetching token from SecureStore', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle Errors (e.g., 401 Unauthorized)
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response) {
      const { status } = error.response;
      
      // Auto-logout if token is expired or unauthorized
      if (status === 401) {
        console.warn('Unauthorized access. Token may be expired.');
        await SecureStore.deleteItemAsync('auth_token');
        // A global navigation or event emission to force re-login could be added here
      }
    } else if (error.request) {
      // Network Error or Timeout
      console.error('Network Error or Timeout', error.request);
    } else {
      console.error('Error configuring Axios request', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
