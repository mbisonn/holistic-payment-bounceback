import { useState } from 'react';
import AccessRequestForm from '@/components/user/AccessRequestForm';
import UserAccessRequests from '@/components/user/UserAccessRequests';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, FileText } from 'lucide-react';

export default function UserAccess() {
  const [refreshRequests, setRefreshRequests] = useState(0);

  const handleRequestSubmitted = () => {
    setRefreshRequests(prev => prev + 1);
  };

  return (
    <UserAccessContent 
      refreshRequests={refreshRequests}
      onRequestSubmitted={handleRequestSubmitted}
    />
  );
};

const UserAccessContent = ({ 
  refreshRequests, 
  onRequestSubmitted: handleRequestSubmitted
}: { 
  refreshRequests: number; 
  onRequestSubmitted: () => void; 
}) => {

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">User Access Center</h1>
          <p className="text-gray-300">
            Request additional access levels and manage your permissions
          </p>
        </div>

        <Tabs defaultValue="request" className="w-full">
          <TabsList className="glass-card border-white/20 mb-6">
            <TabsTrigger value="request" className="text-white data-[state=active]:bg-white/10">
              <Shield className="h-4 w-4 mr-2" />
              Request Access
            </TabsTrigger>
            <TabsTrigger value="requests" className="text-white data-[state=active]:bg-white/10">
              <FileText className="h-4 w-4 mr-2" />
              My Requests
            </TabsTrigger>
          </TabsList>

          <TabsContent value="request" className="space-y-6">
            <AccessRequestForm onRequestSubmitted={handleRequestSubmitted} />
            
            <Card className="glass-card border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Available Access Levels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="glass-secondary p-4 rounded-lg border border-white/20">
                    <h3 className="text-white font-semibold mb-2">Verified User</h3>
                    <p className="text-gray-300 text-sm">
                      Basic verified access with enhanced features and priority support.
                    </p>
                  </div>
                  
                  <div className="glass-secondary p-4 rounded-lg border border-white/20">
                    <h3 className="text-white font-semibold mb-2">Moderator</h3>
                    <p className="text-gray-300 text-sm">
                      Can moderate content, manage user interactions, and access moderation tools.
                    </p>
                  </div>
                  
                  <div className="glass-secondary p-4 rounded-lg border border-white/20">
                    <h3 className="text-white font-semibold mb-2">Manager</h3>
                    <p className="text-gray-300 text-sm">
                      Can manage users, view analytics, and access management features.
                    </p>
                  </div>
                  
                  <div className="glass-secondary p-4 rounded-lg border border-white/20">
                    <h3 className="text-white font-semibold mb-2">Administrator</h3>
                    <p className="text-gray-300 text-sm">
                      Full system access including user management, system settings, and all features.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests">
            <UserAccessRequests key={refreshRequests} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
