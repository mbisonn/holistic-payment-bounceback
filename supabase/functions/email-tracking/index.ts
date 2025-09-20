import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const TRANSPARENT_GIF =
  "R0lGODlhAQABAPAAAP///wAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==";

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const url = new URL(req.url);
  const type = url.pathname.endsWith("/open") ? "open" : url.pathname.endsWith("/click") ? "click" : null;
  const campaign_id = url.searchParams.get("c");
  const recipient = url.searchParams.get("r");
  const event_url = url.searchParams.get("u");

  if (!type || !campaign_id || !recipient) {
    return new Response("Missing parameters", { status: 400 });
  }

  // Log the event
  await supabase.from("email_events").insert({
    campaign_id,
    recipient,
    type,
    url: event_url,
    timestamp: new Date().toISOString(),
  });

  if (type === "open") {
    // Serve 1x1 transparent GIF
    return new Response(Uint8Array.from(atob(TRANSPARENT_GIF), c => c.charCodeAt(0)), {
      headers: {
        "Content-Type": "image/gif",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
      status: 200,
    });
  } else if (type === "click" && event_url) {
    // Redirect to the real URL
    return Response.redirect(event_url, 302);
  }

  return new Response("OK", { status: 200 });
}); 