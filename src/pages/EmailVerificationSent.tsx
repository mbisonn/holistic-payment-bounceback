import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const EmailVerificationSent = () => {
  const { resendVerification } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem('pendingVerificationEmail');
      if (cached) setEmail(cached);
    } catch {}
  }, []);

  const onResend = async () => {
    if (!email) {
      toast({ title: 'Email required', description: 'Enter your email to resend verification.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const res = await resendVerification(email);
    setLoading(false);
    if (!res.success) {
      toast({ title: 'Verification email', description: res.error || 'Failed to send email', variant: 'destructive' });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Mail className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Verification Email Sent</CardTitle>
          <CardDescription>
            Please check your email to verify your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            We have sent a verification link to your email address. Please click on the link to verify your account and complete the registration process.
          </p>
          <p className="text-center text-muted-foreground">
            If you don't see the email in your inbox, please check your spam folder.
          </p>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button className="w-full" onClick={onResend} disabled={loading}>
              {loading ? 'Sending…' : 'Resend verification email'}
            </Button>
          </div>
          <div className="flex justify-center pt-4">
            <Button asChild>
              <Link to="/admin/login">Return to Login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailVerificationSent;
