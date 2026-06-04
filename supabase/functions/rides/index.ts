import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const { action, data } = await req.json();

  // Start ride
  if (action === "start_ride") {
    const { deviceId } = data;
    const { data: session, error } = await supabase
      .from("ride_sessions")
      .insert({ rider_id: user.id, device_id: deviceId || null, started_at: new Date().toISOString() })
      .select()
      .single();

    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    return new Response(JSON.stringify({ session }));
  }

  // End ride + summary
  if (action === "end_ride") {
    const { sessionId, summary } = data;
    const { data: session, error } = await supabase
      .from("ride_sessions")
      .update({
        ended_at: new Date().toISOString(),
        distance_meters: summary?.distanceMeters,
        max_speed_kmh: summary?.maxSpeedKmh,
        avg_speed_kmh: summary?.avgSpeedKmh,
        total_wh_used: summary?.totalWhUsed,
        metadata: summary?.metadata || {},
      })
      .eq("id", sessionId)
      .eq("rider_id", user.id)
      .select()
      .single();

    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    return new Response(JSON.stringify({ session }));
  }

  // Batch insert telemetry
  if (action === "add_telemetry") {
    const { sessionId, points } = data;
    if (!Array.isArray(points)) return new Response(JSON.stringify({ error: "points must be array" }), { status: 400 });

    const records = points.map((p: any) => ({
      ride_session_id: sessionId,
      recorded_at: p.recordedAt,
      latitude: p.latitude,
      longitude: p.longitude,
      altitude: p.altitude,
      speed_kmh: p.speedKmh,
      heading: p.heading,
      battery_soc: p.batterySoc,
      power_watts: p.powerWatts,
      metadata: p.metadata || {},
    }));

    const { error } = await supabase.from("ride_telemetry").insert(records);
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

    return new Response(JSON.stringify({ success: true, count: records.length }));
  }

  return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400 });
});