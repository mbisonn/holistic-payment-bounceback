import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Loader2, UserPlus } from 'lucide-react';

interface AddUserDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  newUserEmail: string;
  setNewUserEmail: (email: string) => void;
  accessType: 'admin' | 'user';
  setAccessType: (type: 'admin' | 'user') => void;
  handleAddUser: () => void;
  addingUser: boolean;
}

export const AddUserDialog: React.FC<AddUserDialogProps> = ({
  open,
  setOpen,
  newUserEmail,
  setNewUserEmail,
  accessType,
  setAccessType,
  handleAddUser,
  addingUser
}) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-full max-w-xs sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="font-medium">User Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="user@example.com"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !addingUser && newUserEmail) {
                  handleAddUser();
                }
              }}
              className="w-full min-h-[44px] bg-gray-900 text-white border-gray-700 placeholder-gray-400"
            />
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-stretch sm:items-center mt-2">
              <Label htmlFor="accessType" className="font-medium">Access Type</Label>
              <select
                id="accessType"
                name="accessType"
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