-- Migration: 002 Fleet Management Schema
-- Description: Creates tables for managing EV fleets, vehicles, and drivers

BEGIN;

-- Create enum types
CREATE TYPE vehicle_status AS ENUM ('active', 'maintenance', 'retired', 'pending');
CREATE TYPE driver_status AS ENUM ('active', 'inactive', 'suspended');

-- Fleets table
CREATE TABLE fleets (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    location_id INTEGER REFERENCES locations(id),
    manager_id INTEGER REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (organization_id, name)
);

-- Vehicles table
CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    vin VARCHAR(17) NOT NULL UNIQUE,
    license_plate VARCHAR(20) NOT NULL,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INTEGER NOT NULL CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM CURRENT_DATE) + 1),
    battery_capacity_kwh DECIMAL(8, 2) NOT NULL,
    nominal_range_km DECIMAL(8, 2) NOT NULL,
    telematics_provider_id INTEGER,
    telematics_vehicle_id VARCHAR(100),
    status vehicle_status NOT NULL DEFAULT 'active',
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    fleet_id INTEGER REFERENCES fleets(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Drivers table
CREATE TABLE drivers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    driver_license_number VARCHAR(50),
    driver_license_expiry DATE,
    status driver_status NOT NULL DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Vehicle assignments (which driver is assigned to which vehicle)
CREATE TABLE vehicle_assignments (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    driver_id INTEGER NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE,
    is_primary BOOLEAN DEFAULT TRUE,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_date_range CHECK (end_date IS NULL OR end_date >= start_date)
);

-- Vehicle telematics live data (current state)
CREATE TABLE vehicle_telematics_live (
    vehicle_id INTEGER PRIMARY KEY REFERENCES vehicles(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    speed_kmh DECIMAL(6, 2),
    state_of_charge_percent DECIMAL(5, 2),
    state_of_health_percent DECIMAL(5, 2),
    odometer_km DECIMAL(10, 2),
    is_charging BOOLEAN DEFAULT FALSE,
    ambient_temperature_celsius DECIMAL(5, 2),
    raw_data JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Vehicle telematics history (time series data)
CREATE TABLE vehicle_telematics_history (
    log_id SERIAL PRIMARY KEY,
    vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    speed_kmh DECIMAL(6, 2),
    state_of_charge_percent DECIMAL(5, 2),
    energy_consumed_kwh_since_last DECIMAL(7, 4),
    odometer_km DECIMAL(10, 2),
    diagnostic_trouble_codes TEXT[],
    raw_data JSONB
);

-- Vehicle maintenance records
CREATE TABLE vehicle_maintenance (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    maintenance_type VARCHAR(100) NOT NULL,
    description TEXT,
    service_date DATE NOT NULL,
    odometer_km DECIMAL(10, 2),
    cost DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'USD',
    performed_by VARCHAR(100),
    notes TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Telematics providers
CREATE TABLE telematics_providers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    api_endpoint VARCHAR(255),
    api_key_name VARCHAR(100),
    api_key_value VARCHAR(255),
    api_secret_name VARCHAR(100),
    api_secret_value VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    organization_id INTEGER REFERENCES organizations(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_vehicles_fleet ON vehicles(fleet_id);
CREATE INDEX idx_vehicles_organization ON vehicles(organization_id);
CREATE INDEX idx_drivers_organization ON drivers(organization_id);
CREATE INDEX idx_vehicle_assignments_active ON vehicle_assignments(vehicle_id, driver_id) WHERE end_date IS NULL OR end_date >= CURRENT_DATE;
CREATE INDEX idx_vehicle_telematics_history_vehicle_time ON vehicle_telematics_history(vehicle_id, timestamp);

-- Add foreign key to telematics provider after table creation
ALTER TABLE vehicles 
ADD CONSTRAINT fk_vehicles_telematics_provider 
FOREIGN KEY (telematics_provider_id) 
REFERENCES telematics_providers(id);

COMMIT; 