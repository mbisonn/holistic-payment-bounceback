
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, ExternalLink, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UpsellProduct } from '@/types/upsell-types';

interface MembershipLinkCardProps {
  title: string;
  product: UpsellProduct | undefined;
  buttonText: string;
  buttonClass: string;
}

const MembershipLinkCard = ({
  title,
  product,
  buttonText,
  buttonClass
}: MembershipLinkCardProps) => {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [localLink, setLocalLink] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!product) {
      toast({ 
        title: 'Error', 
        description: 'Product not found. Please create a product first.', 
        variant: 'destructive' 
      });
      return;
    }
    
    setIsGenerating(true);
    setLocalLink('');
    
    try {
      console.log('Generating payment link for product:', product);
      
      // Determine redirect URL based on product type
      const redirectUrl = 'https://www.teneraholisticandwellness.com/thankyoupage';
      
      const { data, error } = await supabase.functions.invoke('payment-links', {
        body: {
          type: product.type,
          customerInfo: {
            name: 'Customer',
            email: 'customer@example.com'
          },
          redirectUrl: redirectUrl
        }
      });
      
      console.log('Payment link response:', { data, error });
      
      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }
      
      if (!data?.success || !data?.data?.payment_url) {
        throw new Error(data?.error || 'No payment URL returned');
      }
      
      setLocalLink(data.data.payment_url);
      toast({ 
        title: 'Success!', 
        description: `${title} payment link generated successfully! Payment will redirect to thank you page.` 
      });
      
    } catch (e: any) {
      console.error('Error generating payment link:', e);
      toast({ 
        title: 'Error', 
        description: e.message || 'Failed to generate payment link', 
        variant: 'destructive' 
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!localLink) return;
    if (inputRef.current) {
      inputRef.current.select();
      document.execCommand('copy');
      toast({ title: 'Copied!', description: 'Link copied to clipboard.' });
    }
  };

  const handleOpen = () => {
    if (localLink) window.open(localLink, '_blank');
  };

  return (
    <Card className="border-2 hover:border-green-300 transition-colors">
      <CardHeader>
        <CardTitle className="text-green-800 flex items-center gap-2">
          <Zap className="h-5 w-5" />
          {title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Generate payment link for {product?.name || 'product'} (₦{product?.price?.toLocaleString() || '0'}) - redirects to thank you page after payment
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating || !product} 
            className={`w-full ${buttonClass}`}
          >
            {isGenerating ? 'Generating...' : buttonText}
          </Button>
          
          {localLink && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  value={localLink}
                  readOnly
                  className="flex-1 px-3 py-2 border rounded text-sm bg-gray-50"
                  placeholder="Generated link will appear here"
                />
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleOpen}>
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Link generated successfully! After payment, customers will be redirected to the thank you page.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MembershipLinkCard;
