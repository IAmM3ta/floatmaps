-- Add explicit State of Charge tracking for fair net consumption billing

ALTER TABLE ride_logs 
  ADD COLUMN IF NOT EXISTS starting_soc numeric CHECK (starting_soc BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS ending_soc numeric CHECK (ending_soc BETWEEN 0 AND 100);

-- Optional: Add pack capacity reference for easier calculations
ALTER TABLE ride_logs 
  ADD COLUMN IF NOT EXISTS pack_capacity_wh numeric;

COMMENT ON COLUMN ride_logs.starting_soc IS 'State of Charge % when battery was picked up from kiosk';
COMMENT ON COLUMN ride_logs.ending_soc IS 'State of Charge % when battery was returned to kiosk';
COMMENT ON COLUMN ride_logs.pack_capacity_wh IS 'Battery pack capacity in Wh for net consumption calculation';