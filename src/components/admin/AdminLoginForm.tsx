
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const AdminLoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Login successful",
        description: "Welcome to the admin dashboard",
      });

      // Navigate to admin dashboard (matches /admin/* route)
      navigate('/admin');
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReturnHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-purple-600 px-4">
      {/* Back to Home Button - Positioned at the top */}
      <div className="w-full max-w-md mb-6">
        <Button
          variant="outline"
          onClick={handleReturnHome}
          className="flex items-center gap-2 text-sm bg-white/10 hover:bg-white/20 border border-white/20 text-white shadow-sm backdrop-blur-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>
      </div>
      
      {/* Login Card */}
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-lg border-white/20 shadow-2xl">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="logo-cube-perspective">
              <div className="logo-cube">
                <div className="cube-face cube-face-front">
                  <img src="https://d1yei2z3i6k35z.cloudfront.net/8219284/67d349ad45a76_bb2llogo2.png" alt="Logo" className="cube-logo" />
                </div>
                <div className="cube-face cube-face-back">
                  <img src="https://d1yei2z3i6k35z.cloudfront.net/8219284/67d349ad45a76_bb2llogo2.png" alt="Logo" className="cube-logo" />
                </div>
                <div className="cube-face cube-face-right">
                  <img src="https://d1yei2z3i6k35z.cloudfront.net/8219284/67d349ad45a76_bb2llogo2.png" alt="Logo" className="cube-logo" />
                </div>
                <div className="cube-face cube-face-left">
                  <img src="https://d1yei2z3i6k35z.cloudfront.net/8219284/67d349ad45a76_bb2llogo2.png" alt="Logo" className="cube-logo" />
                </div>
                <div className="cube-face cube-face-top">
                  <img src="https://d1yei2z3i6k35z.cloudfront.net/8219284/67d349ad45a76_bb2llogo2.png" alt="Logo" className="cube-logo" />
                </div>
                <div className="cube-face cube-face-bottom">
                  <img src="https://d1yei2z3i6k35z.cloudfront.net/8219284/67d349ad45a76_bb2llogo2.png" alt="Logo" className="cube-logo" />
                </div>
              </div>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-purple-600 to-purple-900 bg-clip-text text-transparent">Admin Login</CardTitle>
          <CardDescription className="text-center text-slate-600">
            Enter your admin credentials to access the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLoginForm;
