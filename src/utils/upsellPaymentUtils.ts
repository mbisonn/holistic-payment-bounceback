
export interface UpsellProduct {
  type: 'full' | 'lite';
  name: string;
  price: number;
  description: string;
  features: string[];
}

export const upsellProducts: UpsellProduct[] = [
  {
    type: 'full',
    name: 'Premium Wellness Package',
    price: 50000,
    description: 'Complete wellness solution with all premium products',
    features: [
      'All premium wellness products',
      'Comprehensive health support',
      'Maximum value package',
      'Free shipping included'
    ]
  },
  {
    type: 'lite',
    name: 'Essential Wellness Package',
    price: 15000,
    description: 'Essential wellness products for daily health',
    features: [
      'Core wellness products',
      'Daily health support',
      'Great starter package',
      'Affordable pricing'
    ]
  }
];

export const generateUpsellPaymentUrl = (type: 'full' | 'lite', customerEmail?: string, customerName?: string): string => {
  const baseUrl = 'https://e84d0afb-f51a-49f1-b3e0-2d35cebef2bd.lovableproject.com/functions/v1/upsell';
  const params = new URLSearchParams({
    type: type,
    direct: 'true'
  });
  
  if (customerEmail) {
    params.set('email', customerEmail);
  }
  
  if (customerName) {
    params.set('name', customerName);
  }
  
  return `${baseUrl}?${params.toString()}`;
};

export const generateUpsellButtonCode = (type: 'full' | 'lite', customerEmail?: string, customerName?: string): string => {
  const product = upsellProducts.find(p => p.type === type);
  const paymentUrl = generateUpsellPaymentUrl(type, customerEmail, customerName);
  
  return `<script src="https://js.paystack.co/v1/inline.js"></script>
<button onclick="payWithPaystack()" style="display: inline-block; background: linear-gradient(45deg, #667eea, #764ba2); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); transition: all 0.3s ease; text-align: center; border: none; cursor: pointer;">
  🎯 Get ${product?.name} - ₦${product?.price?.toLocaleString()}
</button>
<script>
function payWithPaystack() {
  fetch('${paymentUrl}', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.success && data.access_code) {
      var handler = PaystackPop.setup({
        key: data.public_key,
        email: data.email,
        amount: data.amount * 100,
        ref: data.reference,
        callback: function(response) {
          window.location.href = data.callback_url;
        },
        onClose: function() {
          console.log('Payment window closed');
        }
      });
      handler.openIframe();
    } else {
      alert('Unable to initialize payment. Please try again.');
    }
  })
  .catch(error => {
    console.error('Payment error:', error);
    alert('Payment initialization failed. Please try again.');
  });
}
</script>`;
};
