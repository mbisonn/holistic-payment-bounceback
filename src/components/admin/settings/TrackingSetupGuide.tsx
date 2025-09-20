
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ExternalLink } from 'lucide-react';

const TrackingSetupGuide = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <CheckCircle className="h-5 w-5 text-green-600" />
        <Badge variant="secondary">Already Configured</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <img src="https://developers.facebook.com/favicon.ico" alt="Meta" className="h-5 w-5" />
            Meta Pixel Setup
          </CardTitle>
          <CardDescription>
            Facebook Pixel ID: 1412157472809350 (Already Installed)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-800">
              ✅ Meta Pixel is already installed and tracking page views
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">What's already configured:</h4>
            <ul className="text-sm space-y-1 ml-4">
              <li>• Page view tracking</li>
              <li>• Purchase event tracking</li>
              <li>• Add to cart tracking</li>
              <li>• Checkout initiation tracking</li>
              <li>• Lead generation tracking</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">To verify installation:</h4>
            <ol className="text-sm space-y-1 ml-4">
              <li>1. Install Facebook Pixel Helper Chrome extension</li>
              <li>2. Visit your website</li>
              <li>3. Click the extension icon to see if pixel is firing</li>
              <li>4. Check Facebook Events Manager for live events</li>
            </ol>
          </div>

          <a 
            href="https://www.facebook.com/business/help/952192354843755" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
          >
            Facebook Pixel Documentation <ExternalLink className="h-4 w-4" />
          </a>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <img src="https://www.google.com/favicon.ico" alt="Google" className="h-5 w-5" />
            Google Tag Manager Setup
          </CardTitle>
          <CardDescription>
            GTM Container ID: GTM-5T3R5262 (Already Installed)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-800">
              ✅ Google Tag Manager is already installed and tracking events
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">What's already configured:</h4>
            <ul className="text-sm space-y-1 ml-4">
              <li>• Page view tracking</li>
              <li>• E-commerce purchase tracking</li>
              <li>• Form submission tracking</li>
              <li>• Custom event tracking</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">To verify installation:</h4>
            <ol className="text-sm space-y-1 ml-4">
              <li>1. Install Google Tag Assistant Chrome extension</li>
              <li>2. Visit your website</li>
              <li>3. Click the extension to see active tags</li>
              <li>4. Check GTM Preview mode for real-time debugging</li>
            </ol>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Next steps for Google Analytics:</h4>
            <ol className="text-sm space-y-1 ml-4">
              <li>1. Create a Google Analytics 4 property</li>
              <li>2. Add the GA4 tag to your GTM container</li>
              <li>3. Configure enhanced e-commerce tracking</li>
              <li>4. Set up conversion goals</li>
            </ol>
          </div>

          <a 
            href="https://support.google.com/tagmanager/answer/6103696" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
          >
            Google Tag Manager Documentation <ExternalLink className="h-4 w-4" />
          </a>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Custom Event Tracking</CardTitle>
          <CardDescription>
            Your website automatically tracks these events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Meta Pixel Events:</h4>
              <ul className="text-sm space-y-1">
                <li>• PageView</li>
                <li>• Purchase</li>
                <li>• AddToCart</li>
                <li>• InitiateCheckout</li>
                <li>• Lead</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">GTM Events:</h4>
              <ul className="text-sm space-y-1">
                <li>• page_view</li>
                <li>• purchase</li>
                <li>• add_to_cart</li>
                <li>• begin_checkout</li>
                <li>• generate_lead</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrackingSetupGuide;
