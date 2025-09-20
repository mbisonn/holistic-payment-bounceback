import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface AuthResult {
  success: boolean;
  error?: string;
}

export const useAuthMethods = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    setIsLoading(true);
    try {
      console.log('Attempting sign in for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Login error:', error);
        showErrorToast(error.message || 'Invalid email or password');
        return { success: false, error: error.message };
      }
      
      console.log('Login successful for:', email);
      showSuccessToast('Login successful!');
      
      // Refresh session to propagate any server-side changes
      try { await supabase.auth.getSession(); } catch {}
      
      return { success: true };
    } catch (error: unknown) {
      console.error('Unexpected login error:', error);
      showErrorToast('An unexpected error occurred during login');
      return { success: false, error: (error as Error).message };
    } finally {
      setIsLoading(false);
    }
  };
  
  const signUp = async (email: string, password: string): Promise<AuthResult> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });
      
      if (error) {
        showErrorToast(error.message || 'An error occurred during registration');
        return { success: false, error: error.message };
      }
      
      showSuccessToast('Registration successful!');
      return { success: true };
    } catch (error: unknown) {
      showErrorToast((error as Error).message || 'An unexpected error occurred during registration');
      return { success: false, error: (error as Error).message };
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      console.log('useAuthMethods logout starting...');
      
      // Clear local storage first
      try { 
        localStorage.clear(); 
        sessionStorage.clear(); 
        console.log('Local storage cleared in useAuthMethods');
      } catch (e) {
        console.warn('Failed to clear storage in useAuthMethods:', e);
      }
      
      // Attempt sign out with timeout
      const signOutPromise = supabase.auth.signOut({ scope: 'global' });
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Logout timeout')), 5000)
      );
      
      try {
        const { error } = await Promise.race([signOutPromise, timeoutPromise]);
        
        if (error) {
          console.warn('Supabase signOut error:', error.message);
          showErrorToast(error.message || 'An error occurred during logout');
        } else {
          console.log('Supabase signOut successful');
          showSuccessToast('Logged out successfully!');
        }
      } catch (timeoutError: any) {
        console.warn('Logout timeout or error:', timeoutError?.message);
        showSuccessToast('Logged out successfully (local cleanup completed)!');
      }
      
    } catch (error: unknown) {
      console.error('Unexpected logout error:', error);
      showErrorToast((error as Error).message || 'An unexpected error occurred during logout');
    } finally {
      setIsLoading(false);
    }
  };
  
  const showSuccessToast = (message: string) => {
    toast({
      title: "Success",
      description: message,
    });
  };
  
  const showErrorToast = (message: string) => {
    toast({
      title: "Error",
      description: message,
      variant: "destructive",
    });
  };
  
  return {
    signIn,
    signUp,
    logout,
    isLoading
  };
};
