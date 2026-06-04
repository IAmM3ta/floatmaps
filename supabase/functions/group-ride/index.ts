import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { 
  createSupabaseClient, 
  getAuthenticatedUser, 
  jsonError, 
  jsonSuccess 
} from "@shared/utils.ts";

serve(async (req) => {
  const supabase = createSupabaseClient(req);

  let user;
  try {
    user = await getAuthenticatedUser(supabase);
  } catch {
    return jsonError("Unauthorized", "AUTH_REQUIRED", 401);
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON body", "INVALID_JSON", 400);
  }

  const { action, data } = body;

  if (!action) {
    return jsonError("action is required", "MISSING_ACTION", 400);
  }

  try {
    if (action === "create") {
      const { name } = data || {};
      if (!name) return jsonError("name is required", "INVALID_INPUT", 400);

      const { data: group, error } = await supabase
        .from("group_rides")
        .insert({ name, creator_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return jsonSuccess({ group });
    }

    if (action === "join") {
      const { groupRideId } = data || {};
      if (!groupRideId) return jsonError("groupRideId is required", "INVALID_INPUT", 400);

      const { data: group } = await supabase
        .from("group_rides")
        .select("status")
        .eq("id", groupRideId)
        .single();

      if (!group) return jsonError("Group ride not found", "NOT_FOUND", 404);
      if (group.status !== "active") return jsonError("Group ride has ended", "GROUP_ENDED", 400);

      const { error: joinError } = await supabase
        .from("group_ride_participants")
        .insert({ group_ride_id: groupRideId, rider_id: user.id });

      if (joinError?.code === "23505") {
        return jsonError("Already joined this group ride", "ALREADY_JOINED", 409);
      }
      if (joinError) throw joinError;

      return jsonSuccess({ success: true });
    }

    if (action === "leave") {
      const { groupRideId } = data || {};
      if (!groupRideId) return jsonError("groupRideId is required", "INVALID_INPUT", 400);

      await supabase
        .from("group_ride_participants")
        .delete()
        .eq("group_ride_id", groupRideId)
        .eq("rider_id", user.id);

      return jsonSuccess({ success: true });
    }

    if (action === "update_location") {
      const { groupRideId, latitude, longitude } = data || {};
      if (!groupRideId || latitude == null || longitude == null) {
        return jsonError("Missing required fields", "INVALID_INPUT", 400);
      }

      await supabase
        .from("group_ride_participants")
        .update({
          last_location: { latitude, longitude, updated_at: new Date().toISOString() }
        })
        .eq("group_ride_id", groupRideId)
        .eq("rider_id", user.id);

      return jsonSuccess({ success: true });
    }

    if (action === "get_participants") {
      const { groupRideId } = data || {};
      if (!groupRideId) return jsonError("groupRideId is required", "INVALID_INPUT", 400);

      const { data: participants, error } = await supabase
        .from("group_ride_participants")
        .select("rider_id, joined_at, last_location")
        .eq("group_ride_id", groupRideId);

      if (error) throw error;
      return jsonSuccess({ participants });
    }

    if (action === "list_active") {
      const { data: groups, error } = await supabase
        .from("group_rides")
        .select(`*, participant_count:group_ride_participants(count)`)
        .eq("status", "active");

      if (error) throw error;
      return jsonSuccess({ groups });
    }

    return jsonError("Unknown action", "UNKNOWN_ACTION", 400);

  } catch (err: any) {
    console.error("GroupRide error:", err);
    return jsonError(err.message || "Internal error", "INTERNAL_ERROR", 500);
  }
});