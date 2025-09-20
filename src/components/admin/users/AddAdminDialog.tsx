import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UserPlus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AddUserDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const AddUserDialog = ({ open, setOpen }: AddUserDialogProps) => {
  const [newUserEmail, setNewUserEmail] = useState('');
  const [accessType, setAccessType] = useState<'admin' | 'user'>('user');
  const [addingUser, setAddingUser] = useState(false);
  const { toast } = useToast();

  const handleAddUser = async () => {
    if (!newUserEmail || !newUserEmail.includes('@')) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }
    setAddingUser(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('You must be logged in to perform this action');
      }
      const response = await fetch('https://xjfkeblnxyjhxukqurvc.supabase.co/functions/v1/create_user_role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ email: newUserEmail, role: accessType })
      });
      const result = await response.json();
      if (response.ok && result.success) {
        toast({
          title: 'Success',
          description: `${accessType === 'admin' ? 'Admin' : 'User'} access granted to ${newUserEmail}. ${result.isNewUser ? 'A verification email has been sent.' : ''}`,
        });
        setNewUserEmail('');
        setAccessType('user');
        setOpen(false);
      } else {
        throw new Error(result.error || 'Failed to assign role');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Could not assign role. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setAddingUser(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add User</DialogTitle>
          <DialogDescription>
            Enter an email address and select the type of access to grant. If the user doesn't exist, they will be created and sent a verification email.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Input
              id="email"
              placeholder="user@example.com"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !addingUser && newUserEmail) {
                  handleAddUser();
                }
              }}
              className="bg-gray-900 text-white border-gray-700 placeholder-gray-400"
            />
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-stretch sm:items-center mt-2">
              <label className="font-medium">Access Type:</label>
              <select
                value={accessType}
                onChange={e => setAccessType(e.target.value as 'admin' | 'user')}
                className="border rounded px-2 py-1 w-full sm:w-auto min-h-[36px] bg-gray-900 text-white border-gray-700"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setOpen(false)}
            className="w-full sm:w-auto min-h-[44px]"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddUser} 
            disabled={addingUser || !newUserEmail}
            className="bg-lemon-700 hover:bg-lemon-800 w-full sm:w-auto min-h-[44px] lemon-glow"
          >
            {addingUser ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
            Add User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserDialog;
