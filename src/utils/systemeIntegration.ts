
export interface SystemeOrderData {
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
  };
  order: {
    items: Array<{
      id: string;
      sku: string;
      name: string;
      price: number;
      quantity: number;
    }>;
    total: number;
    currency: string;
    timestamp: string;
  };
  source: string;
  paymentMethod?: string;
  transactionId?: string;
}

export class SystemeIntegration {
  private makeWebhookUrl: string;

  constructor(webhookUrl: string) {
    this.makeWebhookUrl = webhookUrl;
  }

  async sendOrderToSysteme(orderData: SystemeOrderData): Promise<boolean> {
    try {
      console.log('Sending order data to Systeme.io via Make.com:', orderData);
      
      const response = await fetch(this.makeWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Source': 'tenera-payment-hub',
        },
        body: JSON.stringify({
          ...orderData,
          webhook_type: 'order_created',
          timestamp: new Date().toISOString(),
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.text();
      console.log('Make.com webhook response:', result);
      return true;
    } catch (error) {
      console.error('Error sending to Make.com webhook:', error);
      return false;
    }
  }

  // Test webhook connection
  async testConnection(): Promise<boolean> {
    try {
      const testData = {
        test: true,
        timestamp: new Date().toISOString(),
        source: 'tenera-payment-hub-test'
      };

      const response = await fetch(this.makeWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });

      return response.ok;
    } catch (error) {
      console.error('Webhook test failed:', error);
      return false;
    }
  }
}

// Default webhook URL - replace with your actual Make.com webhook
export const MAKE_WEBHOOK_URL = 'https://hook.us2.make.com/YOUR_WEBHOOK_ID_HERE';

// Create a singleton instance
export const systemeIntegration = new SystemeIntegration(MAKE_WEBHOOK_URL);
