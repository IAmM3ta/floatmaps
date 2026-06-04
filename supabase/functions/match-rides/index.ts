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
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  const { latitude, longitude, maxDistanceKm, timeWindowHours } = body;

  if (!latitude || !longitude) {
    return new Response(JSON.stringify({ error: "latitude and longitude are required" }), { status: 400 });
  }

  // Fetch active group rides
  const { data: rides, error } = await supabase
    .from("group_rides")
    .select("*")
    .eq("status", "active");

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  const matched = findMatchingRides(rides || [], { latitude, longitude }, {
    maxDistanceKm: maxDistanceKm ?? 50,
    timeWindowHours: timeWindowHours ?? 4,
  });

  return new Response(JSON.stringify({ matches: matched }), {
    headers: { "Content-Type": "application/json" },
  });
});