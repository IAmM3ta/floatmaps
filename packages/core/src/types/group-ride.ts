export interface GroupRide {
  id: string;
  name: string;
  creatorId: string;
  status: 'active' | 'ended';
  startedAt: string;
  endedAt?: string;
  metadata?: Record<string, any>;
}

export interface GroupRideParticipant {
  riderId: string;
  joinedAt: string;
  currentLocation?: {
    latitude: number;
    longitude: number;
    updatedAt: string;
  };
}

/**
 * Basic validation for GroupRide
 */
export function isValidGroupRide(ride: Partial<GroupRide>): boolean {
  if (!ride.id || !ride.name || !ride.creatorId || !ride.startedAt) {
    return false;
  }
  if (ride.status && !['active', 'ended'].includes(ride.status)) {
    return false;
  }
  if (ride.endedAt && new Date(ride.endedAt) < new Date(ride.startedAt)) {
    return false;
  }
  return true;
}