import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Send, CheckCircle2 } from 'lucide-react';

interface AccessRequestFormProps {
  onRequestSubmitted?: () => void;
}

export default function AccessRequestForm({ onRequestSubmitted }: AccessRequestFormProps) {
  const [requestedRole, setRequestedRole] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!requestedRole) {
      toast({
        title: 'Error',
        description: 'Please select a role to request',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.rpc('create_access_request', {
        requested_role: requestedRole,
        message: message || undefined
      });

      if (error) {
        console.error('Error creating access request:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to submit access request',
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: 'Success',
        description: 'Your access request has been submitted for review'
      });

      setIsSubmitted(true);
      setRequestedRole('');
      setMessage('');
      
      if (onRequestSubmitted) {
        onRequestSubmitted();
      }
    } catch (error: any) {
      console.error('Unexpected error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="glass-card border-white/20">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-white">Request Submitted</h3>
              <p className="text-gray-300">
                Your access request has been submitted and will be reviewed by an administrator.
              </p>
            </div>
            <Button 
              onClick={() => setIsSubmitted(false)}
              variant="outline"
              className="glass-button-outline"
            >
              Submit Another Request
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Request Access
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="role" className="text-white">Requested Role</Label>
            <Select value={requestedRole} onValueChange={setRequestedRole}>
              <SelectTrigger className="glass-input text-white border-white/20">
                <SelectValue placeholder="Select a role to request" />
              </SelectTrigger>
              <SelectContent className="glass-card border-white/20">
                <SelectItem value="verified" className="text-white hover:bg-white/10">
                  Verified User
                </SelectItem>
                <SelectItem value="moderator" className="text-white hover:bg-white/10">
                  Moderator
                </SelectItem>
                <SelectItem value="manager" className="text-white hover:bg-white/10">
                  Manager
                </SelectItem>
                <SelectItem value="admin" className="text-white hover:bg-white/10">
                  Administrator
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="message" className="text-white">Message (Optional)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Explain why you need this access level..."
              className="glass-input text-white border-white/20"
              rows={4}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="submit"
              disabled={isSubmitting || !requestedRole}
              className="glass-button"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Request
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
