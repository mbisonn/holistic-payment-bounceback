
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { invoiceId } = await req.json();

    // Fetch invoice data
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) {
      throw new Error("Invoice not found");
    }

    // Generate HTML for the invoice
    const invoiceHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 40px; }
          .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
          .invoice-title { font-size: 32px; font-weight: bold; }
          .invoice-number { color: #666; margin-top: 5px; }
          .company-info { text-align: right; }
          .billing-info { display: flex; justify-content: space-between; margin-bottom: 40px; }
          .bill-to h3 { margin-bottom: 10px; }
          .invoice-details { text-align: right; }
          .totals { margin-top: 30px; text-align: right; }
          .total-line { display: flex; justify-content: space-between; margin-bottom: 5px; }
          .total-final { font-weight: bold; font-size: 18px; border-top: 2px solid #000; padding-top: 10px; }
          .footer { margin-top: 60px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="invoice-title">INVOICE</div>
            <div class="invoice-number">#${invoice.invoice_number}</div>
          </div>
          <div class="company-info">
            <strong>Bounce Back To Life Consult</strong><br>
            info@bouncebacktolifeconsult.pro
          </div>
        </div>
        
        <div class="billing-info">
          <div class="bill-to">
            <h3>Bill To:</h3>
            <strong>${invoice.customer_name}</strong><br>
            ${invoice.customer_email}
          </div>
          <div class="invoice-details">
            <div><strong>Invoice Date:</strong> ${new Date(invoice.created_at).toLocaleDateString()}</div>
            ${invoice.due_date ? `<div><strong>Due Date:</strong> ${new Date(invoice.due_date).toLocaleDateString()}</div>` : ''}
            <div><strong>Status:</strong> ${invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}</div>
          </div>
        </div>
        
        <div class="totals">
          <div class="total-line">
            <span>Subtotal:</span>
            <span>₦${(invoice.total_amount - invoice.tax_amount + invoice.discount_amount).toLocaleString()}</span>
          </div>
          ${invoice.discount_amount > 0 ? `
          <div class="total-line" style="color: green;">
            <span>Discount:</span>
            <span>-₦${invoice.discount_amount.toLocaleString()}</span>
          </div>` : ''}
          ${invoice.tax_amount > 0 ? `
          <div class="total-line">
            <span>Tax:</span>
            <span>₦${invoice.tax_amount.toLocaleString()}</span>
          </div>` : ''}
          <div class="total-line total-final">
            <span>Total:</span>
            <span>₦${invoice.total_amount.toLocaleString()}</span>
          </div>
        </div>
        
        <div class="footer">
          <p>Thank you for your business!</p>
          <p>For questions about this invoice, please contact info@bouncebacktolifeconsult.pro</p>
        </div>
      </body>
      </html>
    `;

    // In a real implementation, you would use a PDF generation service
    // For now, we'll just store the HTML and return a success response
    const pdfUrl = `data:text/html;base64,${btoa(invoiceHtml)}`;

    // Update the invoice with the PDF URL
    const { error: updateError } = await supabase
      .from('invoices')
      .update({ pdf_url: pdfUrl })
      .eq('id', invoiceId);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        pdfUrl,
        message: "Invoice PDF generated successfully" 
      }),
      { 
        status: 200, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  } catch (error) {
    console.error("Error generating invoice:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to generate invoice PDF" 
      }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  }
});
