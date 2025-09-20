import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

serve(async (req) => {
  const { email, firstName, lastName, role } = await req.json();
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // 1. Create user if not exists
  let { data: user, error } = await supabase.auth.admin.getUserByEmail(email);
  if (!user) {
    const { data, error: createError } = await supabase.auth.admin.createUser({
      email,
      user_metadata: { firstName, lastName },
      email_confirm: false,
    });
    if (createError) return new Response(JSON.stringify({ error: createError.message }), { status: 400 });
    user = data.user;
  }

  // 2. Add role and status to user_roles
  const { error: roleError } = await supabase
    .from("user_roles")
    .upsert([{ user_id: user.id, role, status: "invited" }], { onConflict: "user_id,role" });
  if (roleError) return new Response(JSON.stringify({ error: roleError.message }), { status: 400 });

  // 3. Send invite email
  const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email);
  if (inviteError) return new Response(JSON.stringify({ error: inviteError.message }), { status: 400 });

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}); 