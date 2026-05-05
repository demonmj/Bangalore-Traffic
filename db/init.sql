-- CREATE EXTENSION
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- ROADS
CREATE TABLE roads (
  road_id       SERIAL PRIMARY KEY,
  road_name     VARCHAR(200) NOT NULL,
  zone          VARCHAR(100),
  latitude      DECIMAL(9,6) NOT NULL,
  longitude     DECIMAL(9,6) NOT NULL,
  road_type     VARCHAR(50) CHECK (road_type IN ('arterial','collector','local','highway'))
);
CREATE INDEX idx_roads_zone ON roads(zone);

-- TRAFFIC DATA (TimescaleDB hypertable)
CREATE TABLE traffic_data (
  traffic_id      BIGSERIAL,
  road_id         INTEGER NOT NULL REFERENCES roads(road_id),
  timestamp       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  vehicle_count   INTEGER NOT NULL CHECK (vehicle_count >= 0),
  avg_speed       DECIMAL(6,2),
  congestion_level DECIMAL(4,2) CHECK (congestion_level BETWEEN 0 AND 10),
  PRIMARY KEY (traffic_id, timestamp)
);
SELECT create_hypertable('traffic_data', 'timestamp');
CREATE INDEX idx_td_road_time ON traffic_data(road_id, timestamp DESC);

