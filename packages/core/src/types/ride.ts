export interface RideSession {
  id: string;
  riderId: string;
  deviceId?: string;
  startedAt: string;
  endedAt?: string;
  durationSeconds?: number;
  distanceMeters?: number;
  maxSpeedKmh?: number;
  avgSpeedKmh?: number;
  totalWhUsed?: number;
  isPublic: boolean;
  metadata: Record<string, any>;
}

export interface RideTelemetryPoint {
  recordedAt: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  speedKmh?: number;
  heading?: number;
  batterySoc?: number;
  powerWatts?: number;
  metadata?: Record<string, any>;
}