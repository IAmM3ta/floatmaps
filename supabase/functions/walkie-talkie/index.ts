import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Simple in-memory signaling relay (for MVP)
// In production, replace with persistent storage or Supabase Realtime
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

  const body = await req.json();
  const { action, data } = body;

  if (!action) {
    return new Response(JSON.stringify({ error: "action required" }), { status: 400 });
  }

  // Send signaling message (offer, answer, ice-candidate)
  if (action === "signal") {
    const { toRiderId, type, payload, groupRideId } = data;
    
    if (!toRiderId || !type || !payload || !groupRideId) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    // For MVP we just echo/log. In real impl, use Supabase Realtime or a dedicated signaling table
    console.log(`[WalkieTalkie] Signal from ${user.id} to ${toRiderId} (${type}) in group ${groupRideId}`);
    
    // TODO: Broadcast via Supabase Realtime channel `walkie-${groupRideId}`
    return new Response(JSON.stringify({ success: true }));
  }

  // Get active participants for mesh setup
  if (action === "get_peers") {
    const { groupRideId } = data;
    if (!groupRideId) {
      return new Response(JSON.stringify({ error: "groupRideId required" }), { status: 400 });
    }

    const { data: participants, error } = await supabase
      .from("group_ride_participants")
      .select("rider_id")
      .eq("group_ride_id", groupRideId);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ peers: participants.map(p => p.rider_id) }));
  }

  return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400 });
});