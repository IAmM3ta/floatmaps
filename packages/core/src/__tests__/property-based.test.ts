import { assert } from "https://deno.land/std@0.177.0/assert/mod.ts";
import { fc, testProp } from "https://esm.sh/fast-check@3.18.0";
import { isValidRideSession, isValidTelemetryPoint } from "../types/ride.ts";

// Property: A generated valid RideSession should always pass validation
 testProp(
  "isValidRideSession should return true for any valid generated session",
  [fc.record({
    id: fc.uuid(),
    riderId: fc.uuid(),
    deviceId: fc.option(fc.uuid()),
    startedAt: fc.date({ min: new Date("2020-01-01") }).map(d => d.toISOString()),
    endedAt: fc.option(fc.date({ min: new Date("2020-01-01") }).map(d => d.toISOString())),
    isPublic: fc.boolean(),
    metadata: fc.object(),
  })],
  (session) => {
    // Ensure endedAt is after startedAt if present
    if (session.endedAt && session.startedAt && new Date(session.endedAt) < new Date(session.startedAt)) {
      return; // Skip invalid date combinations
    }
    assert(isValidRideSession(session));
  }
);

// Property: isValidTelemetryPoint should correctly validate latitude/longitude bounds
testProp(
  "isValidTelemetryPoint rejects out-of-range coordinates",
  [fc.record({
    recordedAt: fc.date().map(d => d.toISOString()),
    latitude: fc.double({ min: -100, max: 100 }),
    longitude: fc.double({ min: -200, max: 200 }),
  })],
  (point) => {
    const result = isValidTelemetryPoint(point);
    const inRange =
      point.latitude >= -90 && point.latitude <= 90 &&
      point.longitude >= -180 && point.longitude <= 180;

    if (inRange) {
      assert(result === true);
    } else {
      assert(result === false);
    }
  }
);