-- SIGNALS
CREATE TABLE signals (
  signal_id       SERIAL PRIMARY KEY,
  junction_name   VARCHAR(200) NOT NULL,
  road_id         INTEGER REFERENCES roads(road_id),
  green_time      INTEGER NOT NULL DEFAULT 30,
  red_time        INTEGER NOT NULL DEFAULT 30,
  adaptive_mode   BOOLEAN DEFAULT FALSE,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- TIME SLOTS
CREATE TABLE time_slots (
  slot_id     SERIAL PRIMARY KEY,
  start_time  TIME NOT NULL,
  end_time    TIME NOT NULL,
  peak_flag   BOOLEAN DEFAULT FALSE,
  label       VARCHAR(50)
);
INSERT INTO time_slots (start_time, end_time, peak_flag, label) VALUES
  ('07:30','10:00', TRUE,  'Morning Peak'),
  ('10:00','17:00', FALSE, 'Off-Peak'),
  ('17:30','20:30', TRUE,  'Evening Peak'),
  ('20:30','07:30', FALSE, 'Night');

-- ALERTS
CREATE TABLE alerts (
  alert_id      BIGSERIAL PRIMARY KEY,
  road_id       INTEGER REFERENCES roads(road_id),
  alert_level   VARCHAR(20) CHECK (alert_level IN ('info','warning','critical')),
  message       TEXT,
  generated_at  TIMESTAMPTZ DEFAULT NOW(),
  status        VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','acknowledged','resolved'))
);
CREATE INDEX idx_alerts_road_status ON alerts(road_id, status);

-- JOIN VIEW: Live congestion snapshot
CREATE VIEW live_congestion AS
  SELECT r.road_id, r.road_name, r.zone, r.latitude, r.longitude,
         td.timestamp, td.vehicle_count, td.avg_speed, td.congestion_level
  FROM roads r
  JOIN LATERAL (
    SELECT * FROM traffic_data
    WHERE road_id = r.road_id
    ORDER BY timestamp DESC LIMIT 1
  ) td ON TRUE;

-- TRIGGER: Auto-generate critical alert when congestion_level >= 8
CREATE OR REPLACE FUNCTION fn_auto_alert() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.congestion_level >= 8 THEN
    INSERT INTO alerts (road_id, alert_level, message)
    VALUES (NEW.road_id, 'critical',
      FORMAT('Severe congestion on road %s. Level: %s', NEW.road_id, NEW.congestion_level));
  ELSIF NEW.congestion_level >= 5 THEN
    INSERT INTO alerts (road_id, alert_level, message)
    VALUES (NEW.road_id, 'warning',
      FORMAT('Moderate congestion on road %s. Level: %s', NEW.road_id, NEW.congestion_level));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_auto_alert
  AFTER INSERT ON traffic_data
  FOR EACH ROW EXECUTE FUNCTION fn_auto_alert();

-- STORED PROCEDURE: Top 10 busiest routes
CREATE OR REPLACE PROCEDURE sp_busiest_routes(hours_back INTEGER)
LANGUAGE plpgsql AS $$
BEGIN
  CREATE TEMP TABLE IF NOT EXISTS busiest_routes_result AS
  SELECT r.road_name, r.zone,
         AVG(td.vehicle_count) AS avg_vehicles,
         AVG(td.congestion_level) AS avg_congestion
  FROM traffic_data td
  JOIN roads r ON r.road_id = td.road_id
  WHERE td.timestamp >= NOW() - (hours_back || ' hours')::INTERVAL
  GROUP BY r.road_name, r.zone
  ORDER BY avg_congestion DESC
  LIMIT 10;
END;
$$;

-- STORED PROCEDURE: Peak hour congestion analysis
CREATE OR REPLACE PROCEDURE sp_peak_hour_analysis(target_date DATE)
LANGUAGE plpgsql AS $$
BEGIN
  CREATE TEMP TABLE IF NOT EXISTS peak_analysis AS
  SELECT ts.label, ts.peak_flag,
         AVG(td.vehicle_count) AS avg_vehicles,
         MAX(td.congestion_level) AS max_congestion,
         COUNT(DISTINCT td.road_id) AS roads_affected
  FROM traffic_data td
  JOIN time_slots ts
    ON td.timestamp::TIME BETWEEN ts.start_time AND ts.end_time
  WHERE td.timestamp::DATE = target_date
  GROUP BY ts.label, ts.peak_flag
  ORDER BY avg_vehicles DESC;
END;
$$;

-- STORED PROCEDURE: Signal timing optimization
CREATE OR REPLACE PROCEDURE sp_optimize_signals()
LANGUAGE plpgsql AS $$
BEGIN
  UPDATE signals s
  SET green_time = LEAST(90, GREATEST(15,
        30 + (lc.congestion_level * 6)::INTEGER)),
      red_time = GREATEST(10,
        30 - (lc.congestion_level * 3)::INTEGER),
      adaptive_mode = TRUE,
      updated_at = NOW()
  FROM live_congestion lc
  WHERE lc.road_id = s.road_id
    AND lc.congestion_level > 4;
END;
$$;

-- SEED DATA FOR BENGALURU ROADS (Lat 12.83 to 13.14, Lng 77.46 to 77.78)
INSERT INTO roads (road_name, zone, latitude, longitude, road_type) VALUES
('Outer Ring Road', 'East', 12.9229, 77.6830, 'highway'),
('Hosur Road', 'South', 12.9090, 77.6254, 'arterial'),
('MG Road', 'Central', 12.9738, 77.6119, 'collector'),
('Tumkur Road', 'North', 13.0382, 77.5255, 'highway'),
('Bannerghatta Road', 'South', 12.8943, 77.5982, 'arterial'),
('Old Madras Road', 'East', 12.9904, 77.6534, 'arterial'),
('Mysore Road', 'South West', 12.9388, 77.5234, 'highway'),
('Bellary Road', 'North', 13.0658, 77.5939, 'highway'),
('Sarjapur Road', 'South East', 12.9152, 77.6501, 'arterial'),
('Indiranagar 100 Ft Road', 'East', 12.9784, 77.6408, 'collector'),
('Koramangala 80 Ft Road', 'South East', 12.9345, 77.6231, 'collector'),
('Whitefield Main Road', 'East', 12.9698, 77.7499, 'arterial'),
('Electronic City Phase 1 Flyover', 'South', 12.8465, 77.6621, 'highway'),
('Mekhri Circle', 'North', 13.0033, 77.5857, 'arterial'),
('Silk Board Junction', 'South', 12.9176, 77.6226, 'arterial');

INSERT INTO signals (junction_name, road_id, green_time, red_time, adaptive_mode) VALUES
('Silk Board', 15, 45, 45, FALSE),
('Sony World Junction', 11, 30, 30, FALSE),
('Madiwala Checkpost', 2, 40, 40, FALSE),
('Trinity Circle', 3, 35, 35, FALSE),
('Mekhri Circle', 14, 50, 40, FALSE),
('Hebbal Flyover', 8, 60, 30, FALSE),
('Agara Junction', 1, 45, 45, FALSE),
('Kalyan Nagar Cross', 1, 35, 35, FALSE);
