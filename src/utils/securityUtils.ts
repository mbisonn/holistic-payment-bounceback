
// Security utility functions

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting function
export const checkRateLimit = (identifier: string, limit: number, windowMs: number): boolean => {
  const now = Date.now();
  const key = `${identifier}_${Math.floor(now / windowMs)}`;
  
  const current = rateLimitStore.get(key) || { count: 0, resetTime: now + windowMs };
  
  if (current.count >= limit) {
    return false; // Rate limit exceeded
  }
  
  current.count++;
  rateLimitStore.set(key, current);
  
  // Clean up old entries
  if (Math.random() < 0.1) { // 10% chance to clean up
    for (const [k, v] of rateLimitStore.entries()) {
      if (v.resetTime < now) {
        rateLimitStore.delete(k);
      }
    }
  }
  
  return true;
};

// Secure headers for edge functions
export const getSecureHeaders = () => ({
  'Access-Control-Allow-Origin': 'https://e84d0afb-f51a-49f1-b3e0-2d35cebef2bd.lovableproject.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Content-Type': 'application/json',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
});

// Validate origin for security
export const isValidOrigin = (origin: string | null): boolean => {
  const allowedOrigins = [
    'https://e84d0afb-f51a-49f1-b3e0-2d35cebef2bd.lovableproject.com',
    'https://www.teneraholisticandwellness.com',
    'http://localhost:3000', // For development
  ];
  
  return origin ? allowedOrigins.includes(origin) : false;
};

// Generate secure reference
export const generateSecureReference = (prefix: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${prefix}_${timestamp}_${random}`.toUpperCase();
};

// Log security events
export const logSecurityEvent = (event: string, details: any) => {
  console.log(`[SECURITY] ${event}:`, {
    timestamp: new Date().toISOString(),
    ...details
  });
};
