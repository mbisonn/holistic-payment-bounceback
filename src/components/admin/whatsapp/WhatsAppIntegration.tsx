import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MessageSquare, AlertCircle } from 'lucide-react';

export default function WhatsAppIntegration() {
  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-glass-text">
            <MessageSquare className="h-6 w-6" />
            WhatsApp Integration
          </CardTitle>
          <CardDescription className="text-glass-text-secondary">
            Configure WhatsApp messaging for your business
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="bg-blue-500/10 border-blue-500/30">
            <AlertCircle className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-blue-300">
              WhatsApp template messaging is coming soon. You'll be able to send automated WhatsApp messages to your customers.
            </AlertDescription>
          </Alert>

          <div className="text-glass-text-secondary space-y-4">
            <h3 className="text-lg font-semibold text-glass-text">Planned Features:</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Automated order confirmations via WhatsApp</li>
              <li>Customer support messaging</li>
              <li>Template message management</li>
              <li>WhatsApp Business API integration</li>
              <li>Message analytics and tracking</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
