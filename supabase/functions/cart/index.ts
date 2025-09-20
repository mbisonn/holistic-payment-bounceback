
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { products } from "./products.ts"; // We'll create this file next

// Define CORS headers to allow requests from the sales page
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

// Handle requests
serve(async (req) => {
  console.log("Cart function called with method:", req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  // Only allow POST method
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { headers: corsHeaders, status: 405 }
    );
  }

  try {
    // Parse the request body with validation
    let cartData;
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      // Handle JSON data
      try {
        cartData = await req.json();
        console.log("Received JSON cart data:", cartData);
      } catch (e) {
        throw new Error("Invalid JSON format");
      }
    } else if (contentType.includes('multipart/form-data')) {
      // Handle form data
      try {
        const formData = await req.formData();
        const cartDataString = formData.get('cart_data');
        if (cartDataString && typeof cartDataString === 'string') {
          cartData = JSON.parse(cartDataString);
          console.log("Received form data cart:", cartData);
        } else {
          throw new Error("Missing or invalid cart_data in form");
        }
      } catch (e) {
        throw new Error(`Error processing form data: ${e.message}`);
      }
    } else {
      // Try to parse as JSON anyway as fallback
      try {
        cartData = await req.json();
        console.log("Parsed non-JSON request as JSON:", cartData);
      } catch (e) {
        throw new Error("Unsupported content type");
      }
    }

    // Validate the cart data
    if (!cartData || !Array.isArray(cartData.items)) {
      throw new Error("Invalid cart data format");
    }

    // Validate and match products by SKU
    const sanitizedItems = cartData.items.map((item: any) => {
      // Basic validation for required fields
      if (!item.id && !item.sku) {
        throw new Error("Each item must have a valid ID or SKU");
      }
      
      // Try to match by SKU first
      let sku = item.sku || item.id;
      let matchedProduct = products[sku];
      
      // If not found by direct match, try case-insensitive search
      if (!matchedProduct) {
        const normalizedSku = sku.toLowerCase().replace(/[_-]/g, '');
        const productKey = Object.keys(products).find(key => 
          key.toLowerCase().replace(/[_-]/g, '') === normalizedSku);
        
        if (productKey) {
          matchedProduct = products[productKey];
          sku = productKey; // Use the correct SKU from our catalog
        }
      }
      
      // Use matched product data or fallback to provided data
      const price = matchedProduct ? matchedProduct.price : 
        (typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0);
      
      const name = matchedProduct ? matchedProduct.name : 
        (item.name || 'Unknown Item');
      
      // Return sanitized item
      return {
        id: sku.trim().slice(0, 100),
        sku: sku.trim().slice(0, 100),
        name: name.trim().slice(0, 255),
        price: Math.max(0, price),
        quantity: Math.max(1, parseInt(item.quantity) || 1)
      };
    });
    
    // Generate a secure session ID
    const sessionId = crypto.randomUUID();
    
    // Store the sanitized cart data
    await Deno.env.set(`CART_${sessionId}`, JSON.stringify({
      items: sanitizedItems,
      timestamp: new Date().toISOString()
    }));

    // Return success response with session ID for retrieval
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Cart data received successfully",
        itemCount: sanitizedItems.length,
        sessionId: sessionId,
        items: sanitizedItems // Return matched items for debugging
      }),
      { headers: corsHeaders, status: 200 }
    );

  } catch (error) {
    console.error("Error processing cart data:", error);
    
    // Return error response without exposing implementation details
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Error processing cart data" 
      }),
      { headers: corsHeaders, status: 400 }
    );
  }
});
