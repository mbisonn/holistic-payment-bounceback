
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AuthResult {
  success: boolean;
  error?: string;
}

export const useAuthMethods = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();
  
  // Sign in with email and password
  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        });
        return { success: false, error: error.message };
      }

      // Check if user is verified (if email confirmation is enabled)
      if (data?.user && !data.user.email_confirmed_at) {
        toast({
          title: "Email Not Verified",
          description: "Please verify your email before logging in",
          variant: "destructive",
        });
        await supabase.auth.signOut();
        return { success: false, error: "Email not verified" };
      }

      toast({
        title: "Login Successful",
        description: `Welcome back, ${data.user.email}!`,
      });
      
      return { success: true };
    } catch (error: any) {
      toast({
        title: "Login Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string): Promise<AuthResult> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/email-verified`,
        },
      });

      if (error) {
        toast({
          title: "Signup Failed",
          description: error.message,
          variant: "destructive",
        });
        return { success: false, error: error.message };
      }

      // Check if email confirmation is required
      if (data?.user && !data.user.email_confirmed_at) {
        toast({
          title: "Verification Email Sent",
          description: "Please check your email to verify your account",
        });
      } else {
        toast({
          title: "Signup Successful",
          description: "Your account has been created",
        });
      }

      return { success: true };
    } catch (error: any) {
      toast({
        title: "Signup Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });
    } catch (error: any) {
      toast({
        title: "Logout Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    signIn,
    signUp,
    signup: signUp, // Alias for backward compatibility
    logout,
    loading
  };
};
