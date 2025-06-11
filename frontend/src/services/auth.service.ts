import api from './api';
import Cookies from 'js-cookie';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
    organization_id: number;
    roles: string[];
  };
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  organization_id: number;
  roles: string[];
}

// Auth service with login, logout, and user info functions
const AuthService = {
  // Login function
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/login/access-token', data);
    const { access_token } = response.data;
    
    // Store token in cookies
    Cookies.set('auth_token', access_token, { expires: 1 }); // 1 day expiration
    
    return response.data;
  },
  
  // Logout function
  logout: (): void => {
    Cookies.remove('auth_token');
  },
  
  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/users/me');
    return response.data;
  },
  
  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!Cookies.get('auth_token');
  },
};

export default AuthService; 