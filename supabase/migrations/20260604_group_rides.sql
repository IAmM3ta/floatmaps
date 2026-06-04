-- GroupRide system for FloatMaps

CREATE TABLE IF NOT EXISTS group_rides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  creator_id uuid REFERENCES riders(id) NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'ended')),
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS group_ride_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_ride_id uuid REFERENCES group_rides(id) ON DELETE CASCADE NOT NULL,
  rider_id uuid REFERENCES riders(id) NOT NULL,
  joined_at timestamptz DEFAULT now(),
  last_location jsonb, -- { latitude, longitude, updated_at }
  metadata jsonb DEFAULT '{}',
  UNIQUE(group_ride_id, rider_id)
);

-- Indexes
CREATE INDEX idx_group_rides_status ON group_rides(status);
CREATE INDEX idx_group_ride_participants_ride ON group_ride_participants(group_ride_id);
CREATE INDEX idx_group_ride_participants_rider ON group_ride_participants(rider_id);

-- RLS
ALTER TABLE group_rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_ride_participants ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view active group rides" ON group_rides
  FOR SELECT USING (status = 'active');

CREATE POLICY "Creators can manage their group rides" ON group_rides
  FOR ALL USING (auth.uid() = creator_id);

CREATE POLICY "Participants can view their group rides" ON group_ride_participants
  FOR SELECT USING (auth.uid() = rider_id);

CREATE POLICY "Users can join/leave group rides" ON group_ride_participants
  FOR INSERT WITH CHECK (auth.uid() = rider_id);

CREATE POLICY "Users can update their own participation" ON group_ride_participants
  FOR UPDATE USING (auth.uid() = rider_id);