import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Secure TURN Credential Provider
 * 
 * This Edge Function returns short-lived TURN credentials to authenticated users.
 * Never expose long-lived TURN credentials to the client.
 * 
 * Recommended: Use a TURN provider that supports time-limited credentials
 * (e.g. Twilio, Xirsys, Metered.ca, or self-hosted with coturn + auth).
 */
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

  // TODO: Replace with your actual TURN provider credentials or API call
  // Example using environment variables (recommended)
  const turnConfig = {
    urls: [
      Deno.env.get("TURN_URL") || "turn:your-turn.example.com:3478",
      Deno.env.get("TURNS_URL") || "turns:your-turn.example.com:5349"
    ],
    username: Deno.env.get("TURN_USERNAME") || "username",
    credential: Deno.env.get("TURN_CREDENTIAL") || "password",
    // Optional: Add ttl if your provider supports short-lived credentials
    // ttl: 3600
  };

  return new Response(JSON.stringify({ turn: turnConfig }), {
    headers: { "Content-Type": "application/json" }
  });
});