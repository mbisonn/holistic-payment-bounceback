import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const EmailVerified = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    // Parse URL parameters to check for the verification result
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    const errorDescription = params.get('error_description');
    
    if (error) {
      toast({
        title: 'Verification Error',
        description: errorDescription || 'An error occurred during email verification',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Email Verified Successfully',
        description: 'Your email has been successfully verified! You can now sign in.',
      });
    }
  }, [toast]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <img
              src="/lovable-uploads/4d50203a-0f24-4ef4-8eb3-ff3c01b7f6d7.png"
              alt="Tenera Holistic"
              className="h-12"
            />
          </div>
          <div className="flex justify-center">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-center mt-4">Email Verified</CardTitle>
          <CardDescription className="text-center">
            Your email has been successfully verified
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600">
            Thank you for verifying your email address. Please click the button below to sign in to your account.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col">
          <Button 
            onClick={() => navigate('/admin/login')} 
            className="w-full bg-green-700 hover:bg-green-800"
          >
            Return to Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default EmailVerified;
