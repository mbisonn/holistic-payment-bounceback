
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { EyeIcon, EyeOffIcon, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const AdminLoginNavigation = () => {
  const [showSignUpDialog, setShowSignUpDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { signUp } = useAuth();
  const { toast } = useToast();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Basic validation
    if (!email || !password || !confirmPassword) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }
    
    // Password match check
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please ensure both passwords match",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }
    
    // Password strength check
    if (password.length < 6) {
      toast({
        title: "Password too weak",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }
    
    try {
      const result = await signUp(email, password);
      
      if (result.success) {
        setShowSignUpDialog(false);
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        toast({
          title: "Account created successfully",
          description: "Please check your email to verify your account before logging in.",
        });
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: "Signup error",
        description: "An unexpected error occurred during signup",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col space-y-2 text-center text-sm">
        <Button
          variant="link"
          className="text-sm text-muted-foreground hover:text-green-600"
          onClick={() => setShowSignUpDialog(true)}
        >
          Don't have an account? Sign up
        </Button>
      </div>
      
      <Dialog open={showSignUpDialog} onOpenChange={setShowSignUpDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Admin Account</DialogTitle>
            <DialogDescription>
              Create a new administrator account. You'll need to verify your email before you can log in.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSignUp} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <Input
                id="signup-email"
                placeholder="your@email.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="bg-gray-900 text-white border-gray-700 placeholder-gray-400"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="signup-password">Password</Label>
              <div className="relative">
                <Input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  minLength={6}
                  className="bg-gray-900 text-white border-gray-700 placeholder-gray-400"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <EyeIcon className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="sr-only">
                    {showPassword ? 'Hide password' : 'Show password'}
                  </span>
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  minLength={6}
                  className="bg-gray-900 text-white border-gray-700 placeholder-gray-400"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOffIcon className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <EyeIcon className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="sr-only">
                    {showConfirmPassword ? 'Hide password' : 'Show password'}
                  </span>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Password must be at least 6 characters long and match the password above
              </p>
            </div>
            
            <Button
              type="submit"
              className="w-full bg-lemon-600 hover:bg-lemon-700 lemon-glow"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminLoginNavigation;
