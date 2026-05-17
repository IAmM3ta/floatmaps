import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { riderId, rideData } = await req.json();

  if (!riderId || !rideData) {
    return new Response(JSON.stringify({ error: "riderId and rideData required" }), { status: 400 });
  }

  const { data, error } = await supabase
    .from("ride_logs")
    .insert({
      rider_id: riderId,
      ...rideData
    })
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ ride: data }), {
    headers: { "Content-Type": "application/json" },
  });
});