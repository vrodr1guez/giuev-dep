-- Routes table
CREATE TABLE routes (
    route_id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(organization_id),
    route_name VARCHAR(255),
    created_by_user_id INTEGER REFERENCES users(user_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Route assignments table
CREATE TABLE route_assignments (
    assignment_id SERIAL PRIMARY KEY,
    route_id INTEGER REFERENCES routes(route_id) ON DELETE CASCADE,
    vehicle_id INTEGER REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
    driver_id INTEGER REFERENCES users(user_id),
    planned_start_time TIMESTAMP WITH TIME ZONE,
    planned_end_time TIMESTAMP WITH TIME ZONE,
    actual_start_time TIMESTAMP WITH TIME ZONE,
    actual_end_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50),
    notes TEXT,
    CONSTRAINT valid_status CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'delayed'))
);

-- Route waypoints table
CREATE TABLE route_waypoints (
    waypoint_id SERIAL PRIMARY KEY,
    route_id INTEGER REFERENCES routes(route_id) ON DELETE CASCADE,
    sequence_order INTEGER NOT NULL,
    location_name VARCHAR(255),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    planned_arrival_time TIMESTAMP WITH TIME ZONE,
    actual_arrival_time TIMESTAMP WITH TIME ZONE,
    planned_departure_time TIMESTAMP WITH TIME ZONE,
    actual_departure_time TIMESTAMP WITH TIME ZONE,
    waypoint_type VARCHAR(50),
    associated_charging_session_id INTEGER REFERENCES charging_sessions(session_id),
    notes TEXT,
    CONSTRAINT valid_waypoint_type CHECK (waypoint_type IN ('pickup', 'delivery', 'charging_stop', 'break', 'depot'))
);

-- Create spatial index for waypoints
CREATE INDEX idx_route_waypoints_location ON route_waypoints 
USING GIST (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326));

-- Create indexes
CREATE INDEX idx_routes_organization ON routes(organization_id);
CREATE INDEX idx_routes_created_by ON routes(created_by_user_id);

CREATE INDEX idx_route_assignments_route ON route_assignments(route_id);
CREATE INDEX idx_route_assignments_vehicle ON route_assignments(vehicle_id);
CREATE INDEX idx_route_assignments_driver ON route_assignments(driver_id);
CREATE INDEX idx_route_assignments_status ON route_assignments(status);
CREATE INDEX idx_route_assignments_times ON route_assignments(planned_start_time, planned_end_time);

CREATE INDEX idx_route_waypoints_route ON route_waypoints(route_id);
CREATE INDEX idx_route_waypoints_sequence ON route_waypoints(route_id, sequence_order);
CREATE INDEX idx_route_waypoints_type ON route_waypoints(waypoint_type);
CREATE INDEX idx_route_waypoints_charging ON route_waypoints(associated_charging_session_id);

-- Create view for active routes with current status
CREATE VIEW active_routes_status AS
SELECT 
    r.route_id,
    r.route_name,
    ra.assignment_id,
    v.license_plate,
    v.make,
    v.model,
    u.first_name || ' ' || u.last_name as driver_name,
    ra.status,
    ra.planned_start_time,
    ra.planned_end_time,
    ra.actual_start_time,
    COALESCE(
        (SELECT rw.location_name 
         FROM route_waypoints rw 
         WHERE rw.route_id = r.route_id 
         AND rw.actual_arrival_time IS NULL 
         ORDER BY rw.sequence_order 
         LIMIT 1),
        'Route Completed'
    ) as next_stop,
    (SELECT COUNT(*) 
     FROM route_waypoints rw 
     WHERE rw.route_id = r.route_id) as total_stops,
    (SELECT COUNT(*) 
     FROM route_waypoints rw 
     WHERE rw.route_id = r.route_id 
     AND rw.actual_arrival_time IS NOT NULL) as completed_stops
FROM routes r
JOIN route_assignments ra ON r.route_id = ra.route_id
JOIN vehicles v ON ra.vehicle_id = v.vehicle_id
LEFT JOIN users u ON ra.driver_id = u.user_id
WHERE ra.status IN ('in_progress', 'pending')
AND ra.planned_start_time >= CURRENT_DATE; 