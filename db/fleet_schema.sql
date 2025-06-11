-- Fleet and Vehicle Management Schema

-- Fleets table
CREATE TABLE fleets (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Vehicles table
CREATE TABLE vehicles (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    fleet_id uuid NOT NULL REFERENCES fleets(id) ON DELETE CASCADE,
    vin VARCHAR(17) NOT NULL UNIQUE,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    license_plate VARCHAR(20),
    status vehicle_status NOT NULL DEFAULT 'available',
    battery_capacity_kwh DECIMAL(10,2) NOT NULL,
    current_battery_level INTEGER CHECK (current_battery_level BETWEEN 0 AND 100),
    last_known_location GEOGRAPHY(POINT, 4326),
    last_updated_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Vehicle telematics table (partitioned by month)
CREATE TABLE vehicle_telematics (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    speed_kph DECIMAL(10,2),
    heading DECIMAL(10,2),
    battery_level INTEGER CHECK (battery_level BETWEEN 0 AND 100),
    battery_temperature DECIMAL(10,2),
    power_consumption_kw DECIMAL(10,2),
    odometer_km DECIMAL(10,2),
    status vehicle_status NOT NULL,
    additional_data JSONB DEFAULT '{}'
) PARTITION BY RANGE (timestamp);

-- Create partitions for the current month and next month
CREATE TABLE vehicle_telematics_y2024m04 PARTITION OF vehicle_telematics
    FOR VALUES FROM ('2024-04-01') TO ('2024-05-01');
CREATE TABLE vehicle_telematics_y2024m05 PARTITION OF vehicle_telematics
    FOR VALUES FROM ('2024-05-01') TO ('2024-06-01');

-- Maintenance records table
CREATE TABLE maintenance_records (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    description TEXT,
    scheduled_date TIMESTAMPTZ,
    completed_date TIMESTAMPTZ,
    cost DECIMAL(10,2),
    provider VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Add triggers for updated_at
CREATE TRIGGER update_fleets_updated_at
    BEFORE UPDATE ON fleets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at
    BEFORE UPDATE ON vehicles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_records_updated_at
    BEFORE UPDATE ON maintenance_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX idx_vehicles_fleet_id ON vehicles(fleet_id);
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_last_known_location USING GIST(last_known_location);
CREATE INDEX idx_vehicle_telematics_vehicle_id ON vehicle_telematics(vehicle_id);
CREATE INDEX idx_vehicle_telematics_timestamp ON vehicle_telematics(timestamp);
CREATE INDEX idx_vehicle_telematics_location USING GIST(location);

-- Create view for active vehicles with their latest telematics
CREATE OR REPLACE VIEW active_vehicles_status AS
SELECT 
    v.id,
    v.fleet_id,
    v.vin,
    v.make,
    v.model,
    v.status,
    v.current_battery_level,
    v.last_known_location,
    vt.timestamp as last_telemetry_timestamp,
    vt.speed_kph,
    vt.power_consumption_kw
FROM vehicles v
LEFT JOIN LATERAL (
    SELECT *
    FROM vehicle_telematics
    WHERE vehicle_id = v.id
    ORDER BY timestamp DESC
    LIMIT 1
) vt ON true
WHERE v.is_active = true; 