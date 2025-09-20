import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Clock, CheckCircle2, XCircle, Shield } from 'lucide-react';

interface AccessRequest {
  id: string;
  requested_role: string;
  status: 'pending' | 'approved' | 'rejected';
  message?: string;
  admin_notes?: string;
  created_at: string;
  reviewed_at?: string;
}

export default function UserAccessRequests() {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('user_access_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching access requests:', error);
        return;
      }

      setRequests((data || []) as AccessRequest[]);
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'approved':
        return <CheckCircle2 className="h-4 w-4 text-green-400" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300">Pending</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-500/20 text-green-300">Approved</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-500/20 text-red-300">Rejected</Badge>;
      default:
        return <Badge variant="secondary" className="bg-gray-500/20 text-gray-300">Unknown</Badge>;
    }
  };

  const formatRole = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  if (loading) {
    return (
      <Card className="glass-card border-white/20">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            <p className="text-gray-400 mt-2">Loading your requests...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (requests.length === 0) {
    return (
      <Card className="glass-card border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5" />
            My Access Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">You haven't submitted any access requests yet.</p>
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
          My Access Requests
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="glass-secondary p-4 rounded-lg border border-white/20">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(request.status)}
                    <span className="text-white font-medium">
                      {formatRole(request.requested_role)} Access
                    </span>
                    {getStatusBadge(request.status)}
                  </div>
                  
                  {request.message && (
                    <p className="text-gray-300 text-sm mb-2">
                      <strong>Your message:</strong> {request.message}
                    </p>
                  )}
                  
                  {request.admin_notes && (
                    <p className="text-gray-300 text-sm mb-2">
                      <strong>Admin response:</strong> {request.admin_notes}
                    </p>
                  )}
                  
                  <div className="text-xs text-gray-400">
                    <p>Submitted: {new Date(request.created_at).toLocaleDateString()}</p>
                    {request.reviewed_at && (
                      <p>Reviewed: {new Date(request.reviewed_at).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
