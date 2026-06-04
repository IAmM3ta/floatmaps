import { assertEquals } from "https://deno.land/std@0.177.0/assert/mod.ts";
import { isValidRideSession } from "../types/ride.ts";
import { isValidGroupRide } from "../types/group-ride.ts";
import {
  createMockRideSession,
  createMockGroupRide,
} from "../testing/test-utils.ts";

Deno.test("isValidRideSession - returns true for valid session", () => {
  const session = createMockRideSession();
  assertEquals(isValidRideSession(session), true);
});

Deno.test("isValidRideSession - returns false when missing required fields", () => {
  const session = createMockRideSession({ id: undefined as any });
  assertEquals(isValidRideSession(session), false);
});

Deno.test("isValidRideSession - returns false if endedAt is before startedAt", () => {
  const session = createMockRideSession({
    startedAt: "2026-06-04T10:00:00Z",
    endedAt: "2026-06-04T09:00:00Z",
  });
  assertEquals(isValidRideSession(session), false);
});

Deno.test("isValidGroupRide - returns true for valid ride", () => {
  const ride = createMockGroupRide();
  assertEquals(isValidGroupRide(ride), true);
});

Deno.test("isValidGroupRide - returns false for invalid status", () => {
  const ride = createMockGroupRide({ status: "invalid" as any });
  assertEquals(isValidGroupRide(ride), false);
});

Deno.test("isValidGroupRide - returns false if endedAt before startedAt", () => {
  const ride = createMockGroupRide({
    startedAt: "2026-06-04T10:00:00Z",
    endedAt: "2026-06-04T09:00:00Z",
  });
  assertEquals(isValidGroupRide(ride), false);
});