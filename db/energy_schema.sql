-- Battery and Energy Management Schema

-- Battery health reports table
CREATE TABLE battery_health_reports (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    report_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    state_of_health DECIMAL(5,2) CHECK (state_of_health BETWEEN 0 AND 100),
    capacity_kwh DECIMAL(10,2) NOT NULL,
    internal_resistance DECIMAL(10,4),
    cycle_count INTEGER,
    temperature_stats JSONB,
    degradation_rate DECIMAL(5,2),
    estimated_replacement_date TIMESTAMPTZ,
    recommendations TEXT,
    raw_data JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Energy consumption records table (partitioned by month)
CREATE TABLE energy_consumption_records (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL,
    energy_consumed_kwh DECIMAL(10,2) NOT NULL,
    energy_regenerated_kwh DECIMAL(10,2) DEFAULT 0,
    distance_km DECIMAL(10,2),
    average_speed_kph DECIMAL(10,2),
    temperature_celsius DECIMAL(5,2),
    hvac_power_kw DECIMAL(10,2),
    auxiliary_power_kw DECIMAL(10,2),
    route_id uuid REFERENCES routes(id),
    weather_conditions JSONB,
    additional_data JSONB DEFAULT '{}'
) PARTITION BY RANGE (timestamp);

-- Create partitions for the current month and next month
CREATE TABLE energy_consumption_records_y2024m04 PARTITION OF energy_consumption_records
    FOR VALUES FROM ('2024-04-01') TO ('2024-05-01');
CREATE TABLE energy_consumption_records_y2024m05 PARTITION OF energy_consumption_records
    FOR VALUES FROM ('2024-05-01') TO ('2024-06-01');

-- Energy efficiency analysis table
CREATE TABLE energy_efficiency_analysis (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    analysis_period_start TIMESTAMPTZ NOT NULL,
    analysis_period_end TIMESTAMPTZ NOT NULL,
    total_energy_consumed_kwh DECIMAL(10,2) NOT NULL,
    total_energy_regenerated_kwh DECIMAL(10,2),
    total_distance_km DECIMAL(10,2),
    average_efficiency_kwh_per_km DECIMAL(10,4),
    efficiency_score INTEGER CHECK (efficiency_score BETWEEN 0 AND 100),
    factors_affecting_efficiency JSONB,
    recommendations JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- V2G energy transactions table
CREATE TABLE v2g_energy_transactions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    charging_session_id uuid REFERENCES charging_sessions(id),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    energy_exported_kwh DECIMAL(10,2) NOT NULL,
    revenue_amount DECIMAL(10,2),
    grid_demand_response_id VARCHAR(255),
    transaction_status VARCHAR(50) DEFAULT 'in_progress',
    settlement_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_battery_health_reports_vehicle_id ON battery_health_reports(vehicle_id);
CREATE INDEX idx_battery_health_reports_report_date ON battery_health_reports(report_date);
CREATE INDEX idx_energy_consumption_records_vehicle_id ON energy_consumption_records(vehicle_id);
CREATE INDEX idx_energy_consumption_records_timestamp ON energy_consumption_records(timestamp);
CREATE INDEX idx_energy_consumption_records_route_id ON energy_consumption_records(route_id);
CREATE INDEX idx_energy_efficiency_analysis_vehicle_id ON energy_efficiency_analysis(vehicle_id);
CREATE INDEX idx_v2g_energy_transactions_vehicle_id ON v2g_energy_transactions(vehicle_id);
CREATE INDEX idx_v2g_energy_transactions_charging_session_id ON v2g_energy_transactions(charging_session_id);

-- Add triggers for updated_at
CREATE TRIGGER update_v2g_energy_transactions_updated_at
    BEFORE UPDATE ON v2g_energy_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create materialized view for battery health trends
CREATE MATERIALIZED VIEW battery_health_trends AS
SELECT 
    vehicle_id,
    date_trunc('month', report_date) as month,
    AVG(state_of_health) as avg_health,
    MIN(state_of_health) as min_health,
    MAX(state_of_health) as max_health,
    AVG(capacity_kwh) as avg_capacity,
    AVG(degradation_rate) as avg_degradation_rate,
    COUNT(*) as number_of_reports
FROM battery_health_reports
GROUP BY vehicle_id, date_trunc('month', report_date)
WITH DATA;

CREATE UNIQUE INDEX idx_battery_health_trends_vehicle_month 
ON battery_health_trends(vehicle_id, month);

-- Create view for energy efficiency metrics
CREATE OR REPLACE VIEW vehicle_energy_efficiency_metrics AS
SELECT 
    v.id as vehicle_id,
    v.vin,
    v.make,
    v.model,
    COALESCE(bh.state_of_health, 0) as current_battery_health,
    COALESCE(ec.total_energy_consumed_kwh, 0) as total_energy_consumed_30d,
    COALESCE(ec.total_distance_km, 0) as total_distance_30d,
    CASE 
        WHEN COALESCE(ec.total_distance_km, 0) > 0 
        THEN COALESCE(ec.total_energy_consumed_kwh, 0) / COALESCE(ec.total_distance_km, 1)
        ELSE 0 
    END as avg_efficiency_kwh_per_km,
    COALESCE(v2g.total_energy_exported_kwh, 0) as total_v2g_energy_30d,
    COALESCE(v2g.total_revenue, 0) as total_v2g_revenue_30d
FROM vehicles v
LEFT JOIN LATERAL (
    SELECT state_of_health
    FROM battery_health_reports
    WHERE vehicle_id = v.id
    ORDER BY report_date DESC
    LIMIT 1
) bh ON true
LEFT JOIN LATERAL (
    SELECT 
        SUM(energy_consumed_kwh) as total_energy_consumed_kwh,
        SUM(distance_km) as total_distance_km
    FROM energy_consumption_records
    WHERE vehicle_id = v.id
    AND timestamp >= NOW() - INTERVAL '30 days'
) ec ON true
LEFT JOIN LATERAL (
    SELECT 
        SUM(energy_exported_kwh) as total_energy_exported_kwh,
        SUM(revenue_amount) as total_revenue
    FROM v2g_energy_transactions
    WHERE vehicle_id = v.id
    AND start_time >= NOW() - INTERVAL '30 days'
) v2g ON true
WHERE v.is_active = true;

-- Create function to refresh battery health trends
CREATE OR REPLACE FUNCTION refresh_battery_health_trends()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY battery_health_trends;
END;
$$ LANGUAGE plpgsql;

-- Create function to analyze energy efficiency
CREATE OR REPLACE FUNCTION analyze_vehicle_energy_efficiency(
    p_vehicle_id uuid,
    p_start_date timestamptz,
    p_end_date timestamptz
) RETURNS TABLE (
    metric_name text,
    metric_value numeric,
    unit text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 'Total Energy Consumed'::text,
           COALESCE(SUM(energy_consumed_kwh), 0)::numeric,
           'kWh'::text
    FROM energy_consumption_records
    WHERE vehicle_id = p_vehicle_id
    AND timestamp BETWEEN p_start_date AND p_end_date
    UNION ALL
    SELECT 'Total Distance'::text,
           COALESCE(SUM(distance_km), 0)::numeric,
           'km'::text
    FROM energy_consumption_records
    WHERE vehicle_id = p_vehicle_id
    AND timestamp BETWEEN p_start_date AND p_end_date
    UNION ALL
    SELECT 'Average Efficiency'::text,
           CASE 
               WHEN COALESCE(SUM(distance_km), 0) > 0 
               THEN (COALESCE(SUM(energy_consumed_kwh), 0) / COALESCE(SUM(distance_km), 1))::numeric
               ELSE 0::numeric
           END,
           'kWh/km'::text
    FROM energy_consumption_records
    WHERE vehicle_id = p_vehicle_id
    AND timestamp BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql; 