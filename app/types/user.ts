import { Organization } from './organization';

// Base User interface
export interface UserBase {
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'driver' | 'viewer';
  isActive: boolean;
}

// User creation DTO
export interface UserCreate extends UserBase {
  password: string;
  organizationId: number;
}

// User update DTO
export interface UserUpdate extends Partial<UserBase> {
  password?: string;
}

// User with ID
export interface UserWithId extends UserBase {
  id: number;
  organizationId: number;
  createdAt: string;
  updatedAt: string;
}

// Complete User with relationships
export interface User extends UserWithId {
  organization?: Organization;
}

// API response types
export interface UserResponse {
  data: User;
  error?: string;
}

export interface UsersResponse {
  data: User[];
  error?: string;
  total: number;
  page: number;
  pageSize: number;
} 