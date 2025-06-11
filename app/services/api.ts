import axios from 'axios';

// API base configuration
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      // Redirect to login or refresh token
    }
    return Promise.reject(error);
  }
);

// API endpoints configuration
export const endpoints = {
  fleet: {
    vehicles: '/api/fleet/vehicles',
    drivers: '/api/fleet/drivers',
    routes: '/api/fleet/routes',
  },
  charging: {
    stations: '/api/charging/stations',
    sessions: '/api/charging/sessions',
    schedules: '/api/charging/schedules',
  },
  telematics: {
    data: '/api/telematics/data',
    events: '/api/telematics/events',
  },
  analytics: {
    dashboard: '/api/analytics/dashboard',
    reports: '/api/analytics/reports',
    metrics: '/api/analytics/metrics',
  },
  battery: {
    health: '/api/battery/health',
    predictions: '/api/battery/predictions',
  },
};

// API service functions
export const api = {
  get: <T>(url: string) => apiClient.get<T>(url).then((res) => res.data),
  post: <T>(url: string, data: any) => apiClient.post<T>(url, data).then((res) => res.data),
  put: <T>(url: string, data: any) => apiClient.put<T>(url, data).then((res) => res.data),
  delete: <T>(url: string) => apiClient.delete<T>(url).then((res) => res.data),
}; 