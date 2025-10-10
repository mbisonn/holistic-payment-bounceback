import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

serve(async (req: Request) => {
  // Handle webhook verification (for WhatsApp Business API)
  if (req.method === 'GET') {
    const url = new URL(req.url);
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    // Get verify token from settings
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: settings } = await supabaseClient
      .from('whatsapp_settings')
      .select('webhook_verify_token')
      .eq('is_active', true)
      .single();

    if (mode === 'subscribe' && token === settings?.webhook_verify_token) {
      return new Response(challenge, { status: 200 });
    }

    return new Response('Forbidden', { status: 403 });
  }

  // Handle incoming webhooks (POST)
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json();
    console.log('Webhook received:', JSON.stringify(body, null, 2));

    // Handle Twilio webhook
    if (body.MessageSid && body.From) {
      const from = body.From.replace('whatsapp:', '');
      const messageBody = body.Body || '';
      const messageSid = body.MessageSid;
      const messageStatus = body.MessageStatus;

      // If it's an incoming message
      if (body.From && body.Body) {
        await supabaseClient.from('whatsapp_messages').insert({
          customer_phone: from,
          customer_name: body.ProfileName,
          direction: 'inbound',
          status: 'received',
          message_body: messageBody,
          message_sid: messageSid,
          media_url: body.MediaUrl0,
          media_content_type: body.MediaContentType0,
        });
      }

      // If it's a status update
      if (messageStatus && messageSid) {
        await supabaseClient
          .from('whatsapp_messages')
          .update({ status: messageStatus.toLowerCase() })
          .eq('message_sid', messageSid);
      }
    }

    // Handle WhatsApp Business API webhook
    if (body.entry && Array.isArray(body.entry)) {
      for (const entry of body.entry) {
        const changes = entry.changes || [];
        for (const change of changes) {
          const value = change.value;
          
          // Handle incoming messages
          if (value.messages && Array.isArray(value.messages)) {
            for (const msg of value.messages) {
              const from = msg.from;
              const messageId = msg.id;
              const messageType = msg.type;
              let messageBody = '';

              if (messageType === 'text') {
                messageBody = msg.text?.body || '';
              } else if (messageType === 'image') {
                messageBody = msg.image?.caption || '[Image]';
              } else if (messageType === 'document') {
                messageBody = msg.document?.caption || '[Document]';
              }

              await supabaseClient.from('whatsapp_messages').insert({
                customer_phone: from,
                direction: 'inbound',
                status: 'received',
                message_body: messageBody,
                message_sid: messageId,
                media_url: msg.image?.id || msg.document?.id,
              });
            }
          }

          // Handle status updates
          if (value.statuses && Array.isArray(value.statuses)) {
            for (const status of value.statuses) {
              const messageId = status.id;
              const statusValue = status.status;

              await supabaseClient
                .from('whatsapp_messages')
                .update({ status: statusValue })
                .eq('message_sid', messageId);
            }
          }
        }
      }
    }

    return new Response('OK', { status: 200 });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
