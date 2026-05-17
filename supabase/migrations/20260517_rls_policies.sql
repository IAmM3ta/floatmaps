-- Row Level Security Policies for FloatMaps / OPEV

-- Enable RLS on all tables
ALTER TABLE riders ENABLE ROW LEVEL SECURITY;
ALTER TABLE rider_tunings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ride_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE geocache_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE hazards ENABLE ROW LEVEL SECURITY;

-- Riders: Users can only see and update their own profile
CREATE POLICY "Users can view own profile" ON riders
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON riders
  FOR UPDATE USING (auth.uid() = id);

-- Rider Tunings: Owner can manage their own tunings
CREATE POLICY "Users can manage own tunings" ON rider_tunings
  FOR ALL USING (auth.uid() = rider_id);

-- Ride Logs: Owner can manage their own rides. Community can read aggregated/public data if needed.
CREATE POLICY "Users can manage own ride logs" ON ride_logs
  FOR ALL USING (auth.uid() = rider_id);

-- Geocache Notes: Owner full control. Others can read if within proximity (future: use PostGIS functions)
CREATE POLICY "Users can manage own geocache notes" ON geocache_notes
  FOR ALL USING (auth.uid() = rider_id);

CREATE POLICY "Anyone can read geocache notes" ON geocache_notes
  FOR SELECT USING (true);  -- For demo; tighten with proximity in production

-- Hazards: Anyone can report. Everyone can read.
CREATE POLICY "Anyone can insert hazards" ON hazards
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read hazards" ON hazards
  FOR SELECT USING (true);

-- Note: For production, add more granular policies using auth.jwt() claims or PostGIS proximity functions.