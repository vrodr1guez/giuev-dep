-- Migration: 003 Charging Infrastructure Schema
-- Description: Creates tables for managing EV charging stations and related data

BEGIN;

-- Create enum types
CREATE TYPE charging_connector_type AS ENUM ('CCS1', 'CCS2', 'CHAdeMO', 'Type1', 'Type2', 'GBT', 'NACS', 'Other');
CREATE TYPE charging_station_status AS ENUM ('active', 'maintenance', 'offline', 'planned');
CREATE TYPE connector_status AS ENUM ('available', 'occupied', 'reserved', 'out_of_service', 'faulted');
CREATE TYPE charging_session_status AS ENUM ('in_progress', 'completed', 'stopped', 'faulted');
CREATE TYPE charging_schedule_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');

-- Charging stations table
CREATE TABLE charging_stations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location_description VARCHAR(255),
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    location_id INTEGER REFERENCES locations(id),
    is_public BOOLEAN DEFAULT TRUE,
    status charging_station_status DEFAULT 'active',
    commissioning_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Charging connectors table
CREATE TABLE charging_connectors (
    id SERIAL PRIMARY KEY,
    charging_station_id INTEGER NOT NULL REFERENCES charging_stations(id) ON DELETE CASCADE,
    connector_type charging_connector_type NOT NULL,
    max_power_kw DECIMAL(8, 2) NOT NULL,
    connector_number INTEGER NOT NULL,
    status connector_status DEFAULT 'available',
    last_status_update TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (charging_station_id, connector_number)
);

-- Charging tariffs table
CREATE TABLE charging_tariffs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    charging_station_id INTEGER REFERENCES charging_stations(id),
    base_fee DECIMAL(10, 2),
    per_kwh_fee DECIMAL(10, 4),
    per_minute_fee DECIMAL(10, 4),
    idle_fee_per_minute DECIMAL(10, 4),
    currency VARCHAR(3) DEFAULT 'USD',
    time_restrictions JSONB,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Time-of-use electricity rates
CREATE TABLE electricity_rates (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    location_id INTEGER REFERENCES locations(id),
    rate_name VARCHAR(100) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    weekdays INTEGER[] NOT NULL, -- Array of days (1=Monday, 7=Sunday)
    rate_per_kwh DECIMAL(10, 4) NOT NULL,
    demand_charge_per_kw DECIMAL(10, 4),
    currency VARCHAR(3) DEFAULT 'USD',
    valid_from DATE NOT NULL,
    valid_to DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Charging sessions table
CREATE TABLE charging_sessions (
    id SERIAL PRIMARY KEY,
    session_uid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    charging_station_id INTEGER NOT NULL REFERENCES charging_stations(id),
    connector_id INTEGER NOT NULL REFERENCES charging_connectors(id),
    vehicle_id INTEGER REFERENCES vehicles(id),
    driver_id INTEGER REFERENCES drivers(id),
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    auth_method VARCHAR(50),
    meter_start_kwh DECIMAL(12, 4) NOT NULL,
    meter_end_kwh DECIMAL(12, 4),
    energy_delivered_kwh DECIMAL(12, 4),
    duration_minutes INTEGER,
    tariff_id INTEGER REFERENCES charging_tariffs(id),
    total_cost DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'USD',
    status charging_session_status DEFAULT 'in_progress',
    stop_reason VARCHAR(50),
    transaction_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Charging schedule for smart charging
CREATE TABLE charging_schedules (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER NOT NULL REFERENCES vehicles(id),
    charging_station_id INTEGER REFERENCES charging_stations(id),
    connector_id INTEGER REFERENCES charging_connectors(id),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    target_soc_percent DECIMAL(5, 2) NOT NULL,
    is_optimized BOOLEAN DEFAULT FALSE,
    priority INTEGER DEFAULT 3,
    max_charging_power_kw DECIMAL(8, 2),
    status charging_schedule_status DEFAULT 'scheduled',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Charging profile intervals (power allocation over time)
CREATE TABLE charging_profile_intervals (
    id SERIAL PRIMARY KEY,
    charging_schedule_id INTEGER NOT NULL REFERENCES charging_schedules(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_seconds INTEGER NOT NULL,
    charging_power_kw DECIMAL(8, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Smart charging groups (for load balancing across multiple stations)
CREATE TABLE smart_charging_groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    max_group_power_kw DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Relationship between charging stations and smart charging groups
CREATE TABLE charging_station_groups (
    charging_station_id INTEGER NOT NULL REFERENCES charging_stations(id) ON DELETE CASCADE,
    charging_group_id INTEGER NOT NULL REFERENCES smart_charging_groups(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (charging_station_id, charging_group_id)
);

-- Charging station energy metrics
CREATE TABLE charging_station_metrics (
    id SERIAL PRIMARY KEY,
    charging_station_id INTEGER NOT NULL REFERENCES charging_stations(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    total_energy_kwh DECIMAL(12, 4) NOT NULL,
    active_power_kw DECIMAL(10, 2),
    power_factor DECIMAL(5, 2),
    voltage DECIMAL(8, 2),
    current DECIMAL(8, 2),
    frequency DECIMAL(6, 2),
    temperature DECIMAL(6, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_charging_sessions_vehicle_id ON charging_sessions(vehicle_id);
CREATE INDEX idx_charging_sessions_start_time ON charging_sessions(start_time);
CREATE INDEX idx_charging_connectors_status ON charging_connectors(status);
CREATE INDEX idx_charging_stations_organization ON charging_stations(organization_id);
CREATE INDEX idx_charging_stations_location ON charging_stations(location_id);
CREATE INDEX idx_charging_schedules_time ON charging_schedules(start_time, end_time);
CREATE INDEX idx_charging_profile_intervals_schedule ON charging_profile_intervals(charging_schedule_id);

-- Views
CREATE OR REPLACE VIEW v_active_charging_sessions AS
SELECT 
    cs.id, 
    cs.session_uid,
    cs.charging_station_id,
    cst.name AS station_name,
    cs.connector_id,
    cc.connector_type,
    cs.vehicle_id,
    cs.start_time,
    EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - cs.start_time))/60 AS duration_minutes,
    cs.meter_start_kwh,
    cs.status
FROM 
    charging_sessions cs
JOIN 
    charging_stations cst ON cs.charging_station_id = cst.id
JOIN 
    charging_connectors cc ON cs.connector_id = cc.id
WHERE 
    cs.status = 'in_progress';

CREATE OR REPLACE VIEW v_station_availability AS
SELECT 
    cs.id AS station_id,
    cs.name AS station_name,
    cs.status AS station_status,
    COUNT(cc.id) AS total_connectors,
    SUM(CASE WHEN cc.status = 'available' THEN 1 ELSE 0 END) AS available_connectors,
    SUM(CASE WHEN cc.status = 'occupied' THEN 1 ELSE 0 END) AS occupied_connectors,
    SUM(CASE WHEN cc.status IN ('out_of_service', 'faulted') THEN 1 ELSE 0 END) AS unavailable_connectors
FROM 
    charging_stations cs
LEFT JOIN 
    charging_connectors cc ON cs.id = cc.charging_station_id
GROUP BY 
    cs.id, cs.name, cs.status;

-- Extension for spatial operations
-- CREATE EXTENSION IF NOT EXISTS postgis;
-- ALTER TABLE charging_stations ADD COLUMN geom geometry(Point, 4326);
-- UPDATE charging_stations SET geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326);
-- CREATE INDEX idx_charging_stations_geom ON charging_stations USING GIST(geom);

COMMIT; 