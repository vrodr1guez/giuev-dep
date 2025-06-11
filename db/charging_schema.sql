-- EV Charging Infrastructure Database Schema
-- Updated version with JSONB and modern indexing

-- Enable PostGIS extension for advanced geolocation features
CREATE EXTENSION IF NOT EXISTS postgis;

-- Charging stations table
CREATE TABLE IF NOT EXISTS charging_stations (
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
    organization_id INTEGER NOT NULL,
    provider VARCHAR(100),
    is_public BOOLEAN DEFAULT TRUE,
    operating_hours VARCHAR(100) DEFAULT '24/7',
    contact_phone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'offline', 'planned', 'faulted')),
    commissioning_date DATE,
    power_capacity_kw DECIMAL(8, 2),
    current_load_kw DECIMAL(8, 2) DEFAULT 0,
    availability JSONB DEFAULT '{"totalConnectors": 0, "availableConnectors": 0, "inUseConnectors": 0, "faultedConnectors": 0}'::jsonb,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create a geography column for efficient location queries
SELECT AddGeometryColumn('charging_stations', 'geom', 4326, 'POINT', 2);
CREATE INDEX IF NOT EXISTS idx_charging_stations_geom ON charging_stations USING GIST(geom);

-- Trigger to automatically update the geom column
CREATE OR REPLACE FUNCTION update_geom_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.geom = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_charging_station_geom
BEFORE INSERT OR UPDATE OF latitude, longitude ON charging_stations
FOR EACH ROW
EXECUTE FUNCTION update_geom_column();

-- Charging connectors table
CREATE TABLE IF NOT EXISTS charging_connectors (
    id SERIAL PRIMARY KEY,
    charging_station_id INTEGER NOT NULL REFERENCES charging_stations(id) ON DELETE CASCADE,
    connector_type VARCHAR(50) NOT NULL CHECK (connector_type IN ('CCS1', 'CCS2', 'CHAdeMO', 'Type1', 'Type2', 'Tesla', 'GBT', 'NACS', 'Other')),
    max_power_kw DECIMAL(8, 2) NOT NULL,
    connector_number INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'maintenance', 'out_of_service', 'faulted', 'offline')),
    price_per_kwh DECIMAL(10, 4),
    last_status_update TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    current_session_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (charging_station_id, connector_number)
);

