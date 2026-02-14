import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'https://hour-selector-24.preview.emergentagent.com';

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
  register: (data: { phone: string; email: string; password: string; name: string }) =>
    apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  login: (data: { phone: string; password: string }) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
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
    customer_name: string;
    customer_phone: string;
    customer_age: number;
  }) => apiCall('/bookings', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  getMyBookings: () => apiCall('/bookings'),
  
  // User Profile
  updateProfilePicture: (picture: string) => apiCall('/users/profile-picture', { 
    method: 'PUT', 
    body: JSON.stringify({ picture }) 
  }),
  
  updateName: (name: string) => apiCall('/users/name', {
    method: 'PUT',
    body: JSON.stringify({ name }),
  }),
  
  updateLanguage: (language: string) => apiCall('/users/language', {
    method: 'PUT',
    body: JSON.stringify({ language }),
  }),
  
  // Favorites
  addFavorite: (carId: string) => apiCall(`/users/favorites/${carId}`, { method: 'POST' }),
  
  removeFavorite: (carId: string) => apiCall(`/users/favorites/${carId}`, { method: 'DELETE' }),
  
  getFavorites: () => apiCall('/users/favorites'),
  
  // FAQ
  getFaqs: () => apiCall('/faqs'),
  
  // Legal Content
  getLegalContent: (type: 'terms' | 'privacy') => apiCall(`/legal/${type}`),
  
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
  
  // Admin FAQ
  createFaq: (data: {
    question_ro: string;
    answer_ro: string;
    question_ru: string;
    answer_ru: string;
    order?: number;
  }) => apiCall('/admin/faqs', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  updateFaq: (faqId: string, data: any) => apiCall(`/admin/faqs/${faqId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  deleteFaq: (faqId: string) => apiCall(`/admin/faqs/${faqId}`, {
    method: 'DELETE',
  }),
  
  // Admin Legal Content
  updateLegalContent: (type: 'terms' | 'privacy', data: {
    content_ro: string;
    content_ru: string;
  }) => apiCall(`/admin/legal/${type}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
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
  
  // Banners
  getBanners: () => apiCall('/banners'),
  
  // Seed
  seedData: () => apiCall('/seed', { method: 'POST' }),
};
