
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, ExternalLink, Trash2, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GeneratedLink {
  id: string;
  productName: string;
  productType: string;
  paymentUrl: string;
  generatedAt: string;
}

interface GeneratedLinksSectionProps {
  generatedLinks: GeneratedLink[];
  onClearLinks: () => void;
}

const GeneratedLinksSection = ({ generatedLinks, onClearLinks }: GeneratedLinksSectionProps) => {
  const { toast } = useToast();

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copied!',
        description: 'Payment link copied to clipboard',
      });
    } catch (err) {
      toast({
        title: 'Failed to copy',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const openLink = (url: string) => {
    window.open(url, '_blank');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Generated Payment Links
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Recently generated payment links for your products
            </p>
          </div>
          {generatedLinks.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onClearLinks}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {generatedLinks.length > 0 ? (
          <div className="space-y-3">
            {generatedLinks.map((link) => (
              <div key={link.id} className="p-4 border rounded-lg bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{link.productName}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant={link.productType === 'Upsell' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {link.productType}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {formatDate(link.generatedAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(link.paymentUrl)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openLink(link.paymentUrl)}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-xs text-gray-600 bg-white p-2 rounded border font-mono break-all">
                  {link.paymentUrl}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No Payment Links Generated Yet</p>
            <p className="text-sm">Generated payment links will appear here for easy access</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GeneratedLinksSection;
