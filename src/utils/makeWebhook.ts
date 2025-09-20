
export interface MakeWebhookData {
  order_id: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
  };
  order: {
    items: Array<{
      name: string;
      sku: string;
      price: number;
      quantity: number;
    }>;
    total: number;
    payment_method: string;
    status: string;
  };
  metadata?: Record<string, any>;
}

export const sendToMake = async (webhookUrl: string, data: MakeWebhookData) => {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to send data to Make.com');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending data to Make.com:', error);
    throw error;
  }
};
