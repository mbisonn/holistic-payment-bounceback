// Edge function for email tracking - not using Vercel types
export interface TrackingRequest {
  url?: string;
  mid?: string;
  recipient?: string;
  campaign_id?: string;
}
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// 1x1 transparent GIF
const pixel = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==',
  'base64'
);

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url || '');
  const { pathname, searchParams } = url;

  if (pathname.endsWith('/pixel')) {
    // /api/email-tracking/pixel?mid=messageId&recipient=...&campaign_id=...
    const mid = searchParams.get('mid');
    const recipient = searchParams.get('recipient');
    const campaign_id = searchParams.get('campaign_id');
    if (mid) {
      await supabase.from('email_events').insert({
        message_id: mid,
        event_type: 'open',
        recipient: recipient || null,
        campaign_id: campaign_id || null,
      });
    }
    return new Response(pixel, {
      status: 200,
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  }

  if (pathname.endsWith('/click')) {
    // /api/email-tracking/click?mid=messageId&url=encodedUrl&recipient=...&campaign_id=...
    const mid = searchParams.get('mid');
    const clickUrl = searchParams.get('url');
    const recipient = searchParams.get('recipient');
    const campaign_id = searchParams.get('campaign_id');
    if (mid) {
      await supabase.from('email_events').insert({
        message_id: mid,
        event_type: 'click',
        url: clickUrl ? decodeURIComponent(clickUrl) : null,
        recipient: recipient || null,
        campaign_id: campaign_id || null,
      });
    }
    if (clickUrl) {
      const realUrl = decodeURIComponent(clickUrl);
      return Response.redirect(realUrl, 302);
    }
    return new Response('Missing url', { status: 400 });
  }

  // For demo: return stats (from DB)
  if (pathname.endsWith('/stats')) {
    const { data } = await supabase.from('email_events').select('*').order('timestamp', { ascending: false }).limit(100);
    return Response.json({ events: data });
  }

  return new Response('Not found', { status: 404 });
} 