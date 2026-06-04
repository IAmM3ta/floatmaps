import type { GroupRide } from '../types/group-ride';

interface RiderLocation {
  latitude: number;
  longitude: number;
}

interface MatchOptions {
  maxDistanceKm?: number;
  timeWindowHours?: number;
  now?: Date;
  geofence?: {
    centerLat: number;
    centerLon: number;
    radiusKm: number;
  };
}

interface MatchedRide extends GroupRide {
  distanceKm: number;
  startsInMinutes: number;
  score: number;
}

/**
 * Haversine distance in kilometers
 */
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Improved proximity scoring
 * Lower score = better match
 */
function calculateProximityScore(distanceKm: number, startsInMinutes: number): number {
  const distanceScore = distanceKm * 1.8;
  const timeScore = Math.pow(startsInMinutes / 60, 1.2) * 0.8; // slight non-linear time penalty
  return distanceScore + timeScore;
}

/**
 * Check if a point is inside a geofence
 */
function isInsideGeofence(
  pointLat: number,
  pointLon: number,
  geofence: { centerLat: number; centerLon: number; radiusKm: number }
): boolean {
  const distance = haversineDistance(pointLat, pointLon, geofence.centerLat, geofence.centerLon);
  return distance <= geofence.radiusKm;
}

/**
 * Main ride matching function with proximity scoring + geofencing
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
    geofence,
  } = options;

  const timeWindowMs = timeWindowHours * 60 * 60 * 1000;
  const results: MatchedRide[] = [];

  for (const ride of rides) {
    if (ride.status !== 'active') continue;

    const rideLat = (ride.metadata as any)?.startLatitude;
    const rideLon = (ride.metadata as any)?.startLongitude;

    if (!rideLat || !rideLon) {
      // Skip rides without location data (graceful handling)
      continue;
    }

    // Apply geofence if provided
    if (geofence && !isInsideGeofence(rideLat, rideLon, geofence)) {
      continue;
    }

    const distanceKm = haversineDistance(riderLocation.latitude, riderLocation.longitude, rideLat, rideLon);

    if (distanceKm > maxDistanceKm) continue;

    const startTime = new Date(ride.startedAt);
    const startsInMs = startTime.getTime() - now.getTime();

    if (startsInMs < 0 || startsInMs > timeWindowMs) continue;

    const startsInMinutes = Math.floor(startsInMs / (1000 * 60));
    const score = calculateProximityScore(distanceKm, startsInMinutes);

    results.push({
      ...ride,
      distanceKm: Math.round(distanceKm * 10) / 10,
      startsInMinutes,
      score: Math.round(score * 100) / 100,
    });
  }

  // Sort by score (best first)
  results.sort((a, b) => a.score - b.score);

  return results;
}