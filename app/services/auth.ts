import { api, endpoints } from './api';

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'operator' | 'driver';
  name: string;
  permissions: string[];
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const response = await api.post<AuthResponse>('/api/auth/login', credentials);
      localStorage.setItem('auth_token', response.token);
      this.currentUser = response.user;
      return response.user;
    } catch (error) {
      throw new Error('Login failed. Please check your credentials.');
    }
  }

  async logout(): Promise<void> {
    try {
      await api.post('/api/auth/logout', {});
      localStorage.removeItem('auth_token');
      this.currentUser = null;
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    if (this.currentUser) {
      return this.currentUser;
    }

    const token = localStorage.getItem('auth_token');
    if (!token) {
      return null;
    }

    try {
      const user = await api.get<User>('/api/auth/me');
      this.currentUser = user;
      return user;
    } catch (error) {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  hasPermission(permission: string): boolean {
    return this.currentUser?.permissions.includes(permission) ?? false;
  }

  hasRole(role: string): boolean {
    return this.currentUser?.role === role;
  }
}

export const authService = AuthService.getInstance(); 