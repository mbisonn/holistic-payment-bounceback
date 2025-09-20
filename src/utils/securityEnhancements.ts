// Enhanced security utilities
import { supabase } from '@/integrations/supabase/client';

// Security event logging - DISABLED to prevent 401 errors
export const logSecurityEvent = async (
  eventType: string,
  metadata: any = {}
) => {
  // Completely disabled to prevent 401 errors
  console.log('Security event logging disabled:', eventType, metadata);
  return;
};

// Enhanced email redirect validation
export const validateEmailRedirect = (redirectUrl: string): boolean => {
  const allowedDomains = [
    'e84d0afb-f51a-49f1-b3e0-2d35cebef2bd.lovableproject.com',
    'www.teneraholisticandwellness.com',
    'localhost:3000', // For development
    'localhost:5173', // For Vite dev server
  ];
  
  try {
    const url = new URL(redirectUrl);
    return allowedDomains.some(domain => 
      url.hostname === domain || 
      url.host === domain
    );
  } catch {
    return false;
  }
};

// Session security utilities
export const invalidateAllSessions = async () => {
  try {
    await supabase.auth.signOut({ scope: 'global' });
    console.log('Session invalidated globally');
  } catch (error) {
    console.error('Failed to invalidate sessions:', error);
  }
};

// Input sanitization
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};

// Rate limiting tracking
const rateLimitAttempts = new Map<string, { count: number; resetTime: number }>();

export const checkClientRateLimit = (
  identifier: string, 
  limit: number = 5, 
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): boolean => {
  const now = Date.now();
  const key = `${identifier}_${Math.floor(now / windowMs)}`;
  
  const current = rateLimitAttempts.get(key) || { count: 0, resetTime: now + windowMs };
  
  if (current.count >= limit) {
    return false;
  }
  
  current.count++;
  rateLimitAttempts.set(key, current);
  
  // Cleanup old entries
  if (Math.random() < 0.1) {
    for (const [k, v] of rateLimitAttempts.entries()) {
      if (v.resetTime < now) {
        rateLimitAttempts.delete(k);
      }
    }
  }
  
  return true;
};

// Enhanced origin validation
export const validateOrigin = (origin: string | null): boolean => {
  const allowedOrigins = [
    'https://e84d0afb-f51a-49f1-b3e0-2d35cebef2bd.lovableproject.com',
    'https://www.teneraholisticandwellness.com',
    'http://localhost:3000',
    'http://localhost:5173',
  ];
  
  return origin ? allowedOrigins.includes(origin) : false;
};