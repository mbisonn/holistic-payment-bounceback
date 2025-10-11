import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SendCampaignPayload {
  campaign_id: string
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { campaign_id } = (await req.json()) as SendCampaignPayload
    
    if (!campaign_id) {
      return new Response(
        JSON.stringify({ error: 'Missing campaign_id' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Processing campaign:', campaign_id)

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('whatsapp_campaigns')
      .select('*, whatsapp_templates(*)')
      .eq('id', campaign_id)
      .single()

    if (campaignError || !campaign) {
      console.error('Campaign error:', campaignError)
      return new Response(
        JSON.stringify({ error: 'Campaign not found' }), 
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get target customers based on tags
    let customersQuery = supabase.from('customer_tag_assignments').select('customer_email, customer_name')
    
    if (campaign.target_tags && campaign.target_tags.length > 0) {
      customersQuery = customersQuery.in('tag_id', campaign.target_tags)
    }

    const { data: customers, error: customersError } = await customersQuery

    if (customersError) {
      console.error('Customers error:', customersError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch recipients' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const uniqueCustomers = Array.from(
      new Map(customers?.map(c => [c.customer_email, c]) || []).values()
    )

    console.log(`Sending to ${uniqueCustomers.length} customers`)

    // Update campaign with total recipients
    await supabase
      .from('whatsapp_campaigns')
      .update({ 
        total_recipients: uniqueCustomers.length,
        status: 'sending'
      })
      .eq('id', campaign_id)

    // Send messages in background
    let sent = 0
    let failed = 0

    for (const customer of uniqueCustomers) {
      try {
        // Call send-whatsapp function
        const sendResponse = await fetch(`${supabaseUrl}/functions/v1/send-whatsapp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`
          },
          body: JSON.stringify({
            to: customer.customer_email, // Assuming email contains phone
            name: customer.customer_name,
            content: campaign.whatsapp_templates?.template_body || '',
            template_id: campaign.template_id
          })
        })

        if (sendResponse.ok) {
          sent++
        } else {
          failed++
          console.error('Failed to send to:', customer.customer_email)
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (error) {
        console.error('Error sending to customer:', error)
        failed++
      }
    }

    // Update campaign status
    await supabase
      .from('whatsapp_campaigns')
      .update({ 
        sent_count: sent,
        failed_count: failed,
        status: 'completed'
      })
      .eq('id', campaign_id)

    console.log(`Campaign complete: ${sent} sent, ${failed} failed`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent,
        failed,
        total: uniqueCustomers.length 
      }), 
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (e) {
    console.error('Error in campaign function:', e)
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : 'Internal server error' }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})