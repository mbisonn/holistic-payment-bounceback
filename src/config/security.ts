interface SecurityConfig {
  cors: {
    allowedOrigins: string[];
    allowedMethods: string[];
    allowedHeaders: string[];
    exposedHeaders: string[];
    maxAge: number;
  };
  rateLimit: {
    windowMs: number;
    max: number;
    message: string;
  };
  csrf: {
    cookie: {
      key: string;
      path: string;
      httpOnly: boolean;
      secure: boolean;
      maxAge: number;
    };
    ignoreMethods: string[];
  };
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: string[];
        scriptSrc: string[];
        styleSrc: string[];
        imgSrc: string[];
        connectSrc: string[];
        fontSrc: string[];
        objectSrc: string[];
        mediaSrc: string[];
        frameSrc: string[];
      };
    };
  };
}

export const securityConfig: SecurityConfig = {
  cors: {
    allowedOrigins: [
      process.env.NEXT_PUBLIC_APP_URL || 'https://www.teneraholisticandwellness.com',
      'https://api.paystack.co'
    ],
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
    maxAge: 86400 // 24 hours
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
  },
  csrf: {
    cookie: {
      key: 'csrf-token',
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600 // 1 hour
    },
    ignoreMethods: ['GET', 'HEAD', 'OPTIONS']
  },
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          'https://js.paystack.co',
          'https://checkout.paystack.com'
        ],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: [
          "'self'",
          'https://api.paystack.co',
          process.env.NEXT_PUBLIC_APP_URL || 'https://www.teneraholisticandwellness.com'
        ],
        fontSrc: ["'self'", 'https:', 'data:'],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: [
          "'self'",
          'https://checkout.paystack.com',
          'https://js.paystack.co'
        ]
      }
    }
  }
};

// Validate security configuration
export function validateSecurityConfig(): boolean {
  const requiredOrigins = securityConfig.cors.allowedOrigins;
  if (!requiredOrigins || requiredOrigins.length === 0) {
    throw new Error('Missing required CORS origins');
  }

  const requiredCSP = securityConfig.helmet.contentSecurityPolicy.directives;
  if (!requiredCSP || !requiredCSP.defaultSrc || !requiredCSP.scriptSrc) {
    throw new Error('Missing required Content Security Policy directives');
  }

  return true;
} 