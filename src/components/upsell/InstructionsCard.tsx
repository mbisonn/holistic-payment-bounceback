
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LinkIcon } from 'lucide-react';

const InstructionsCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl text-green-700">
          <span className="flex items-center gap-2">
            <LinkIcon size={20} />
            How to Use These Links
          </span>
        </CardTitle>
        <CardDescription>
          Follow these instructions to integrate the payment links into your upsell/downsell pages
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ol className="list-decimal list-inside space-y-4">
          <li>
            <strong>Direct Links:</strong> Copy the direct payment links below and use them as the 
            destination for your "Accept Offer" buttons on your upsell/downsell pages.
          </li>
          <li>
            <strong>HTML Buttons:</strong> Alternatively, copy the HTML button code and paste it 
            directly into your landing page builder (works with Systeme.io, ClickFunnels, etc).
          </li>
          <li>
            <strong>Testing:</strong> You can test the links now - they will create real Paystack 
            payment pages for your products.
          </li>
        </ol>
      </CardContent>
    </Card>
  );
};

export default InstructionsCard;
