import { assertEquals } from "https://deno.land/std@0.177.0/assert/mod.ts";
import { isValidRideSession } from "../types/ride.ts";
import { isValidGroupRide } from "../types/group-ride.ts";
import {
  createMockRideSession,
  createMockGroupRide,
} from "../testing/test-utils.ts";

// === RideSession Edge Cases ===

Deno.test("isValidRideSession - false when id is missing", () => {
  const session = createMockRideSession({ id: undefined as any });
  assertEquals(isValidRideSession(session), false);
});

Deno.test("isValidRideSession - false when riderId is missing", () => {
  const session = createMockRideSession({ riderId: undefined as any });
  assertEquals(isValidRideSession(session), false);
});

Deno.test("isValidRideSession - false when startedAt is missing", () => {
  const session = createMockRideSession({ startedAt: undefined as any });
  assertEquals(isValidRideSession(session), false);
});

Deno.test("isValidRideSession - false when isPublic is not boolean", () => {
  const session = createMockRideSession({ isPublic: "yes" as any });
  assertEquals(isValidRideSession(session), false);
});

Deno.test("isValidRideSession - false when endedAt is before startedAt", () => {
  const session = createMockRideSession({
    startedAt: "2026-06-04T12:00:00Z",
    endedAt: "2026-06-04T11:00:00Z",
  });
  assertEquals(isValidRideSession(session), false);
});

Deno.test("isValidRideSession - true when endedAt is after startedAt", () => {
  const session = createMockRideSession({
    startedAt: "2026-06-04T10:00:00Z",
    endedAt: "2026-06-04T12:00:00Z",
  });
  assertEquals(isValidRideSession(session), true);
});

// === GroupRide Edge Cases ===

Deno.test("isValidGroupRide - false when id is missing", () => {
  const ride = createMockGroupRide({ id: undefined as any });
  assertEquals(isValidGroupRide(ride), false);
});

Deno.test("isValidGroupRide - false when name is missing", () => {
  const ride = createMockGroupRide({ name: undefined as any });
  assertEquals(isValidGroupRide(ride), false);
});

Deno.test("isValidGroupRide - false when creatorId is missing", () => {
  const ride = createMockGroupRide({ creatorId: undefined as any });
  assertEquals(isValidGroupRide(ride), false);
});

Deno.test("isValidGroupRide - false when status is invalid", () => {
  const ride = createMockGroupRide({ status: "cancelled" as any });
  assertEquals(isValidGroupRide(ride), false);
});

Deno.test("isValidGroupRide - false when endedAt before startedAt", () => {
  const ride = createMockGroupRide({
    startedAt: "2026-06-04T10:00:00Z",
    endedAt: "2026-06-04T09:00:00Z",
  });
  assertEquals(isValidGroupRide(ride), false);
});

Deno.test("isValidGroupRide - true for minimal valid ride", () => {
  const ride = createMockGroupRide();
  assertEquals(isValidGroupRide(ride), true);
});