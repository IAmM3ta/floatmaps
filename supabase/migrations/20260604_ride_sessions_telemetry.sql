-- FloatMaps Core Ride Recording Layer
-- Run this migration after reviewing

CREATE TABLE IF NOT EXISTS ride_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id uuid REFERENCES riders(id) NOT NULL,
  device_id uuid REFERENCES pev_devices(id),
  started_at timestamptz NOT NULL,
  ended_at timestamptz,
  duration_seconds integer GENERATED ALWAYS AS (
    CASE WHEN ended_at IS NOT NULL 
    THEN EXTRACT(EPOCH FROM (ended_at - started_at))::int 
    ELSE NULL END
  ) STORED,
  distance_meters numeric,
  max_speed_kmh numeric,
  avg_speed_kmh numeric,
  total_wh_used numeric,
  is_public boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ride_telemetry (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ride_session_id uuid REFERENCES ride_sessions(id) ON DELETE CASCADE NOT NULL,
  recorded_at timestamptz NOT NULL,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  altitude numeric,
  speed_kmh numeric,
  heading numeric,
  battery_soc numeric,
  power_watts numeric,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_ride_sessions_rider_id ON ride_sessions(rider_id);
CREATE INDEX IF NOT EXISTS idx_ride_sessions_started_at ON ride_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_ride_telemetry_session ON ride_telemetry(ride_session_id);
CREATE INDEX IF NOT EXISTS idx_ride_telemetry_recorded_at ON ride_telemetry(recorded_at);

-- Enable RLS
ALTER TABLE ride_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ride_telemetry ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "riders_own_sessions" ON ride_sessions
  FOR ALL USING (auth.uid() = rider_id);

CREATE POLICY "riders_own_telemetry" ON ride_telemetry
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM ride_sessions 
      WHERE ride_sessions.id = ride_telemetry.ride_session_id 
      AND ride_sessions.rider_id = auth.uid()
    )
  );