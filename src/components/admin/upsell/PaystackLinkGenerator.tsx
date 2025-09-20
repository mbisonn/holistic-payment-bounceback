import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { generatePaymentLink } from '@/utils/paymentLinks';
import { Copy, ExternalLink } from 'lucide-react';

interface PaystackLinkGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
  productPrice: number;
}

export const PaystackLinkGenerator = ({ 
  open, 
  onOpenChange, 
  productId, 
  productName, 
  productPrice 
}: PaystackLinkGeneratorProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');

  const handleGenerateLink = async () => {
    setLoading(true);
    try {
      const { paymentUrl } = await generatePaymentLink({
        type: 'upsell',
        productId,
        productName,
        price: productPrice,
        customerInfo: { email: 'guest@example.com', name: 'Guest' },
      });
      setGeneratedLink(paymentUrl);
      toast({ title: 'Success', description: 'Paystack payment link generated successfully' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to generate payment link', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    toast({
      title: "Copied",
      description: "Link copied to clipboard",
    });
  };

  const openLink = () => {
    if (generatedLink) window.open(generatedLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card glass-modal">
        <DialogHeader>
          <DialogTitle className="text-glass-text">Generate Paystack Payment Link</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-glass-text">Product</Label>
            <Input value={productName} disabled className="glass-input" />
          </div>

          <div>
            <Label className="text-glass-text">Price</Label>
            <Input value={`₦${productPrice.toLocaleString()}`} disabled className="glass-input" />
          </div>

          {!generatedLink ? (
            <Button 
              onClick={handleGenerateLink} 
              disabled={loading}
              className="glass-button w-full"
            >
              {loading ? 'Generating...' : 'Generate Payment Link'}
            </Button>
          ) : (
            <div className="space-y-3">
              <div>
                <Label className="text-glass-text">Generated Link</Label>
                <div className="flex gap-2">
                  <Input 
                    value={generatedLink} 
                    readOnly 
                    className="glass-input text-glass-text"
                  />
                  <Button 
                    size="sm" 
                    onClick={copyToClipboard}
                    className="glass-button-outline"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={openLink}
                    className="glass-button-outline"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};