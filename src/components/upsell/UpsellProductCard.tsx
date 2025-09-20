
import { useState } from 'react';
import { UpsellProduct } from '@/utils/upsellPaymentUtils';
import { formatCurrency } from '@/utils/productUtils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Copy, CheckCircle, Code, ExternalLink } from 'lucide-react';

interface UpsellProductCardProps {
  product: UpsellProduct;
  paymentUrl: string;
  buttonCode: string;
}

const UpsellProductCard = ({ product, paymentUrl, buttonCode }: UpsellProductCardProps) => {
  const [copied, setCopied] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  
  // Fix the payment URL to ensure it has direct=true parameter
  const fixedPaymentUrl = ensureDirectParam(paymentUrl);
  
  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied({ ...copied, [key]: true });
      
      toast({
        title: 'Copied to clipboard',
        description: 'The content has been copied to your clipboard.',
      });
      
      setTimeout(() => {
        setCopied(prev => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      
      toast({
        title: 'Failed to copy',
        description: 'Please try again or copy manually.',
        variant: 'destructive',
      });
    }
  };

  // Test the link directly
  const testLink = () => {
    window.open(fixedPaymentUrl, '_blank');
  };

  // Ensure URL has direct parameter for Paystack redirection
  function ensureDirectParam(url: string): string {
    try {
      const urlObj = new URL(url);
      urlObj.searchParams.set('direct', 'true');
      return urlObj.toString();
    } catch (e) {
      console.error("Invalid URL:", e);
      return url;
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{product.name}</CardTitle>
        <CardDescription>
          Price: {formatCurrency(product.price)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">Direct Payment Link:</label>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => copyToClipboard(fixedPaymentUrl, `${product.type}Url`)}
                className="gap-1"
              >
                {copied[`${product.type}Url`] ? <CheckCircle size={16} className="text-green-500" /> : <Copy size={16} />}
                {copied[`${product.type}Url`] ? 'Copied' : 'Copy'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={testLink}
                className="gap-1"
              >
                <ExternalLink size={16} />
                Test
              </Button>
            </div>
          </div>
          <Input value={fixedPaymentUrl} readOnly />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">HTML Button Code:</label>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => copyToClipboard(buttonCode, `${product.type}ButtonCode`)}
              className="gap-1"
            >
              {copied[`${product.type}ButtonCode`] ? <CheckCircle size={16} className="text-green-500" /> : <Code size={16} />}
              {copied[`${product.type}ButtonCode`] ? 'Copied' : 'Copy Code'}
            </Button>
          </div>
          <div className="bg-gray-50 p-4 rounded-md overflow-x-auto">
            <code className="text-sm whitespace-pre-wrap text-gray-800">
              {buttonCode}
            </code>
          </div>
        </div>
        
        <div className="pt-4">
          <h4 className="text-sm font-medium mb-2">Preview:</h4>
          <div className="p-4 bg-white border border-gray-200 rounded-md flex justify-center">
            <div dangerouslySetInnerHTML={{ __html: buttonCode }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UpsellProductCard;
