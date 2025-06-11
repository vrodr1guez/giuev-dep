-- Battery health reports table
CREATE TABLE battery_health_reports (
    report_id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
    report_date DATE NOT NULL,
    state_of_health_percent FLOAT,
    estimated_remaining_capacity_kwh FLOAT,
    cycle_count_estimate INTEGER,
    average_cell_temperature_celsius FLOAT,
    notes TEXT,
    raw_diagnostic_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Energy consumption summary table (partitioned by month)
CREATE TABLE energy_consumption_summary (
    summary_id SERIAL,
    vehicle_id INTEGER REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
    summary_period_start DATE NOT NULL,
    summary_period_end DATE NOT NULL,
    total_distance_km FLOAT,
    total_energy_consumed_kwh FLOAT,
    average_efficiency_kwh_per_100km FLOAT,
    regenerative_braking_energy_kwh FLOAT,
    idle_energy_consumed_kwh FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (summary_id, summary_period_start)
) PARTITION BY RANGE (summary_period_start);

-- Create partitions for the current year by month
DO $$
BEGIN
    FOR month IN 1..12 LOOP
        EXECUTE format(
            'CREATE TABLE energy_consumption_summary_%s_%s PARTITION OF energy_consumption_summary
            FOR VALUES FROM (%L) TO (%L)',
            extract(year from CURRENT_DATE),
            LPAD(month::text, 2, '0'),
            make_date(extract(year from CURRENT_DATE)::int, month, 1),
            make_date(
                CASE WHEN month = 12 
                THEN extract(year from CURRENT_DATE)::int + 1 
                ELSE extract(year from CURRENT_DATE)::int END,
                CASE WHEN month = 12 THEN 1 ELSE month + 1 END,
                1
            )
        );
    END LOOP;
END $$;

-- Create indexes
CREATE INDEX idx_battery_health_vehicle ON battery_health_reports(vehicle_id);
CREATE INDEX idx_battery_health_date ON battery_health_reports(report_date);
CREATE INDEX idx_battery_health_soh ON battery_health_reports(state_of_health_percent);

CREATE INDEX idx_energy_consumption_vehicle ON energy_consumption_summary(vehicle_id);
CREATE INDEX idx_energy_consumption_period ON energy_consumption_summary(summary_period_start, summary_period_end);

-- Create materialized view for battery health trends
CREATE MATERIALIZED VIEW battery_health_trends AS
SELECT 
    v.vehicle_id,
    v.make,
    v.model,
    v.license_plate,
    bhr.report_date,
    bhr.state_of_health_percent,
    bhr.estimated_remaining_capacity_kwh,
    bhr.cycle_count_estimate,
    LAG(bhr.state_of_health_percent) OVER (
        PARTITION BY v.vehicle_id 
        ORDER BY bhr.report_date
    ) as previous_soh,
    (bhr.state_of_health_percent - LAG(bhr.state_of_health_percent) OVER (
        PARTITION BY v.vehicle_id 
        ORDER BY bhr.report_date
    )) / GREATEST(
        DATE_PART('day', bhr.report_date - LAG(bhr.report_date) OVER (
            PARTITION BY v.vehicle_id 
            ORDER BY bhr.report_date
        )), 
        1
    ) as daily_degradation_rate
FROM vehicles v
JOIN battery_health_reports bhr ON v.vehicle_id = bhr.vehicle_id
WHERE bhr.report_date >= CURRENT_DATE - INTERVAL '1 year'
ORDER BY v.vehicle_id, bhr.report_date;

CREATE UNIQUE INDEX idx_battery_health_trends ON battery_health_trends(vehicle_id, report_date);

-- Create function to refresh battery health trends
CREATE OR REPLACE FUNCTION refresh_battery_health_trends()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY battery_health_trends;
END;
$$ LANGUAGE plpgsql;

-- Create view for energy efficiency analysis
CREATE VIEW energy_efficiency_analysis AS
WITH monthly_stats AS (
    SELECT 
        vehicle_id,
        DATE_TRUNC('month', summary_period_start) as month,
        SUM(total_energy_consumed_kwh) as total_energy,
        SUM(total_distance_km) as total_distance,
        AVG(average_efficiency_kwh_per_100km) as avg_efficiency,
        SUM(regenerative_braking_energy_kwh) as total_regen_energy
    FROM energy_consumption_summary
    WHERE summary_period_start >= CURRENT_DATE - INTERVAL '1 year'
    GROUP BY vehicle_id, DATE_TRUNC('month', summary_period_start)
)
SELECT 
    v.vehicle_id,
    v.make,
    v.model,
    v.license_plate,
    ms.month,
    ms.total_energy,
    ms.total_distance,
    ms.avg_efficiency,
    ms.total_regen_energy,
    ms.total_regen_energy / NULLIF(ms.total_energy, 0) * 100 as regen_percentage,
    LAG(ms.avg_efficiency) OVER (
        PARTITION BY v.vehicle_id 
        ORDER BY ms.month
    ) as previous_month_efficiency,
    ms.avg_efficiency - LAG(ms.avg_efficiency) OVER (
        PARTITION BY v.vehicle_id 
        ORDER BY ms.month
    ) as efficiency_change
FROM vehicles v
JOIN monthly_stats ms ON v.vehicle_id = ms.vehicle_id
ORDER BY v.vehicle_id, ms.month; 