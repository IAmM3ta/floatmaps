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
    if (action === "signal") {
      const { toRiderId, type, payload, groupRideId } = data || {};
      if (!toRiderId || !type || !payload || !groupRideId) {
        return jsonError("Missing required fields", "INVALID_INPUT", 400);
      }

      console.log(`[WalkieTalkie] Signal from ${user.id} to ${toRiderId} (${type})`);
      return jsonSuccess({ success: true });
    }

    if (action === "get_peers") {
      const { groupRideId } = data || {};
      if (!groupRideId) return jsonError("groupRideId is required", "INVALID_INPUT", 400);

      const { data: participants, error } = await supabase
        .from("group_ride_participants")
        .select("rider_id")
        .eq("group_ride_id", groupRideId);

      if (error) throw error;
      return jsonSuccess({ peers: participants.map(p => p.rider_id) });
    }

    return jsonError("Unknown action", "UNKNOWN_ACTION", 400);

  } catch (err: any) {
    console.error("WalkieTalkie error:", err);
    return jsonError(err.message || "Internal error", "INTERNAL_ERROR", 500);
  }
});