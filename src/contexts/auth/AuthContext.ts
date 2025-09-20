
import { createContext } from 'react';
import { User } from '@supabase/supabase-js';

export interface AuthContextType {
  user: User | null;
  currentUser: User | null;
  session: any | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: string) => Promise<boolean>;
  resendVerification: (email: string) => Promise<{ success: boolean; error?: string }>;
  error: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
