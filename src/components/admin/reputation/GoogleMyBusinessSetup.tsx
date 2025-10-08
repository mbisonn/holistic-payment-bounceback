import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Building, CheckCircle, Link2 } from 'lucide-react';

interface GoogleMyBusinessSetupProps {
  onConnect: (businessInfo: {
    businessName: string;
    businessId: string;
    apiKey: string;
    placeId: string;
  }) => void;
  isConnected: boolean;
  onDisconnect: () => void;
}

export const GoogleMyBusinessSetup = ({ onConnect, isConnected, onDisconnect }: GoogleMyBusinessSetupProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    businessName: '',
    businessId: '',
    apiKey: '',
    placeId: ''
  });
  const [saving, setSaving] = useState(false);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.businessName || !formData.placeId) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    setSaving(true);
    try {
      // Save to localStorage
      localStorage.setItem('google_my_business_setup', JSON.stringify(formData));
      localStorage.setItem('google_my_business_connected', 'true');
      
      onConnect(formData);
      
      toast({
        title: 'Success',
        description: 'Google My Business connected successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to connect Google My Business',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('google_my_business_setup');
    localStorage.removeItem('google_my_business_connected');
    setFormData({ businessName: '', businessId: '', apiKey: '', placeId: '' });
    onDisconnect();
    
    toast({
      title: 'Disconnected',
      description: 'Google My Business has been disconnected'
    });
  };

  if (isConnected) {
    return (
      <Card className="glass-card border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <CardTitle className="text-white">Google My Business Connected</CardTitle>
            </div>
            <Button 
              variant="outline" 
              onClick={handleDisconnect}
              className="glass-button-outline"
            >
              Disconnect
            </Button>
          </div>
          <CardDescription className="text-gray-300">
            Your business is successfully connected
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-white/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Building className="h-5 w-5 text-white" />
          <CardTitle className="text-white">Connect Google My Business</CardTitle>
        </div>
        <CardDescription className="text-gray-300">
          Enter your business details to connect and manage reviews
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleConnect} className="space-y-4">
          <div>
            <Label htmlFor="businessName" className="text-white">Business Name *</Label>
            <Input
              id="businessName"
              value={formData.businessName}
              onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
              placeholder="Enter your business name"
              className="glass-input text-white border-white/20"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="placeId" className="text-white">Google Place ID *</Label>
            <Input
              id="placeId"
              value={formData.placeId}
              onChange={(e) => setFormData(prev => ({ ...prev, placeId: e.target.value }))}
              placeholder="Enter your Google Place ID"
              className="glass-input text-white border-white/20"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              Find your Place ID at{' '}
              <a 
                href="https://developers.google.com/maps/documentation/places/web-service/place-id" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300"
              >
                Google Place ID Finder
              </a>
            </p>
          </div>
          
          <div>
            <Label htmlFor="businessId" className="text-white">Business ID (Optional)</Label>
            <Input
              id="businessId"
              value={formData.businessId}
              onChange={(e) => setFormData(prev => ({ ...prev, businessId: e.target.value }))}
              placeholder="Enter your business ID"
              className="glass-input text-white border-white/20"
            />
          </div>
          
          <div>
            <Label htmlFor="apiKey" className="text-white">Google API Key (Optional)</Label>
            <Input
              id="apiKey"
              type="password"
              value={formData.apiKey}
              onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
              placeholder="Enter your Google API key"
              className="glass-input text-white border-white/20"
            />
            <p className="text-xs text-gray-400 mt-1">
              Create an API key at{' '}
              <a 
                href="https://console.cloud.google.com/apis/credentials" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300"
              >
                Google Cloud Console
              </a>
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              disabled={saving}
              className="glass-button flex-1"
            >
              <Link2 className="h-4 w-4 mr-2" />
              {saving ? 'Connecting...' : 'Connect Business'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};