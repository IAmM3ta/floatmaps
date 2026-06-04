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

/**
 * Basic validation for RideSession
 */
export function isValidRideSession(session: Partial<RideSession>): boolean {
  if (!session.id || !session.riderId || !session.startedAt) {
    return false;
  }
  if (typeof session.isPublic !== "boolean") {
    return false;
  }
  if (session.endedAt && new Date(session.endedAt) < new Date(session.startedAt)) {
    return false;
  }
  return true;
}