
export interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  user_metadata?: {
    name?: string;
    firstName?: string;
    lastName?: string;
  };
  is_admin?: boolean;
}

export interface AddAdminUserData {
  firstName: string;
  lastName: string;
  email: string;
  adminType: string;
}

export interface InviteUserData {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}
