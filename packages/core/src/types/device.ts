export interface PEVDevice {
  id: string;
  riderId: string;
  deviceType: string;
  model?: string;
  voltageConfig?: string;
  metadata?: Record<string, any>;
}

/**
 * Validation for PEVDevice
 */
export function isValidDevice(device: Partial<PEVDevice>): boolean {
  if (!device.id || !device.riderId || !device.deviceType) return false;
  return true;
}