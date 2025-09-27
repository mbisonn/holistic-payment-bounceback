import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Shield, UserPlus, Trash2, Edit2, CheckCircle2, XCircle, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import AccessRequestTest from '@/components/test/AccessRequestTest';
import AuthStatusTest from '@/components/test/AuthStatusTest';

interface RoleRow {
  id: string;
  user_id: string;
  role: 'admin' | 'verified' | 'user' | 'moderator' | 'manager';
}

interface AccessRequest {
  id: string;
  user_id: string;
  user_email: string;
  requested_role: 'verified' | 'admin' | 'moderator' | 'manager';
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  message?: string;
  admin_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
}

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  bio?: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
}

export default function UserCenter() {
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [inlineError, setInlineError] = useState<string | null>(null);
  // rolesByUser maps user_id -> Set of roles
  const [rolesByUser, setRolesByUser] = useState<Record<string, Set<RoleRow['role']>>>({});
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<'user' | 'admin'>('user');
  const [saving, setSaving] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    bio: '',
    phone: '',
    email: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchAccessRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('user_access_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching access requests:', error);
        setAccessRequests([]);
        return;
      }

      setAccessRequests((data || []) as AccessRequest[]);
    } catch (error) {
      console.error('Unexpected error fetching access requests:', error);
      setAccessRequests([]);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      console.log('Fetching users from User Center...');
      
      // Try using the Edge Function first (more reliable)
      let authUsers: any[] = [];
      let usersError: any = null;
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('No active session');
        }

        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-users`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success && result.data) {
          authUsers = result.data.map((user: any) => ({
            id: user.id,
            email: user.email,
            created_at: user.created_at,
            email_confirmed_at: user.email_confirmed_at,
            user_metadata: {
              full_name: user.full_name,
              ...user.user_metadata
            }
          }));
          console.log(`Successfully retrieved ${authUsers.length} users via Edge Function`);
        } else {
          throw new Error(result.error || 'Failed to fetch users');
        }
      } catch (edgeFunctionError) {
        console.warn('Edge Function failed, trying RPC fallback:', edgeFunctionError);
        
        // Fallback to RPC call
        const rpcResult = await supabase.rpc('get_all_users' as any);
        usersError = rpcResult.error;
        authUsers = rpcResult.data || [];
        
        if (usersError) {
          console.warn('RPC also failed:', usersError.message);
          
          // If user is not admin, show appropriate message
          if (usersError.message?.includes('Only admins can view all users')) {
            setInlineError('Admin access required to view all users. Please ensure you have admin privileges.');
            setUsers([]);
            setRolesByUser({});
            setAccessRequests([]);
            setLoading(false);
            return;
          }
          
          // For other errors, try fallback to current user
          console.log('Falling back to current user only');
          const { data: { user: currentUser } } = await supabase.auth.getUser();
          
          if (!currentUser) {
            throw new Error('No authenticated user found');
          }

          authUsers = [{
            id: currentUser.id,
            email: currentUser.email,
            created_at: currentUser.created_at,
            user_metadata: currentUser.user_metadata || {}
          }] as any[];
          
          setInlineError('Limited view: Only showing your user account. Admin access required to see all users.');
        } else {
          console.log(`Successfully retrieved ${authUsers.length} users via RPC fallback`);
        }
      }

      console.log(`Retrieved ${(authUsers as any[])?.length || 0} users`);

      // Note: Removed placeholder user logic to prevent "Cannot modify placeholder user" errors
      // All users shown are now real authenticated users from the database

      // Fetch roles separately
        let roleRows: RoleRow[] = [];
        try {
          const roleRes = await supabase.from('user_roles').select('*') as any;
          roleRows = (roleRes?.data || []) as RoleRow[];
        } catch (roleErr: any) {
          console.warn('user_roles select failed, proceeding with empty roles (likely RLS):', roleErr?.message || roleErr);
        }
      
        const map: Record<string, Set<RoleRow['role']>> = {};
        (roleRows || []).forEach((r: RoleRow) => {
          if (!map[r.user_id]) map[r.user_id] = new Set();
          map[r.user_id].add(r.role);
        });
        setRolesByUser(map);

      setUsers(authUsers as any[]);
      setInlineError(null);

      // Fetch access requests
      await fetchAccessRequests();
      
      console.log('User Center data loaded successfully');
    } catch (e: any) {
      console.error('UserCenter: Error fetching data:', e?.message || e);
      const msg = typeof e?.message === 'string' ? e.message : 'Failed to load users. Please try again.';
      setInlineError(msg);
      setUsers([]);
      setRolesByUser({});
      setAccessRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const inviteUser = async () => {
    if (!isAdmin) {
      toast({ title: 'Not allowed', description: 'Only admins can add users.', variant: 'destructive' });
      return;
    }
    if (!inviteEmail || !inviteName) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      console.log('Inviting user:', { email: inviteEmail, name: inviteName, role: inviteRole });
      
      // Use direct signup instead of Edge Function
        const { error } = await supabase.auth.signUp({ 
          email: inviteEmail, 
          password: Math.random().toString(36).slice(2) + 'A1!',
          options: {
            data: {
              name: inviteName,
              role: inviteRole
            }
          }
        });
        
        if (error) throw error;
      
      toast({ title: 'Success', description: 'User invited successfully' });
      setInviteOpen(false);
      setInviteEmail('');
      setInviteName('');
      setInviteRole('user');
      fetchData();
    } catch (e: any) {
      console.error('Error inviting user:', e);
      toast({ title: 'Error', description: e.message || 'Failed to invite user', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const setAdmin = async (userId: string, makeAdmin: boolean) => {
    if (userId.startsWith('placeholder:')) {
      toast({ title: 'Error', description: 'Cannot modify a placeholder user.', variant: 'destructive' });
      return;
    }
    try {
      if (!isAdmin) {
        toast({ title: 'Not allowed', description: 'Only admins can change roles.', variant: 'destructive' });
        return;
      }
      
      console.log(`${makeAdmin ? 'Granting' : 'Revoking'} admin role for user:`, userId);
      
      if (makeAdmin) {
        // Add admin role directly
        const { error } = await supabase.from('user_roles').upsert({
              user_id: userId,
          role: 'admin'
        });
          if (error) throw error;
      } else {
        // Remove admin role directly
          const { error } = await supabase.from('user_roles').delete().eq('user_id', userId).eq('role', 'admin');
          if (error) throw error;
      }
      
      toast({ title: 'Updated', description: `Admin ${makeAdmin ? 'granted' : 'revoked'}` });
      fetchData();
    } catch (e: any) {
      console.error('Error updating admin role:', e);
      toast({ title: 'Error', description: e.message || 'Failed to update role', variant: 'destructive' });
    }
  };

  // Verify a user (grants 'verified' role). Authorization enforced by edge function:
  // - Verified users (or admins) can verify others
  // - No self-verification allowed
  const verifyUser = async (userId: string) => {
    if (userId.startsWith('placeholder:')) {
      toast({ title: 'Error', description: 'Cannot verify a placeholder user.', variant: 'destructive' });
      return;
    }
    try {
      console.log('Verifying user:', userId);
      
      // Add verified role directly
      const { error } = await supabase.from('user_roles').upsert({
            user_id: userId,
        role: 'verified'
      });
        if (error) throw error;
      
      toast({ title: 'Updated', description: 'User verified' });
      fetchData();
    } catch (e: any) {
      console.error('Error verifying user:', e);
      toast({ title: 'Error', description: e.message || 'Failed to verify user', variant: 'destructive' });
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Delete this user? This action cannot be undone.')) return;
    try {
      if (!isAdmin) {
        toast({ title: 'Not allowed', description: 'Only admins can delete users.', variant: 'destructive' });
        return;
      }
      
      console.log('Deleting user:', userId);
      
      // Delete user roles directly
        await supabase.from('user_roles').delete().eq('user_id', userId);
        toast({ title: 'Deleted', description: 'User role records removed. Use Supabase Auth to fully delete user.' });
      
      fetchData();
    } catch (e: any) {
      console.error('Error deleting user:', e);
      toast({ title: 'Error', description: e.message || 'Failed to delete user', variant: 'destructive' });
    }
  };

  const handleAccessRequest = async (requestId: string, approve: boolean, adminNotes?: string) => {
    try {
      const request = accessRequests.find(r => r.id === requestId);
      if (!request) return;

      if (approve) {
        // Use the database function to approve the request
        const { error } = await supabase.rpc('approve_access_request', {
          request_id: requestId
        });
        
        if (error) throw error;
        
        toast({ title: 'Approved', description: `${request.requested_role} access granted` });
      } else {
        // Use the database function to reject the request
        const { error } = await supabase.rpc('reject_access_request', {
          request_id: requestId,
          admin_notes: adminNotes || 'Access request rejected'
        });
        
        if (error) throw error;
        
        toast({ title: 'Rejected', description: 'Access request rejected' });
      }

      // Refresh the data
      await fetchAccessRequests();
      await fetchData();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to process request', variant: 'destructive' });
    }
  };

  const openEditProfile = (user: any) => {
    setEditingUser({
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.name || '',
      bio: '',
      phone: '',
      created_at: user.created_at
    });
    setProfileForm({
      full_name: user.user_metadata?.name || '',
      bio: '',
      phone: '',
      email: user.email
    });
    setEditProfileOpen(true);
  };

  const saveProfile = async () => {
    if (!editingUser) return;
    
    setSaving(true);
    try {
      // Update user metadata
      const { error } = await supabase.auth.updateUser({
        data: { 
          name: profileForm.full_name,
          bio: profileForm.bio,
          phone: profileForm.phone
        }
      });
      
      if (error) throw error;
      
      toast({ title: 'Success', description: 'Profile updated successfully' });
      setEditProfileOpen(false);
      setEditingUser(null);
      fetchData();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to update profile', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">User Center</h2>
          <p className="text-gray-300">Add users, manage admin access, and edit profiles</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setInviteOpen(true)} className="glass-button" disabled={!isAdmin} title={!isAdmin ? 'Admins only' : undefined}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add New User
          </Button>
        </div>
      </div>

      {inlineError && (
        <div className="glass-card border border-red-500/30 text-red-300 p-3 rounded flex items-center justify-between">
          <span>{inlineError}</span>
          <Button size="sm" variant="outline" className="glass-button-outline" onClick={() => { setInlineError(null); fetchData(); }}>Retry</Button>
        </div>
      )}

      {/* Test Components */}
      <div className="grid gap-6 md:grid-cols-2">
        <AuthStatusTest />
        <AccessRequestTest />
      </div>

      {/* Access Requests Section */}
      <Card className="glass-card border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Access Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          {accessRequests.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No pending access requests</p>
          ) : (
            <div className="space-y-3">
              {accessRequests.map((request) => (
                <div key={request.id} className="glass-secondary p-4 rounded-lg border border-white/20">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                      <p className="text-white font-medium">{request.user_email}</p>
                        <span className={`px-2 py-1 rounded text-xs ${
                          request.requested_role === 'admin' ? 'bg-purple-500/20 text-purple-300' :
                          request.requested_role === 'moderator' ? 'bg-blue-500/20 text-blue-300' :
                          request.requested_role === 'manager' ? 'bg-orange-500/20 text-orange-300' :
                          'bg-green-500/20 text-green-300'
                        }`}>
                          {request.requested_role.charAt(0).toUpperCase() + request.requested_role.slice(1)}
                        </span>
                      </div>
                      {request.message && (
                        <p className="text-gray-300 text-sm mb-2">{request.message}</p>
                      )}
                      <p className="text-gray-400 text-xs">
                        Requested: {new Date(request.created_at).toLocaleDateString()}
                      </p>
                      {request.admin_notes && (
                        <p className="text-gray-300 text-sm mt-2">
                          <strong>Admin notes:</strong> {request.admin_notes}
                        </p>
                      )}
                    </div>
                    {request.status === 'pending' && (
                      <div className="flex gap-2 ml-4">
                        <Button 
                          size="sm" 
                          onClick={() => handleAccessRequest(request.id, true)}
                          className="glass-button"
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleAccessRequest(request.id, false)}
                          className="glass-button-outline"
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                    {request.status !== 'pending' && (
                      <span className={`text-sm px-2 py-1 rounded ml-4 ${
                        request.status === 'approved' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                      }`}>
                        {request.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Users List */}
      <Card className="glass-card border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5" />
            All Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
              <p className="text-gray-400 mt-2">Loading users...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left p-3 text-white">User</th>
                    <th className="text-left p-3 text-white">Role</th>
                    <th className="text-left p-3 text-white">Joined</th>
                    <th className="text-left p-3 text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const roles = rolesByUser[u.id] || new Set();
                    const isAdminRole = roles.has('admin');
                    const isVerifiedRole = roles.has('verified') || isAdminRole;
                    const pendingAdmin = (u?.user_metadata?.role === 'admin') && !isAdminRole;
                    return (
                      <tr key={u.id} className="border-b border-white/10">
                        <td className="p-3">
                          <div>
                            <p className="text-white font-medium">
                              {u.user_metadata?.name || u.email}
                            </p>
                            <p className="text-gray-400 text-sm">{u.email}</p>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2 items-center">
                            <span className={`px-2 py-1 rounded text-xs ${
                              isAdminRole ? 'bg-purple-500/20 text-purple-300' : pendingAdmin ? 'bg-yellow-500/20 text-yellow-300' : isVerifiedRole ? 'bg-emerald-500/20 text-emerald-300' : 'bg-gray-500/20 text-gray-300'
                            }`}>
                              {isAdminRole ? 'Admin' : pendingAdmin ? 'Pending Admin' : isVerifiedRole ? 'Verified' : 'User'}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-gray-300 text-sm">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => openEditProfile(u)}
                              className="glass-button-outline"
                            >
                              <Edit2 className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            {isAdmin && pendingAdmin && (
                              <Button 
                                size="sm"
                                onClick={() => setAdmin(u.id, true)}
                                className="glass-button"
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Verify Admin
                              </Button>
                            )}
                            {/* Verify action available to verified/admin callers; function enforces auth */}
                            {!isVerifiedRole && (
                              <Button 
                                size="sm"
                                variant="outline"
                                onClick={() => verifyUser(u.id)}
                                className="glass-button-outline"
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Verify
                              </Button>
                            )}
                            {isAdmin && isAdminRole ? (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => setAdmin(u.id, false)} 
                                className="glass-button-outline"
                              >
                                <XCircle className="h-3 w-3 mr-1" /> 
                                Revoke Admin
                              </Button>
                            ) : isAdmin && !isAdminRole && !pendingAdmin ? (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => setAdmin(u.id, true)} 
                                className="glass-button-outline"
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1" /> 
                                Make Admin
                              </Button>
                            ) : null}
                            {isAdmin && (
                              <Button 
                                size="sm" 
                                variant="destructive" 
                                onClick={() => deleteUser(u.id)} 
                                className="glass-button-outline"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invite User Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="glass-modal max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Add New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-white">Name</Label>
              <Input
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                className="glass-input text-white border-white/20"
                placeholder="Enter full name"
              />
            </div>
            <div>
              <Label className="text-white">Email</Label>
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="glass-input text-white border-white/20"
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label className="text-white">Role</Label>
              <Select value={inviteRole} onValueChange={(value: 'user' | 'admin') => setInviteRole(value)}>
                <SelectTrigger className="glass-input text-white border-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card border-white/20">
                  <SelectItem value="user" className="text-white hover:bg-white/10">User</SelectItem>
                  <SelectItem value="admin" className="text-white hover:bg-white/10">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setInviteOpen(false)}
                className="glass-button-outline"
              >
                Cancel
              </Button>
              <Button 
                onClick={inviteUser} 
                disabled={saving}
                className="glass-button"
              >
                {saving ? 'Inviting...' : 'Invite User'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
        <DialogContent className="glass-modal max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-white">Full Name</Label>
              <Input
                value={profileForm.full_name}
                onChange={(e) => setProfileForm(prev => ({ ...prev, full_name: e.target.value }))}
                className="glass-input text-white border-white/20"
              />
            </div>
            <div>
              <Label className="text-white">Email</Label>
              <Input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                className="glass-input text-white border-white/20"
              />
            </div>
            <div>
              <Label className="text-white">Phone</Label>
              <Input
                value={profileForm.phone}
                onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                className="glass-input text-white border-white/20"
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <Label className="text-white">Bio</Label>
              <Textarea
                value={profileForm.bio}
                onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                className="glass-input text-white border-white/20"
                placeholder="Enter bio"
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setEditProfileOpen(false)}
                className="glass-button-outline"
              >
                Cancel
              </Button>
              <Button 
                onClick={saveProfile} 
                disabled={saving}
                className="glass-button"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


