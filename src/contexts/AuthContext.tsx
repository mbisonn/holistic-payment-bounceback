
// This file is kept for backward compatibility
// It re-exports the new modular implementation
import { AuthContext } from './auth/AuthContext';
import { AuthProvider } from './auth/AuthProvider';
import { useAuth } from '../hooks/useAuth';

export { AuthContext, AuthProvider, useAuth };

// Export the type directly from the auth context
export type { AuthContextType } from './auth/AuthContext';
