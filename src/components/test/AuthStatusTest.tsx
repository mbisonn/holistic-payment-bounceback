import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, User, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function AuthStatusTest() {
  const { currentUser, isAdmin, loading } = useAuth();

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle2 className="h-4 w-4 text-green-400" />
    ) : (
      <XCircle className="h-4 w-4 text-red-400" />
    );
  };

  const getStatusBadge = (status: boolean, label: string) => {
    return (
      <Badge variant={status ? "default" : "destructive"} className={status ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}>
        {status ? "✓" : "✗"} {label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card className="glass-card border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Authentication Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-2"></div>
            <p className="text-gray-300">Checking authentication...</p>
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
          Authentication Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(!!currentUser)}
              <span className="text-white">User Authenticated</span>
            </div>
            {getStatusBadge(!!currentUser, "Authenticated")}
          </div>

          {currentUser && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(!!currentUser.email_confirmed_at)}
                  <span className="text-white">Email Verified</span>
                </div>
                {getStatusBadge(!!currentUser.email_confirmed_at, "Verified")}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(isAdmin)}
                  <span className="text-white">Admin Access</span>
                </div>
                {getStatusBadge(isAdmin, "Admin")}
              </div>

              <div className="glass-secondary p-3 rounded-lg border border-white/20">
                <h4 className="text-white font-semibold mb-2">User Details</h4>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-300">
                    <strong>Email:</strong> {currentUser.email}
                  </p>
                  <p className="text-gray-300">
                    <strong>ID:</strong> {currentUser.id}
                  </p>
                  <p className="text-gray-300">
                    <strong>Created:</strong> {new Date(currentUser.created_at).toLocaleDateString()}
                  </p>
                  {currentUser.email_confirmed_at && (
                    <p className="text-gray-300">
                      <strong>Verified:</strong> {new Date(currentUser.email_confirmed_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          {!currentUser && (
            <div className="text-center py-4">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-300">No user is currently authenticated</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
