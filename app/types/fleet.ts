import { Organization } from './organization';
import { BaseEntity, ApiResponse, PaginatedResponse, FleetType, Vehicle } from './base';

// Base Fleet interface
export interface FleetBase {
  name: string;
  description?: string;
  type: FleetType;
  isActive: boolean;
}

// Fleet creation DTO
export interface FleetCreate extends FleetBase {
  organizationId: number;
}

// Fleet update DTO
export interface FleetUpdate extends Partial<FleetBase> {}

// Fleet with ID and audit fields
export interface FleetWithId extends FleetBase, BaseEntity {
  organizationId: number;
}

// Complete Fleet with relationships
export interface Fleet extends FleetWithId {
  organization?: Organization;
  vehicles?: Vehicle[];
}

// API response types
export type FleetResponse = ApiResponse<Fleet>;
export type FleetsResponse = PaginatedResponse<Fleet>; 