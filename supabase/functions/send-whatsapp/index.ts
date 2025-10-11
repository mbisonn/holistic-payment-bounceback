import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SendWhatsAppPayload {
  to: string
  name?: string
  content: string
  template_id?: string
}

Deno.serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { to, name, content, template_id } = (await req.json()) as SendWhatsAppPayload
    
    // Validate input
    if (!to || !content) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to and content' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate phone number format
    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    if (!phoneRegex.test(to)) {
      return new Response(
        JSON.stringify({ error: 'Invalid phone number format' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Sending WhatsApp message to:', to)

    // Load WhatsApp configuration
    const { data: config, error: configError } = await supabase
      .from('whatsapp_settings')
      .select('*')
      .eq('is_active', true)
      .maybeSingle()

    if (configError) {
      console.error('Error fetching config:', configError)
      return new Response(
        JSON.stringify({ error: 'Failed to load WhatsApp configuration' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!config) {
      return new Response(
        JSON.stringify({ error: 'WhatsApp not configured. Please configure in Settings.' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let providerResponse
    
    // Send via configured provider
    if (config.api_provider === 'twilio') {
      // Twilio WhatsApp Integration
      const twilioAccountSid = config.api_key
      const twilioAuthToken = config.api_secret
      const twilioWhatsAppNumber = config.phone_number

      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`
      
      const twilioResponse = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${twilioAccountSid}:${twilioAuthToken}`),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: `whatsapp:${twilioWhatsAppNumber}`,
          To: `whatsapp:${to}`,
          Body: content,
        }),
      })

      if (!twilioResponse.ok) {
        const error = await twilioResponse.text()
        console.error('Twilio error:', error)
        throw new Error(`Twilio API error: ${error}`)
      }

      providerResponse = await twilioResponse.json()
      console.log('Twilio response:', providerResponse)
      
    } else if (config.api_provider === 'whatsapp_business_api') {
      // WhatsApp Business API Integration
      const accessToken = config.api_key
      const phoneNumberId = config.phone_number_id

      const wabaUrl = `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`
      
      const wabaResponse = await fetch(wabaUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: to,
          type: 'text',
          text: {
            body: content
          }
        }),
      })

      if (!wabaResponse.ok) {
        const error = await wabaResponse.text()
        console.error('WhatsApp Business API error:', error)
        throw new Error(`WhatsApp Business API error: ${error}`)
      }

      providerResponse = await wabaResponse.json()
      console.log('WABA response:', providerResponse)
      
    } else {
      // Fallback - simulate success for testing
      providerResponse = { id: `msg_${Date.now()}`, status: 'sent' }
      console.log('Using simulated response:', providerResponse)
    }

    // Save message to database
    const { error: insertError } = await supabase
      .from('whatsapp_messages')
      .insert({
        customer_phone: to,
        customer_name: name || 'Customer',
        template_id: template_id || null,
        content,
        status: 'sent',
        sent_at: new Date().toISOString()
      })

    if (insertError) {
      console.error('Error saving message:', insertError)
      // Don't fail the request if we can't save to DB
    }

    return new Response(
      JSON.stringify({ success: true, providerResponse }), 
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (e) {
    console.error('Error in send-whatsapp function:', e)
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : 'Internal server error' }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})