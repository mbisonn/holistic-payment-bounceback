import { User } from '@/types/user-types';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useUserManagement } from '@/hooks/useUserManagement';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

interface UsersTableProps {
  users: User[];
  formatDate: (dateString?: string | null) => string;
  isLoading?: boolean;
}

const UsersTableSimplified = ({ users, formatDate, isLoading = false }: UsersTableProps) => {
  const { fetchUsers } = useUserManagement();
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [adminTarget, setAdminTarget] = useState<User | null>(null);
  const [adminLoading, setAdminLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      (user.user_metadata?.name || "").toLowerCase().includes(search.toLowerCase());
    const matchesRole =
      roleFilter === "all" ||
      (roleFilter === "admin" && user.is_admin) ||
      (roleFilter === "user" && !user.is_admin);
    return matchesSearch && matchesRole;
  });

  const handleRefresh = async () => {
    await fetchUsers();
  };

  const handleAdminToggle = (user: User) => {
    setAdminTarget(user);
    setAdminDialogOpen(true);
  };

  const handleConfirmAdminToggle = async () => {
    if (!adminTarget) return;
    setAdminLoading(true);
    try {
      const newRole = adminTarget.is_admin ? 'user' : 'admin';
      // Delete existing role
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', adminTarget.id);
      
      // Insert new role
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: adminTarget.id, role: newRole });
      if (error) throw error;
      toast({
        title: 'Success',
        description: `User is now ${!adminTarget.is_admin ? 'an admin' : 'a regular user'}.`,
      });
      setAdminDialogOpen(false);
      setAdminTarget(null);
      fetchUsers();
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: (error as Error).message || 'Failed to update admin status',
        variant: 'destructive',
      });
    } finally {
      setAdminLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700 mx-auto"></div>
        <p className="text-gray-500 mt-2">Loading users...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500 mb-4">No users found</p>
        <Button 
          onClick={handleRefresh}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Users
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
        <Input
          placeholder="Search users..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full md:w-64 bg-gray-900 text-white border-gray-700 placeholder-gray-400"
        />
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="border rounded px-3 py-2 text-sm bg-gray-900 text-white border-gray-700"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
        <Button 
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 ml-auto"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg">
        <Table className="min-w-full text-sm">
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Last Sign In</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.email}</TableCell>
                <TableCell>{user.user_metadata?.name || 'Not set'}</TableCell>
                <TableCell>{formatDate(user.created_at)}</TableCell>
                <TableCell>{formatDate(user.last_sign_in_at)}</TableCell>
                <TableCell>
                  {user.is_admin ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-lemon-400 lemon-text-glow" />
                      <span className="text-lemon-700 font-medium lemon-text-glow">Admin</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-500">User</span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleAdminToggle(user)}
                    className="bg-lemon-50 hover:bg-lemon-100 lemon-glow"
                  >
                    {user.is_admin ? 'Revoke Admin' : 'Grant Admin'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Admin Toggle Confirmation Dialog */}
      <Dialog open={adminDialogOpen} onOpenChange={setAdminDialogOpen}>
        <DialogContent className="glass-modal">
          <DialogHeader>
            <DialogTitle>{adminTarget?.is_admin ? 'Revoke Admin Privileges' : 'Grant Admin Privileges'}</DialogTitle>
          </DialogHeader>
          <div>
            Are you sure you want to {adminTarget?.is_admin ? 'revoke' : 'grant'} admin privileges {adminTarget?.is_admin ? 'from' : 'to'} <b>{adminTarget?.email}</b>?
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdminDialogOpen(false)} disabled={adminLoading}>Cancel</Button>
            <Button onClick={handleConfirmAdminToggle} className="bg-lemon-700 hover:bg-lemon-800 lemon-glow" disabled={adminLoading}>
              {adminLoading ? 'Processing...' : (adminTarget?.is_admin ? 'Revoke Admin' : 'Grant Admin')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersTableSimplified;