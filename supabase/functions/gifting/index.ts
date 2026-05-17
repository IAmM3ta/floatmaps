import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { action, data } = await req.json();

  if (action === 'create_gift') {
    const { fromRiderId, rideLogId, giftedWh, toRiderId } = data;
    
    const qrToken = crypto.randomUUID();
    
    const { data: gift, error } = await supabase
      .from('energy_gifts')
      .insert({
        from_rider_id: fromRiderId,
        to_rider_id: toRiderId || null,
        original_ride_log_id: rideLogId,
        gifted_wh: giftedWh,
        qr_token: qrToken,
        status: 'pending'
      })
      .select()
      .single();

    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    
    return new Response(JSON.stringify({ gift, qr_token: qrToken }), {
      headers: { "Content-Type": "application/json" }
    });
  }

  if (action === 'redeem_gift') {
    const { qrToken, claimingRiderId, newRideLogId } = data;
    
    const { data: gift, error } = await supabase
      .from('energy_gifts')
      .update({ 
        status: 'claimed', 
        to_rider_id: claimingRiderId,
        claimed_ride_log_id: newRideLogId 
      })
      .eq('qr_token', qrToken)
      .select()
      .single();

    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    
    return new Response(JSON.stringify({ gift, message: "Gift claimed. Original user will receive credit on return." }), {
      headers: { "Content-Type": "application/json" }
    });
  }

  return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400 });
});