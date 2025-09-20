import { supabase } from '@/integrations/supabase/client';

const EDGE_URL = 'https://ytqruetuadthefyclmiq.supabase.co/functions/v1/payment-links';

export interface PaymentLinkPayload {
  type: 'upsell' | 'downsell';
  productId?: string;
  productName?: string;
  amount?: number; // in kobo if using Paystack, optional if function computes
  price?: number;  // in naira, optional
  customerInfo?: { email?: string; name?: string };
  metadata?: Record<string, unknown>;
}

export interface PaymentLinkResult {
  paymentUrl: string;
  raw: any;
}

export const generatePaymentLink = async (payload: PaymentLinkPayload): Promise<PaymentLinkResult> => {
  // Prefer authenticated user token; fallback to anon key
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token;
  const anon = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string | undefined;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (anon) headers['apikey'] = anon;
  headers['Authorization'] = `Bearer ${accessToken || anon || ''}`;

  // Build a tolerant body shape to match common handlers
  const body = {
    type: payload.type,
    productId: payload.productId,
    productName: payload.productName,
    amount: payload.amount ?? (payload.price ? Math.round(payload.price * 100) : undefined),
    price: payload.price,
    customerInfo: payload.customerInfo ?? { email: 'guest@example.com', name: 'Guest' },
    metadata: payload.metadata ?? {},
  };

  const resp = await fetch(EDGE_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const json = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    const message = (json && (json.error || json.message)) || `HTTP ${resp.status}`;
    throw new Error(message);
  }

  // Accept multiple shapes
  const candidate = json?.data || json;
  const paymentUrl: string | undefined =
    candidate?.payment_url || candidate?.authorization_url || candidate?.url;

  if (!paymentUrl) {
    throw new Error('No payment URL returned from payment-links function');
  }

  return { paymentUrl, raw: json };
};


