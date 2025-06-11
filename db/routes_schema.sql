-- Routes and Optimization Schema

-- Routes table
CREATE TABLE routes (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_location GEOGRAPHY(POINT, 4326) NOT NULL,
    end_location GEOGRAPHY(POINT, 4326) NOT NULL,
    estimated_distance_km DECIMAL(10,2),
    estimated_duration_minutes INTEGER,
    energy_requirement_kwh DECIMAL(10,2),
    route_type VARCHAR(50) DEFAULT 'standard',
    schedule_type VARCHAR(50) DEFAULT 'one_time',
    recurring_schedule JSONB,
    status VARCHAR(50) DEFAULT 'planned',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Route assignments table
CREATE TABLE route_assignments (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id uuid NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    vehicle_id uuid NOT NULL REFERENCES vehicles(id),
    driver_id uuid REFERENCES users(id),
    scheduled_start_time TIMESTAMPTZ NOT NULL,
    scheduled_end_time TIMESTAMPTZ NOT NULL,
    actual_start_time TIMESTAMPTZ,
    actual_end_time TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'scheduled',
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Route waypoints table
CREATE TABLE route_waypoints (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id uuid NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    sequence_number INTEGER NOT NULL,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    waypoint_type VARCHAR(50) NOT NULL,
    estimated_arrival_time TIMESTAMPTZ,
    estimated_departure_time TIMESTAMPTZ,
    required_duration_minutes INTEGER,
    charging_station_id uuid REFERENCES charging_stations(id),
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(route_id, sequence_number)
);

-- Route progress tracking table
CREATE TABLE route_progress (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id uuid NOT NULL REFERENCES route_assignments(id) ON DELETE CASCADE,
    waypoint_id uuid NOT NULL REFERENCES route_waypoints(id),
    arrival_time TIMESTAMPTZ,
    departure_time TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'pending',
    actual_duration_minutes INTEGER,
    delay_minutes INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Route optimization history table
CREATE TABLE route_optimizations (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id uuid NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    optimization_type VARCHAR(50) NOT NULL,
    original_route JSONB NOT NULL,
    optimized_route JSONB NOT NULL,
    improvement_metrics JSONB,
    applied BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Add triggers for updated_at
CREATE TRIGGER update_routes_updated_at
    BEFORE UPDATE ON routes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_route_assignments_updated_at
    BEFORE UPDATE ON route_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_route_waypoints_updated_at
    BEFORE UPDATE ON route_waypoints
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_route_progress_updated_at
    BEFORE UPDATE ON route_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX idx_routes_organization_id ON routes(organization_id);
CREATE INDEX idx_routes_start_location USING GIST(start_location);
CREATE INDEX idx_routes_end_location USING GIST(end_location);
CREATE INDEX idx_route_assignments_route_id ON route_assignments(route_id);
CREATE INDEX idx_route_assignments_vehicle_id ON route_assignments(vehicle_id);
CREATE INDEX idx_route_assignments_driver_id ON route_assignments(driver_id);
CREATE INDEX idx_route_waypoints_route_id ON route_waypoints(route_id);
CREATE INDEX idx_route_waypoints_location USING GIST(location);
CREATE INDEX idx_route_waypoints_charging_station_id ON route_waypoints(charging_station_id);
CREATE INDEX idx_route_progress_assignment_id ON route_progress(assignment_id);
CREATE INDEX idx_route_optimizations_route_id ON route_optimizations(route_id);

-- Create view for active routes with progress
CREATE OR REPLACE VIEW active_routes_status AS
SELECT 
    r.id as route_id,
    r.name as route_name,
    ra.id as assignment_id,
    ra.vehicle_id,
    v.vin,
    ra.driver_id,
    u.first_name || ' ' || u.last_name as driver_name,
    ra.scheduled_start_time,
    ra.scheduled_end_time,
    ra.actual_start_time,
    ra.status as assignment_status,
    ra.completion_percentage,
    COUNT(rw.id) as total_waypoints,
    COUNT(rp.id) FILTER (WHERE rp.status = 'completed') as completed_waypoints,
    MAX(rp.arrival_time) as last_waypoint_arrival,
    SUM(rp.delay_minutes) as total_delay_minutes
FROM routes r
JOIN route_assignments ra ON r.id = ra.route_id
JOIN vehicles v ON ra.vehicle_id = v.id
LEFT JOIN users u ON ra.driver_id = u.id
LEFT JOIN route_waypoints rw ON r.id = rw.route_id
LEFT JOIN route_progress rp ON ra.id = rp.assignment_id AND rw.id = rp.waypoint_id
WHERE ra.status IN ('scheduled', 'in_progress')
GROUP BY r.id, r.name, ra.id, ra.vehicle_id, v.vin, ra.driver_id, u.first_name, u.last_name, 
         ra.scheduled_start_time, ra.scheduled_end_time, ra.actual_start_time, ra.status, ra.completion_percentage; 