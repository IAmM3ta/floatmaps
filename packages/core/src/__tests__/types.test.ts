import { assertEquals, assertExists } from "https://deno.land/std@0.177.0/assert/mod.ts";
import {
  createMockRideSession,
  createMockTelemetryPoint,
  createMockGroupRide,
  createMockDevice,
  assertValidRideSession,
} from "../testing/test-utils.ts";

Deno.test("RideSession - can create mock and validate", () => {
  const session = createMockRideSession();
  assertValidRideSession(session);
  assertEquals(session.isPublic, false);
});

Deno.test("RideTelemetryPoint - creates valid point", () => {
  const point = createMockTelemetryPoint({ speedKmh: 32.5 });
  assertExists(point.recordedAt);
  assertEquals(point.speedKmh, 32.5);
});

Deno.test("GroupRide - mock creation works", () => {
  const group = createMockGroupRide({ name: "Asheville Night Ride" });
  assertEquals(group.name, "Asheville Night Ride");
  assertEquals(group.status, "active");
});

Deno.test("PEVDevice - creates device with defaults", () => {
  const device = createMockDevice();
  assertEquals(device.deviceType, "FloatWheel");
  assertEquals(device.model, "ADV Pro");
});