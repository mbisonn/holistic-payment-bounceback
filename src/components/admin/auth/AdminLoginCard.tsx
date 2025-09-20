
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminLoginForm from './AdminLoginForm';
import AdminLoginNavigation from './AdminLoginNavigation';

interface AdminLoginCardProps {
  onSuccess: () => void;
  onStart?: () => void;
  onError?: (errMsg: string) => void;
}

const AdminLoginCard = ({ onSuccess, onStart, onError }: AdminLoginCardProps) => {
  const navigate = useNavigate();
  
  const handleReturnHome = () => {
    navigate('/');
  };

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Back to Home Button */}
      <Button
        variant="outline"
        onClick={handleReturnHome}
        className="flex items-center gap-2 text-sm bg-white hover:bg-gray-50 border border-gray-300 shadow-sm text-gray-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Button>
      
      {/* Login Card */}
      <Card className="w-full shadow-lg">
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
          <CardTitle className="text-2xl font-bold text-center">Admin Login</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AdminLoginForm onSuccess={onSuccess} onStart={onStart} onError={onError} />
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <AdminLoginNavigation />
        </CardFooter>
      </Card>
      
      <style dangerouslySetInnerHTML={{
        __html: `
        .logo-cube-perspective {
          perspective: 800px;
          width: 128px;
          height: 128px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-cube {
          width: 112px;
          height: 112px;
          position: relative;
          transform-style: preserve-3d;
          animation: cube-rotate 3.5s linear infinite;
        }

        .cube-face {
          position: absolute;
          width: 112px;
          height: 112px;
          background: rgba(100, 116, 139, 0.7);
          border-radius: 18px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.10);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid rgba(100, 116, 139, 0.2);
        }

        .cube-face-front  { transform: rotateY(0deg) translateZ(56px); }
        .cube-face-back   { transform: rotateY(180deg) translateZ(56px); }
        .cube-face-right  { transform: rotateY(90deg) translateZ(56px); }
        .cube-face-left   { transform: rotateY(-90deg) translateZ(56px); }
        .cube-face-top    { transform: rotateX(90deg) translateZ(56px); }
        .cube-face-bottom { transform: rotateX(-90deg) translateZ(56px); }

        .cube-logo {
          width: 72px;
          height: 72px;
          object-fit: contain;
          border-radius: 12px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.10);
          background: white;
        }

        @keyframes cube-rotate {
          0%   { transform: rotateX(0deg) rotateY(0deg); }
          100% { transform: rotateX(360deg) rotateY(360deg); }
        }
        `
      }} />
    </div>
  );
};

export default AdminLoginCard;
