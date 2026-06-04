import { assertEquals } from "https://deno.land/std@0.177.0/assert/mod.ts";
import { isValidRideSession, isValidTelemetryPoint } from "../types/ride.ts";
import { isValidGroupRide } from "../types/group-ride.ts";
import { isValidDevice } from "../types/device.ts";
import {
  createMockRideSession,
  createMockTelemetryPoint,
  createMockGroupRide,
  createMockDevice,
} from "../testing/test-utils.ts";

// === RideSession Validation ===
Deno.test("isValidRideSession - false when id is missing", () => {
  const session = createMockRideSession({ id: undefined as any });
  assertEquals(isValidRideSession(session), false);
});

Deno.test("isValidRideSession - false when endedAt before startedAt", () => {
  const session = createMockRideSession({
    startedAt: "2026-06-04T10:00:00Z",
    endedAt: "2026-06-04T09:00:00Z",
  });
  assertEquals(isValidRideSession(session), false);
});

// === TelemetryPoint Validation ===
Deno.test("isValidTelemetryPoint - true for valid point", () => {
  const point = createMockTelemetryPoint();
  assertEquals(isValidTelemetryPoint(point), true);
});

Deno.test("isValidTelemetryPoint - false when latitude out of range", () => {
  const point = createMockTelemetryPoint({ latitude: 95 });
  assertEquals(isValidTelemetryPoint(point), false);
});

Deno.test("isValidTelemetryPoint - false when longitude out of range", () => {
  const point = createMockTelemetryPoint({ longitude: 200 });
  assertEquals(isValidTelemetryPoint(point), false);
});

// === GroupRide Validation ===
Deno.test("isValidGroupRide - false when status is invalid", () => {
  const ride = createMockGroupRide({ status: "cancelled" as any });
  assertEquals(isValidGroupRide(ride), false);
});

// === Device Validation ===
Deno.test("isValidDevice - true for valid device", () => {
  const device = createMockDevice();
  assertEquals(isValidDevice(device), true);
});

Deno.test("isValidDevice - false when missing required fields", () => {
  const device = createMockDevice({ id: undefined as any });
  assertEquals(isValidDevice(device), false);
});

// === Relationship-style Tests ===
Deno.test("RideSession can reference a valid device", () => {
  const device = createMockDevice();
  const session = createMockRideSession({ deviceId: device.id });
  assertEquals(session.deviceId, device.id);
  assertEquals(isValidRideSession(session), true);
});

Deno.test("TelemetryPoint belongs to a ride session context", () => {
  const point = createMockTelemetryPoint();
  const session = createMockRideSession();
  // In real usage, point would be linked via ride_session_id in DB
  assertEquals(isValidTelemetryPoint(point), true);
  assertEquals(isValidRideSession(session), true);
});