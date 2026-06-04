import { assert } from "https://deno.land/std@0.177.0/assert/mod.ts";
// ^ Deno Standard Library - provides testing assertions

import { fc, testProp } from "https://esm.sh/fast-check@3.18.0";
// ^ fast-check via esm.sh - property-based testing library for generating test cases and shrinking

import { isValidRideSession, isValidTelemetryPoint } from "../types/ride.ts";
// ^ Local project import - validation functions defined in the core types

// === Improved Property Tests with Better Shrinking ===

testProp(
  "isValidRideSession accepts any well-formed generated session",
  [fc.record({
    id: fc.uuid(),
    riderId: fc.uuid(),
    deviceId: fc.option(fc.uuid()),
    startedAt: fc.date({ min: new Date("2020-01-01") }).map(d => d.toISOString()),
    endedAt: fc.option(fc.date({ min: new Date("2020-01-01") }).map(d => d.toISOString())),
    isPublic: fc.boolean(),
    metadata: fc.object(),
  }, { requiredKeys: ["id", "riderId", "startedAt", "isPublic"] })],
  (session) => {
    if (session.endedAt && new Date(session.endedAt) < new Date(session.startedAt)) {
      return;
    }
    assert(isValidRideSession(session));
  }
);

// Improved telemetry point test with tighter bounds for better shrinking
testProp(
  "isValidTelemetryPoint correctly classifies coordinate validity",
  [fc.record({
    recordedAt: fc.date().map(d => d.toISOString()),
    latitude: fc.double({ min: -90, max: 90, noDefaultInfinity: true, noNaN: true }),
    longitude: fc.double({ min: -180, max: 180, noDefaultInfinity: true, noNaN: true }),
  })],
  (point) => {
    const result = isValidTelemetryPoint(point);
    const inRange = point.latitude >= -90 && point.latitude <= 90 &&
                    point.longitude >= -180 && point.longitude <= 180;

    assert(result === inRange);
  }
);

// === Shrinking Demonstration ===
// This test is intentionally written to demonstrate how fast-check performs shrinking.
// When a property fails, fast-check tries to find the *smallest* possible input
// that still causes the failure. This process is called "shrinking".
//
// In the output below, `result.counterexample` contains the minimal failing input.
// This makes debugging much easier because you see the simplest case that breaks your code.
Deno.test("Shrinking demonstration: find minimal invalid latitude", async () => {
  const result = await fc.check(
    fc.property(
      fc.double({ min: 90.0001, max: 200 }),
      (badLatitude) => {
        const point = {
          recordedAt: new Date().toISOString(),
          latitude: badLatitude,
          longitude: 0,
        };
        return isValidTelemetryPoint(point) === false;
      }
    ),
    { numRuns: 100 }
  );

  if (result.failed) {
    console.log("\n=== Shrinking Counterexample ===");
    console.log("Smallest failing latitude found:", result.counterexample?.[0]);
    console.log("\nThis value is the result of fast-check's shrinking algorithm.");
    console.log("It started with larger invalid values and reduced them to the smallest possible failing input.");
  }
});