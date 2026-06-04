import type { GroupRide } from '../types/group-ride';

interface RiderLocation {
  latitude: number;
  longitude: number;
}

interface MatchOptions {
  maxDistanceKm?: number;      // default 50km
  timeWindowHours?: number;    // default 4 hours
  now?: Date;
}

interface MatchedRide extends GroupRide {
  distanceKm: number;
  startsInMinutes: number;
  score: number;               // lower is better
}

/**
 * Haversine formula to calculate distance between two points on Earth
 */
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Score a ride based on distance and time proximity.
 * Lower score = better match.
 */
function calculateScore(distanceKm: number, startsInMinutes: number): number {
  // Weight distance more heavily than time
  const distanceWeight = 2.0;
  const timeWeight = 1.0;

  return distanceKm * distanceWeight + startsInMinutes * timeWeight;
}

/**
 * Find and rank GroupRides near a rider's location.
 */
export function findMatchingRides(
  rides: GroupRide[],
  riderLocation: RiderLocation,
  options: MatchOptions = {}
): MatchedRide[] {
  const {
    maxDistanceKm = 50,
    timeWindowHours = 4,
    now = new Date(),
  } = options;

  const timeWindowMs = timeWindowHours * 60 * 60 * 1000;

  const matched: MatchedRide[] = [];

  for (const ride of rides) {
    if (ride.status !== 'active') continue;

    // For now we assume ride has no explicit location.
    // In future we can add start_location or use first telemetry point.
    // Placeholder: skip rides without location data for now.
    // TODO: Replace with actual ride start location when available.
    const rideLat = (ride.metadata as any)?.startLatitude;
    const rideLon = (ride.metadata as any)?.startLongitude;

    if (!rideLat || !rideLon) continue;

    const distanceKm = haversineDistance(
      riderLocation.latitude,
      riderLocation.longitude,
      rideLat,
      rideLon
    );

    if (distanceKm > maxDistanceKm) continue;

    const startTime = new Date(ride.startedAt);
    const startsInMs = startTime.getTime() - now.getTime();

    if (startsInMs < 0 || startsInMs > timeWindowMs) continue;

    const startsInMinutes = Math.floor(startsInMs / (1000 * 60));
    const score = calculateScore(distanceKm, startsInMinutes);

    matched.push({
      ...ride,
      distanceKm: Math.round(distanceKm * 10) / 10,
      startsInMinutes,
      score,
    });
  }

  // Sort by score (best matches first)
  matched.sort((a, b) => a.score - b.score);

  return matched;
}