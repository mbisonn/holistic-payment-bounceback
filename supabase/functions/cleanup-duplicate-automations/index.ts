import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Delete all Google Review Request Automation entries
    const { error: deleteError } = await supabase
      .from('automation_rules')
      .delete()
      .eq('name', 'Google Review Request Automation');

    if (deleteError) {
      throw deleteError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Duplicate Google Review automations cleaned up successfully' 
      }),
      { 
        status: 200, 
        headers: { "Content-Type": "application/json" } 
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json" } 
      }
    );
  }
});
