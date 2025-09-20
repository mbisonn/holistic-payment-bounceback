// Enhanced XSS Protection utilities
import DOMPurify from 'dompurify';

// Configure DOMPurify for maximum security
const purifyConfig = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
  ALLOWED_ATTR: ['class'],
  FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed'],
  FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover', 'style'],
  KEEP_CONTENT: false,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
};

// Sanitize HTML content
export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, purifyConfig);
};

// Sanitize plain text input
export const sanitizeText = (text: string): string => {
  return text
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:/gi, '') // Remove data: protocol
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
};

// Sanitize URL to prevent XSS
export const sanitizeUrl = (url: string): string => {
  const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
  
  try {
    const urlObj = new URL(url);
    if (!allowedProtocols.includes(urlObj.protocol)) {
      return '#';
    }
    return url;
  } catch {
    // If URL is invalid, return safe default
    return '#';
  }
};

// Sanitize form data
export const sanitizeFormData = (data: Record<string, any>): Record<string, any> => {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeText(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeFormData(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

// Content Security Policy helpers
export const addCSPHeaders = (): string => {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://js.paystack.co https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://*.supabase.co https://api.paystack.co https://www.google-analytics.com",
    "frame-src 'self' https://js.paystack.co",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ');
};

// Validate and sanitize email addresses
export const sanitizeEmail = (email: string): string => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const sanitized = sanitizeText(email.toLowerCase().trim());
  
  return emailRegex.test(sanitized) ? sanitized : '';
};

// Validate and sanitize phone numbers
export const sanitizePhone = (phone: string): string => {
  return phone.replace(/[^\d+\-\s()]/g, '').trim();
};

// File upload security validation
export const validateFileUpload = (file: File): { valid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Only images are allowed.' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File too large. Maximum size is 5MB.' };
  }
  
  // Check for malicious file names
  const sanitizedName = sanitizeText(file.name);
  if (sanitizedName !== file.name) {
    return { valid: false, error: 'Invalid file name.' };
  }
  
  return { valid: true };
};