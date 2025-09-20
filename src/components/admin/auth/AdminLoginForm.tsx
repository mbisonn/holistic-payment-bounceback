import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { EyeIcon, EyeOffIcon, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logSecurityEvent, checkClientRateLimit } from '@/utils/securityEnhancements';

// Form validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface AdminLoginFormProps {
  onSuccess: () => void;
  onStart?: () => void;
  onError?: (errMsg: string) => void;
}

const AdminLoginForm: React.FC<AdminLoginFormProps> = ({ onSuccess, onStart, onError }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  // Initialize form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const ensureAdminRole = async (userId: string, email: string) => {
    try {
      // Check if user already has admin role
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .single();

      if (!existingRole) {
        // Add admin role if it doesn't exist
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: 'admin' });

        if (roleError) {
          console.error('Error adding admin role:', roleError);
        } else {
          console.log('Admin role added for:', email);
        }
      }
    } catch (error) {
      console.error('Error ensuring admin role:', error);
    }
  };

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    onStart && onStart();
    
    try {
      // Enhanced security: rate limiting for admin login attempts
      if (!checkClientRateLimit(`admin_login_${values.email}`, 3, 15 * 60 * 1000)) {
        const error = 'Too many admin login attempts. Please try again later.';
        toast({
          title: 'Login Failed',
          description: error,
          variant: 'destructive',
        });
        onError && onError(error);
        await logSecurityEvent('admin_login_rate_limited', { email: values.email });
        return;
      }

      console.log('Attempting login for:', values.email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        console.error('Login error:', error);
        toast({
          title: 'Login Failed',
          description: error.message,
          variant: 'destructive',
        });
        onError && onError(error.message);
        await logSecurityEvent('admin_login_failed', { 
          email: values.email, 
          error: error.message 
        });
        return;
      }

      if (data.user) {
        console.log('Login successful for:', data.user.email);
        
        // Ensure admin role for specified accounts
        const adminEmails = ['ebuchenna1@gmail.com', 'info@bouncebacktolifeconsult.pro', 'bouncebacktolifeconsult@gmail.com'];
        const isKnownAdmin = adminEmails.includes(values.email.toLowerCase());
        if (isKnownAdmin) {
          // Fire-and-forget to avoid blocking UI on RLS INSERT
          ensureAdminRole(data.user.id, values.email).catch((e) => console.warn('ensureAdminRole failed (non-blocking):', e));
        }

        await logSecurityEvent('admin_login_success', { email: values.email });
        
        toast({
          title: 'Login Successful',
          description: 'Welcome to the admin dashboard!',
        });
        
        // Clear any stale cached admin flag to force a fresh re-check
        try {
          const keysToRemove: string[] = [];
          for (let i = 0; i < sessionStorage.length; i++) {
            const k = sessionStorage.key(i);
            if (k && k.startsWith('isAdmin:')) keysToRemove.push(k);
          }
          keysToRemove.forEach((k) => sessionStorage.removeItem(k));
        } catch (e) {
          console.warn('Failed to clear cached admin flag:', e);
        }
        
        // Call onSuccess immediately
        console.log('=== CALLING onSuccess CALLBACK ===');
        onSuccess();
      }
    } catch (error) {
      console.error('Unexpected login error:', error);
      const errorMessage = 'An unexpected error occurred. Please try again.';
      toast({
        title: 'Login Error',
        description: errorMessage,
        variant: 'destructive',
      });
      onError && onError(errorMessage);
      await logSecurityEvent('admin_login_error', { 
        email: values.email, 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-600" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-gray-800 px-2 text-gray-400">Login with email</span>
        </div>
      </div>

      {/* Email/Password Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    disabled={isLoading}
                    autoComplete="email"
                    className="bg-gray-900 text-white border-gray-700 placeholder-gray-400"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      disabled={isLoading}
                      autoComplete="current-password"
                      className="bg-gray-900 text-white border-gray-700 placeholder-gray-400"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOffIcon className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <EyeIcon className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="sr-only">
                        {showPassword ? 'Hide password' : 'Show password'}
                      </span>
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full bg-lemon-600 hover:bg-lemon-700 lemon-glow"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...
              </>
            ) : (
              'Login'
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default AdminLoginForm;