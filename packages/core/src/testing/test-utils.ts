import { assertEquals, assertExists } from "https://deno.land/std@0.177.0/assert/mod.ts";
import type { RideSession, RideTelemetryPoint, GroupRide, PEVDevice } from "../types/mod.ts";

/**
 * Test utilities for @floatmaps/core
 */

export function createMockRideSession(overrides: Partial<RideSession> = {}): RideSession {
  return {
    id: crypto.randomUUID(),
    riderId: crypto.randomUUID(),
    deviceId: undefined,
    startedAt: new Date().toISOString(),
    endedAt: undefined,
    durationSeconds: undefined,
    distanceMeters: undefined,
    maxSpeedKmh: undefined,
    avgSpeedKmh: undefined,
    totalWhUsed: undefined,
    isPublic: false,
    metadata: {},
    ...overrides,
  };
}

export function createMockTelemetryPoint(overrides: Partial<RideTelemetryPoint> = {}): RideTelemetryPoint {
  return {
    recordedAt: new Date().toISOString(),
    latitude: 35.5951,
    longitude: -82.5515,
    altitude: 650,
    speedKmh: 25,
    heading: 180,
    batterySoc: 87,
    powerWatts: 420,
    metadata: {},
    ...overrides,
  };
}

export function createMockGroupRide(overrides: Partial<GroupRide> = {}): GroupRide {
  return {
    id: crypto.randomUUID(),
    name: "Test Group Ride",
    creatorId: crypto.randomUUID(),
    status: "active",
    startedAt: new Date().toISOString(),
    endedAt: undefined,
    metadata: {},
    ...overrides,
  };
}

export function createMockDevice(overrides: Partial<PEVDevice> = {}): PEVDevice {
  return {
    id: crypto.randomUUID(),
    riderId: crypto.randomUUID(),
    deviceType: "FloatWheel",
    model: "ADV Pro",
    voltageConfig: "84V",
    metadata: {},
    ...overrides,
  };
}

export function assertValidRideSession(session: RideSession) {
  assertExists(session.id);
  assertExists(session.riderId);
  assertExists(session.startedAt);
  assertEquals(typeof session.isPublic, "boolean");
}