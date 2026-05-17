-- Energy Accounting Fix: Distinguish OPEV-sourced vs user-charged energy

-- Add columns to ride_logs for clear delineation
ALTER TABLE ride_logs 
  ADD COLUMN IF NOT EXISTS energy_source text CHECK (energy_source IN ('opev_modular', 'user_charger', 'mixed')),
  ADD COLUMN IF NOT EXISTS wh_from_opev numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS wh_from_user numeric DEFAULT 0;

-- Energy transactions table for precise billing
CREATE TABLE IF NOT EXISTS energy_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id uuid REFERENCES riders(id),
  ride_log_id uuid REFERENCES ride_logs(id),
  transaction_type text CHECK (transaction_type IN ('draw_from_opev', 'charge_by_user')),
  wh_amount numeric NOT NULL,
  source text, -- 'kiosk', 'personal_charger', etc.
  billed boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Example: When logging a ride, split energy
-- If user charged personally, mark wh_from_user and set billed=false for that portion

COMMENT ON COLUMN ride_logs.energy_source IS 'opev_modular = billed, user_charger = not billed, mixed = split tracking';
COMMENT ON TABLE energy_transactions IS 'Audit trail for fair billing - only OPEV-sourced energy is charged';