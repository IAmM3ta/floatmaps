export interface PEVDevice {
  id: string;
  riderId: string;
  deviceType: string;
  model?: string;
  voltageConfig?: string;
  metadata?: Record<string, any>;
}