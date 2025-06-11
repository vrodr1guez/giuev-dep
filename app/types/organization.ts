import { User } from './user';
import { Fleet } from './fleet';
import { BaseEntity, ApiResponse, PaginatedResponse } from './base';

// Base Organization interface
export interface OrganizationBase {
  name: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  subscriptionPlan?: string;
  isActive: boolean;
}

// Organization creation DTO
export interface OrganizationCreate extends OrganizationBase {
  // Add any additional fields needed for creation
}

// Organization update DTO
export interface OrganizationUpdate extends Partial<OrganizationBase> {}

// Organization with ID and audit fields
export interface OrganizationWithId extends OrganizationBase, BaseEntity {}

// Complete Organization with relationships
export interface Organization extends OrganizationWithId {
  users?: User[];
  fleets?: Fleet[];
}

// API response types
export type OrganizationResponse = ApiResponse<Organization>;
export type OrganizationsResponse = PaginatedResponse<Organization>; 