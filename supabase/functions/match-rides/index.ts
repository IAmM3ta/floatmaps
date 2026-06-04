import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { findMatchingRides } from "@floatmaps/core/matching/ride-matcher";

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized", code: "AUTH_REQUIRED" }), { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body", code: "INVALID_JSON" }), { status: 400 });
  }

  const { latitude, longitude, maxDistanceKm, timeWindowHours, geofence } = body;

  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return new Response(JSON.stringify({ error: "latitude and longitude are required", code: "MISSING_LOCATION" }), { status: 400 });
  }

  const { data: rides, error } = await supabase
    .from("group_rides")
    .select("*")
    .eq("status", "active");

  if (error) {
    return new Response(JSON.stringify({ error: error.message, code: "DB_ERROR" }), { status: 500 });
  }

  try {
    const matched = findMatchingRides(rides || [], { latitude, longitude }, {
      maxDistanceKm: maxDistanceKm ?? 50,
      timeWindowHours: timeWindowHours ?? 4,
      geofence,
    });

    return new Response(JSON.stringify({ matches: matched, count: matched.length }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Matching failed", code: "MATCHING_ERROR" }), { status: 500 });
  }
});