// @deno-types="https://deno.land/std@0.181.0/http/server.d.ts"
import { serve } from "https://deno.land/std/http/server.ts";
// @deno-types="https://esm.sh/v135/@supabase/supabase-js@2.39.7/dist/module/index.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

serve(async (req: Request): Promise<Response> => {
  const supabaseUrl = (typeof process !== "undefined" && process.env && process.env.SUPABASE_URL)
    ? process.env.SUPABASE_URL
    : (globalThis?.Deno?.env?.get("SUPABASE_URL") ?? '');
  const supabaseKey = (typeof process !== "undefined" && process.env && process.env.SUPABASE_SERVICE_ROLE_KEY)
    ? process.env.SUPABASE_SERVICE_ROLE_KEY
    : (globalThis?.Deno?.env?.get("SUPABASE_SERVICE_ROLE_KEY") ?? '');
  const supabase = createClient(supabaseUrl, supabaseKey);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method === "GET") {
    const { data, error } = await supabase.from("email_settings").select("*").limit(1).single();
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
    }
    return new Response(JSON.stringify(data), { status: 200, headers: corsHeaders });
  }

  if (req.method === "POST") {
    const body = await req.json();
    // Update the first row (assuming single row setup)
    const { data: existing, error: getError } = await supabase.from("email_settings").select("id").limit(1).single();
    if (getError || !existing) {
      return new Response(JSON.stringify({ error: "No settings row found" }), { status: 404, headers: corsHeaders });
    }
    const { error: updateError } = await supabase.from("email_settings").update({
      sender_name: body.senderName,
      sender_email: body.senderEmail,
      smtp_host: body.smtpHost,
      smtp_port: body.smtpPort,
      smtp_user: body.smtpUser,
      smtp_pass: body.smtpPass
    }).eq("id", existing.id);
    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message }), { status: 500, headers: corsHeaders });
    }
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: corsHeaders });
}); 