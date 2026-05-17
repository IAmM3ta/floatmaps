-- Gifting Leftover Charge Feature

CREATE TABLE IF NOT EXISTS energy_gifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_rider_id uuid REFERENCES riders(id) ON DELETE CASCADE,
  to_rider_id uuid REFERENCES riders(id),  -- null if open gift
  original_ride_log_id uuid REFERENCES ride_logs(id),
  gifted_wh numeric NOT NULL,
  qr_token text UNIQUE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'claimed', 'returned')),
  claimed_ride_log_id uuid REFERENCES ride_logs(id), -- when recipient returns it
  created_at timestamptz DEFAULT now()
);

-- When a gift is created at return, we mark part of the energy as gifted (not billed to original user)
-- When recipient returns, we can credit the original user or simply not bill the gifted portion

COMMENT ON TABLE energy_gifts IS 'Community gifting of returned energy. Original user gets credit when gifted pack is returned by recipient.';