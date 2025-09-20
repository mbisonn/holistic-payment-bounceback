
interface PaystackConfig {
  secretKey: string | undefined;
  publicKey: string | undefined;
  subaccount: string | undefined;
  callbackUrl: string;
  upsellUrl: string;
  checkoutUrl: string;
}

export const paystackConfig: PaystackConfig = {
  secretKey: undefined, // Never expose secret key in frontend
  publicKey: "pk_live_4d0939de823de47bc4c580f73f30accbb2d39c89",
  subaccount: "ACCT_45gk2veg7xobren",
  callbackUrl: 'https://www.teneraholisticandwellness.com/thankyoupage',
  upsellUrl: 'https://www.teneraholisticandwellness.com/upsell',
  checkoutUrl: 'https://www.teneraholisticandwellness.com/order-payment'
};

// Validate Paystack configuration
export function validatePaystackConfig(): boolean {
  const requiredKeys: (keyof PaystackConfig)[] = ['publicKey', 'subaccount'];
  const missingKeys = requiredKeys.filter(key => !paystackConfig[key]);
  
  if (missingKeys.length > 0) {
    throw new Error(`Missing required Paystack configuration: ${missingKeys.join(', ')}`);
  }
  
  return true;
}
