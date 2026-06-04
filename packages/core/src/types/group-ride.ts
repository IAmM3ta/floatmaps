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