-- Charging tariffs table
CREATE TABLE IF NOT EXISTS charging_tariffs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    organization_id INTEGER NOT NULL,
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
CREATE TABLE IF NOT EXISTS electricity_rates (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL,
    location_id INTEGER,
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
CREATE TABLE IF NOT EXISTS charging_sessions (
    id SERIAL PRIMARY KEY,
    session_uid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    charging_station_id INTEGER NOT NULL REFERENCES charging_stations(id),
    connector_id INTEGER NOT NULL REFERENCES charging_connectors(id),
    vehicle_id INTEGER,
    driver_id INTEGER,
    user_id VARCHAR(100),
    organization_id INTEGER NOT NULL,
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
    status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'stopped', 'faulted')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    stop_reason VARCHAR(50),
    transaction_id VARCHAR(100),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Charging schedule for smart charging
CREATE TABLE IF NOT EXISTS charging_schedules (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER NOT NULL,
    charging_station_id INTEGER REFERENCES charging_stations(id),
    connector_id INTEGER REFERENCES charging_connectors(id),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    target_soc_percent DECIMAL(5, 2) NOT NULL,
    is_optimized BOOLEAN DEFAULT FALSE,
    priority INTEGER DEFAULT 3,
    max_charging_power_kw DECIMAL(8, 2),
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    energy_saved_kwh DECIMAL(8, 2),
    cost_saved DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Charging profile intervals (power allocation over time)
CREATE TABLE IF NOT EXISTS charging_profile_intervals (
    id SERIAL PRIMARY KEY,
    charging_schedule_id INTEGER NOT NULL REFERENCES charging_schedules(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_seconds INTEGER NOT NULL,
    charging_power_kw DECIMAL(8, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Smart charging groups (for load balancing across multiple stations)
CREATE TABLE IF NOT EXISTS smart_charging_groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    organization_id INTEGER NOT NULL,
    max_group_power_kw DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Relationship between charging stations and smart charging groups
CREATE TABLE IF NOT EXISTS charging_station_groups (
    charging_station_id INTEGER NOT NULL REFERENCES charging_stations(id) ON DELETE CASCADE,
    charging_group_id INTEGER NOT NULL REFERENCES smart_charging_groups(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (charging_station_id, charging_group_id)
);

-- Charging station energy metrics
CREATE TABLE IF NOT EXISTS charging_station_metrics (
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

-- Battery health metrics table
CREATE TABLE IF NOT EXISTS battery_health_metrics (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    state_of_health DECIMAL(5, 2) NOT NULL, -- 0-100%
    cycle_count INTEGER,
    internal_resistance DECIMAL(8, 4),
    temperature DECIMAL(5, 2),
    last_deep_discharge TIMESTAMP WITH TIME ZONE,
    maximum_capacity DECIMAL(8, 2), -- kWh
    anomaly_detected BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Driver behavior analytics
CREATE TABLE IF NOT EXISTS driver_analytics (
    id SERIAL PRIMARY KEY,
    driver_id INTEGER NOT NULL,
    vehicle_id INTEGER NOT NULL,
    date DATE NOT NULL,
    efficiency_score DECIMAL(5, 2), -- 0-100%
    harsh_accelerations INTEGER,
    harsh_braking INTEGER,
    average_speed DECIMAL(6, 2), -- km/h
    optimal_speed_adherence DECIMAL(5, 2), -- 0-100%
    regen_braking_usage DECIMAL(5, 2), -- percentage of total braking
    energy_per_km DECIMAL(6, 3), -- kWh/km
    recommendations JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_charging_sessions_vehicle_id ON charging_sessions(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_charging_sessions_start_time ON charging_sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_charging_sessions_connector_id ON charging_sessions(connector_id);
CREATE INDEX IF NOT EXISTS idx_charging_sessions_payment_status ON charging_sessions(payment_status);
CREATE INDEX IF NOT EXISTS idx_charging_connectors_status ON charging_connectors(status);
CREATE INDEX IF NOT EXISTS idx_charging_schedules_time ON charging_schedules(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_charging_profile_intervals_schedule ON charging_profile_intervals(charging_schedule_id);
CREATE INDEX IF NOT EXISTS idx_battery_health_vehicle_id ON battery_health_metrics(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_driver_analytics_driver_id ON driver_analytics(driver_id);

-- Create a GIN index for the JSONB fields for faster searching
CREATE INDEX IF NOT EXISTS idx_charging_stations_metadata ON charging_stations USING GIN (metadata jsonb_path_ops);
CREATE INDEX IF NOT EXISTS idx_charging_sessions_metadata ON charging_sessions USING GIN (metadata jsonb_path_ops);

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
    cs.status,
    cs.payment_status
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
    cs.latitude,
    cs.longitude,
    COUNT(cc.id) AS total_connectors,
    SUM(CASE WHEN cc.status = 'available' THEN 1 ELSE 0 END) AS available_connectors,
    SUM(CASE WHEN cc.status = 'occupied' THEN 1 ELSE 0 END) AS occupied_connectors,
    SUM(CASE WHEN cc.status IN ('maintenance', 'out_of_service', 'faulted', 'offline') THEN 1 ELSE 0 END) AS unavailable_connectors,
    json_build_object(
        'totalConnectors', COUNT(cc.id),
        'availableConnectors', SUM(CASE WHEN cc.status = 'available' THEN 1 ELSE 0 END),
        'inUseConnectors', SUM(CASE WHEN cc.status = 'occupied' THEN 1 ELSE 0 END),
        'faultedConnectors', SUM(CASE WHEN cc.status IN ('maintenance', 'out_of_service', 'faulted', 'offline') THEN 1 ELSE 0 END)
    ) AS availability_json
FROM 
    charging_stations cs
LEFT JOIN 
    charging_connectors cc ON cs.id = cc.charging_station_id
GROUP BY 
    cs.id, cs.name, cs.status, cs.latitude, cs.longitude;

-- Function to update the charging_stations.availability JSONB field
CREATE OR REPLACE FUNCTION update_station_availability()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE charging_stations
    SET availability = (
        SELECT availability_json
        FROM v_station_availability
        WHERE station_id = NEW.charging_station_id
    ),
    updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.charging_station_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update station availability when connector status changes
CREATE TRIGGER update_station_availability_trigger
AFTER INSERT OR UPDATE OF status ON charging_connectors
FOR EACH ROW
EXECUTE FUNCTION update_station_availability(); 