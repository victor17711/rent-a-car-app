import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'https://drivemate-11.preview.emergentagent.com';

export const getAuthToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem('session_token');
};

export const setAuthToken = async (token: string): Promise<void> => {
  await AsyncStorage.setItem('session_token', token);
};

export const removeAuthToken = async (): Promise<void> => {
  await AsyncStorage.removeItem('session_token');
};

const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = await getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_URL}/api${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || 'Request failed');
  }
  
  return response.json();
};

export const api = {
  // Auth
  exchangeSession: (sessionId: string) => 
    apiCall('/auth/session', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId }),
    }),
  
  getMe: () => apiCall('/auth/me'),
  
  logout: () => apiCall('/auth/logout', { method: 'POST' }),
  
  // Cars
  getCars: (filters?: Record<string, any>) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const queryString = params.toString();
    return apiCall(`/cars${queryString ? `?${queryString}` : ''}`);
  },
  
  getCar: (carId: string) => apiCall(`/cars/${carId}`),
  
  calculatePrice: (data: {
    car_id: string;
    start_date: string;
    end_date: string;
    start_time: string;
    end_time: string;
    location: string;
    insurance: string;
  }) => apiCall('/calculate-price', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  // Bookings
  createBooking: (data: {
    car_id: string;
    start_date: string;
    end_date: string;
    start_time: string;
    end_time: string;
    location: string;
    insurance: string;
  }) => apiCall('/bookings', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  getMyBookings: () => apiCall('/bookings'),
  
  // Admin
  createCar: (data: any) => apiCall('/admin/cars', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  updateCar: (carId: string, data: any) => apiCall(`/admin/cars/${carId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  deleteCar: (carId: string) => apiCall(`/admin/cars/${carId}`, {
    method: 'DELETE',
  }),
  
  getAllBookings: (status?: string) => {
    const params = status ? `?status=${status}` : '';
    return apiCall(`/admin/bookings${params}`);
  },
  
  updateBookingStatus: (bookingId: string, status: string) => 
    apiCall(`/admin/bookings/${bookingId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
  
  makeAdmin: () => apiCall('/admin/make-admin', { method: 'POST' }),
  
  // Partner Requests
  submitPartnerRequest: (data: {
    name: string;
    email: string;
    phone: string;
    company?: string;
    message: string;
  }) => apiCall('/partner-request', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  getPartnerRequests: (status?: string) => {
    const params = status ? `?status=${status}` : '';
    return apiCall(`/admin/partner-requests${params}`);
  },
  
  updatePartnerRequestStatus: (requestId: string, status: string) =>
    apiCall(`/admin/partner-requests/${requestId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
  
  getAdminStats: () => apiCall('/admin/stats'),
  
  // Seed
  seedData: () => apiCall('/seed', { method: 'POST' }),
};
