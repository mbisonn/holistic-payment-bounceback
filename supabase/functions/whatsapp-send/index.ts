import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { to, message, templateId, variables, mediaUrl } = await req.json();

    if (!to || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, message' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get WhatsApp settings
    const { data: settings, error: settingsError } = await supabaseClient
      .from('whatsapp_settings')
      .select('*')
      .eq('is_active', true)
      .single();

    if (settingsError || !settings) {
      return new Response(
        JSON.stringify({ error: 'WhatsApp not configured. Please configure WhatsApp settings first.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let result: any;
    let messageSid: string | undefined;

    // Send via Twilio
    if (settings.api_provider === 'twilio') {
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${settings.api_key}/Messages.json`;
      
      const formData = new URLSearchParams();
      formData.append('From', `whatsapp:${settings.phone_number}`);
      formData.append('To', `whatsapp:${to}`);
      formData.append('Body', message);
      
      if (mediaUrl) {
        formData.append('MediaUrl', mediaUrl);
      }

      const response = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${settings.api_key}:${settings.api_secret}`),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      result = await response.json();
      messageSid = result.sid;

      if (!response.ok) {
        throw new Error(result.message || 'Failed to send WhatsApp message via Twilio');
      }
    } 
    // Send via WhatsApp Business API
    else if (settings.api_provider === 'whatsapp_business_api') {
      const wabaUrl = `https://graph.facebook.com/v17.0/${settings.phone_number_id}/messages`;
      
      const payload: any = {
        messaging_product: 'whatsapp',
        to: to,
      };

      if (templateId && variables) {
        payload.type = 'template';
        payload.template = {
          name: templateId,
          language: { code: 'en' },
          components: variables,
        };
      } else {
        payload.type = 'text';
        payload.text = { body: message };
      }

      const response = await fetch(wabaUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.api_key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      result = await response.json();
      messageSid = result.messages?.[0]?.id;

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to send WhatsApp message via Business API');
      }
    } else {
      return new Response(
        JSON.stringify({ error: 'Unsupported API provider' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log message in database
    const { error: logError } = await supabaseClient.from('whatsapp_messages').insert({
      customer_phone: to,
      direction: 'outbound',
      status: 'sent',
      message_body: message,
      message_sid: messageSid,
      media_url: mediaUrl,
    });

    if (logError) {
      console.error('Failed to log message:', logError);
    }

    return new Response(
      JSON.stringify({ success: true, data: result, message_sid: messageSid }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('WhatsApp send error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
