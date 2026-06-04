import { assert } from "https://deno.land/std@0.177.0/assert/mod.ts";
import { fc, testProp } from "https://esm.sh/fast-check@3.18.0";
import { isValidRideSession, isValidTelemetryPoint } from "../types/ride.ts";
import { isValidGroupRide } from "../types/group-ride.ts";
import { isValidDevice } from "../types/device.ts";

// === RideSession Property Tests ===

testProp(
  "isValidRideSession accepts well-formed generated sessions",
  [fc.record({
    id: fc.uuid(),
    riderId: fc.uuid(),
    deviceId: fc.option(fc.uuid()),
    startedAt: fc.date({ min: new Date("2020-01-01") }).map(d => d.toISOString()),
    endedAt: fc.option(fc.date({ min: new Date("2020-01-01") }).map(d => d.toISOString())),
    isPublic: fc.boolean(),
    metadata: fc.object(),
  }, {
    requiredKeys: ["id", "riderId", "startedAt", "isPublic"]
  })],
  (session) => {
    if (session.endedAt && new Date(session.endedAt) < new Date(session.startedAt)) {
      return;
    }
    assert(isValidRideSession(session));
  }
);

// === TelemetryPoint Property Tests ===

testProp(
  "isValidTelemetryPoint correctly validates coordinate ranges",
  [fc.record({
    recordedAt: fc.date().map(d => d.toISOString()),
    latitude: fc.double({ min: -90, max: 90, noNaN: true, noDefaultInfinity: true }),
    longitude: fc.double({ min: -180, max: 180, noNaN: true, noDefaultInfinity: true }),
  })],
  (point) => {
    const result = isValidTelemetryPoint(point);
    const inRange =
      point.latitude >= -90 && point.latitude <= 90 &&
      point.longitude >= -180 && point.longitude <= 180;

    assert(result === inRange);
  }
);

// === GroupRide Property Tests ===

testProp(
  "isValidGroupRide accepts valid generated rides",
  [fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 100 }),
    creatorId: fc.uuid(),
    status: fc.constantFrom("active", "ended"),
    startedAt: fc.date({ min: new Date("2020-01-01") }).map(d => d.toISOString()),
    endedAt: fc.option(fc.date({ min: new Date("2020-01-01") }).map(d => d.toISOString())),
    metadata: fc.object(),
  }, {
    requiredKeys: ["id", "name", "creatorId", "status", "startedAt"]
  })],
  (ride) => {
    if (ride.endedAt && new Date(ride.endedAt) < new Date(ride.startedAt)) {
      return;
    }
    assert(isValidGroupRide(ride));
  }
);

// === PEVDevice Property Tests ===

testProp(
  "isValidDevice accepts valid generated devices",
  [fc.record({
    id: fc.uuid(),
    riderId: fc.uuid(),
    deviceType: fc.string({ minLength: 1, maxLength: 50 }),
    model: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
    voltageConfig: fc.option(fc.string({ minLength: 1, maxLength: 20 })),
    metadata: fc.object(),
  }, {
    requiredKeys: ["id", "riderId", "deviceType"]
  })],
  (device) => {
    assert(isValidDevice(device));
  }
);

// === Shrinking Demonstration ===
Deno.test("Shrinking demo: minimal invalid latitude", async () => {
  const result = await fc.check(
    fc.property(
      fc.double({ min: 90.0001, max: 200, noNaN: true }),
      (badLatitude) => {
        const point = {
          recordedAt: new Date().toISOString(),
          latitude: badLatitude,
          longitude: 0,
        };
        return isValidTelemetryPoint(point) === false;
      }
    ),
    { numRuns: 200 }
  );

  if (result.failed) {
    console.log("\n[Shrinking] Smallest failing latitude:", result.counterexample?.[0]);
  }
});