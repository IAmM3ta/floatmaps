import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!
  );

  const { deviceType, voltageConfig } = await req.json();

  let query = supabase.from('pev_devices').select('*');

  if (deviceType) query = query.eq('device_type', deviceType);
  if (voltageConfig) query = query.ilike('voltage_config', `%${voltageConfig}%`);

  const { data, error } = await query;

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  return new Response(JSON.stringify({ devices: data }), {
    headers: { "Content-Type": "application/json" },
  });
});