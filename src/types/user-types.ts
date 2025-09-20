export interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  user_metadata?: {
    name?: string;
  };
  is_admin?: boolean;
}

export interface SupabaseUser {
  id: string;
  email?: string;
  created_at: string;
  last_sign_in_at?: string | null;
  user_metadata: {
    name?: string;
  };
  app_metadata: Record<string, unknown>;
  [key: string]: unknown;
}
