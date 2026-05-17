-- PEV Device Lookup Tables for FloatMaps / OPEV

CREATE TABLE IF NOT EXISTS pev_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand text,
  model text,
  device_type text CHECK (device_type IN ('onewheel', 'euc', 'escooter', 'ebike', 'eskateboard')),
  voltage_config text,           -- e.g. '32S', '20S', '52V', etc.
  nominal_voltage numeric,
  max_voltage numeric,
  battery_chemistry text,
  compatible_with_opev boolean DEFAULT true,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id uuid REFERENCES riders(id) ON DELETE CASCADE,
  device_id uuid REFERENCES pev_devices(id),
  custom_name text,
  added_at timestamptz DEFAULT now()
);

-- Seed some example OPEV-compatible devices
INSERT INTO pev_devices (brand, model, device_type, voltage_config, nominal_voltage, max_voltage, battery_chemistry, notes) VALUES
('Funwheel', 'X7 Long Range', 'onewheel', '32S', 134.4, 134.4, 'NMC', 'High performance Onewheel clone'),
('KingSong', 'F22 Pro', 'euc', '20S', 84, 84, 'NMC', 'Popular EUC'),
('Kaabo', 'King GTR', 'escooter', '52V', 52, 58.8, 'NMC', 'High power scooter'),
('Generic', 'Mid-range Commuter', 'ebike', '48V', 48, 54.6, 'NMC/LFP', 'Common e-bike'),
('VESC-based', 'Custom Skate', 'eskateboard', '12S-20S', 50.4, 84, 'NMC', 'VESC driven e-skate');

CREATE INDEX IF NOT EXISTS idx_pev_devices_type ON pev_devices(device_type);
CREATE INDEX IF NOT EXISTS idx_user_devices_rider ON user_devices(rider_id);