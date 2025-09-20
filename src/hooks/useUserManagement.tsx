import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { fetchAllUsers } from '@/services/userFetchService';
import { createAdminUser, addAdminRoleToUser } from '@/services/adminUserService';
import { deleteUserAdmin, inviteUserToSystem, changeUserRole, changeUserStatus } from '@/services/userManagementService';
import type { User, AddAdminUserData, InviteUserData } from '@/types/user-management-types';

export const useUserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const fetchedUsers = await fetchAllUsers(isAdmin);
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Error in fetchUsers:', error);
      toast({
        title: "Error", 
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [isAdmin]);

  const addAdminUser = async (userData: AddAdminUserData) => {
    try {
      const result = await createAdminUser(userData, isAdmin);
      toast({
        title: "Success",
        description: result.message,
      });
      
      // Refresh the user list
      await fetchUsers();
    } catch (error: unknown) {
      console.error('Error creating admin user:', error);
      let errorMessage = 'Could not create admin user. Please try again.';
      
      if ((error as Error).message && (error as Error).message.includes('SMTP')) {
        errorMessage = 'User created but invitation email failed to send. Please check SMTP configuration.';
      }
      
      toast({
        title: "Error creating admin user",
        description: (error as Error).message || errorMessage,
        variant: "destructive",
      });
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const result = await deleteUserAdmin(userId);
      toast({
        title: "Success",
        description: result.message,
      });
      
      // Refresh the user list
      await fetchUsers();
    } catch (error: unknown) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error deleting user",
        description: (error as Error).message || 'Could not delete user. Please try again.',
        variant: "destructive",
      });
    }
  };

  const addAdminRole = async (email: string) => {
    try {
      const result = await addAdminRoleToUser(email, isAdmin);
      toast({
        title: "Success",
        description: result.message,
      });

      fetchUsers();
    } catch (error: unknown) {
      console.error('Error adding admin role:', error);
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to add admin role",
        variant: "destructive",
      });
    }
  };

  const inviteUser = async (inviteData: InviteUserData) => {
    return await inviteUserToSystem(inviteData);
  };

  return {
    users,
    isLoading,
    fetchUsers,
    addAdminRole,
    addAdminUser,
    deleteUser,
    inviteUser,
    changeUserRole,
    changeUserStatus,
  };
};
