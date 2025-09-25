// Deno Deploy Edge Function: send-whatsapp
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.1'

interface SendWhatsAppPayload {
  to: string
  name?: string
  content: string
}

export default async function handler(req: Request): Promise<Response> {
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { to, name, content } = (await req.json()) as SendWhatsAppPayload
    if (!to || !content) {
      return new Response(JSON.stringify({ error: 'Missing to or content' }), { status: 400 })
    }

    // Load WhatsApp configuration
    const { data: config } = await supabase.from('whatsapp_config').select('*').eq('is_active', true).limit(1).single()
    if (!config) {
      return new Response(JSON.stringify({ error: 'WhatsApp not configured' }), { status: 400 })
    }

    // Placeholder: integrate with WhatsApp Business API provider here
    // For now, simulate success
    const providerResponse = { id: `msg_${Date.now()}`, status: 'sent' }

    await supabase.from('whatsapp_messages').insert({
      customer_phone: to,
      customer_name: name || 'Customer',
      template_id: null,
      content,
      status: providerResponse.status,
      sent_at: new Date().toISOString()
    })

    return new Response(JSON.stringify({ ok: true, providerResponse }), { status: 200 })
  } catch (e) {
    console.error(e)
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500 })
  }
}

// Invoke URL: /functions/v1/send-whatsapp


