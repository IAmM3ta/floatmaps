import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

  const { action, data } = body;

  if (!action) {
    return new Response(JSON.stringify({ error: "action is required", code: "MISSING_ACTION" }), { status: 400 });
  }

  try {
    // Create new GroupRide
    if (action === "create") {
      const { name } = data || {};
      if (!name || typeof name !== "string") {
        return new Response(JSON.stringify({ error: "name is required", code: "INVALID_INPUT" }), { status: 400 });
      }

      const { data: group, error } = await supabase
        .from("group_rides")
        .insert({ name, creator_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return new Response(JSON.stringify({ group }));
    }

    // Join existing GroupRide
    if (action === "join") {
      const { groupRideId } = data || {};
      if (!groupRideId) {
        return new Response(JSON.stringify({ error: "groupRideId is required", code: "INVALID_INPUT" }), { status: 400 });
      }

      // Check if group exists and is active
      const { data: group, error: groupError } = await supabase
        .from("group_rides")
        .select("id, status")
        .eq("id", groupRideId)
        .single();

      if (groupError || !group) {
        return new Response(JSON.stringify({ error: "Group ride not found", code: "NOT_FOUND" }), { status: 404 });
      }
      if (group.status !== "active") {
        return new Response(JSON.stringify({ error: "Group ride has ended", code: "GROUP_ENDED" }), { status: 400 });
      }

      const { error: joinError } = await supabase
        .from("group_ride_participants")
        .insert({ group_ride_id: groupRideId, rider_id: user.id });

      if (joinError) {
        if (joinError.code === "23505") { // unique violation
          return new Response(JSON.stringify({ error: "Already joined this group ride", code: "ALREADY_JOINED" }), { status: 409 });
        }
        throw joinError;
      }

      return new Response(JSON.stringify({ success: true, message: "Joined group ride" }));
    }

    // Leave GroupRide
    if (action === "leave") {
      const { groupRideId } = data || {};
      if (!groupRideId) {
        return new Response(JSON.stringify({ error: "groupRideId is required", code: "INVALID_INPUT" }), { status: 400 });
      }

      const { error } = await supabase
        .from("group_ride_participants")
        .delete()
        .eq("group_ride_id", groupRideId)
        .eq("rider_id", user.id);

      if (error) throw error;
      return new Response(JSON.stringify({ success: true }));
    }

    // Update live location
    if (action === "update_location") {
      const { groupRideId, latitude, longitude } = data || {};
      if (!groupRideId || latitude == null || longitude == null) {
        return new Response(JSON.stringify({ error: "groupRideId, latitude and longitude are required", code: "INVALID_INPUT" }), { status: 400 });
      }

      const { error } = await supabase
        .from("group_ride_participants")
        .update({
          last_location: {
            latitude,
            longitude,
            updated_at: new Date().toISOString()
          }
        })
        .eq("group_ride_id", groupRideId)
        .eq("rider_id", user.id);

      if (error) throw error;
      return new Response(JSON.stringify({ success: true }));
    }

    // Get active GroupRides (with participant count)
    if (action === "list_active") {
      const { data: groups, error } = await supabase
        .from("group_rides")
        .select(`
          *,
          participant_count:group_ride_participants(count)
        `)
        .eq("status", "active");

      if (error) throw error;
      return new Response(JSON.stringify({ groups }));
    }

    return new Response(JSON.stringify({ error: "Unknown action", code: "UNKNOWN_ACTION" }), { status: 400 });

  } catch (err: any) {
    console.error("GroupRide error:", err);
    return new Response(JSON.stringify({ 
      error: err.message || "Internal server error", 
      code: "INTERNAL_ERROR" 
    }), { status: 500 });
  }
});