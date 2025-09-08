import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// Simple in-memory rate limiting (production should use Redis)
const store: RateLimitStore = {};

export function createRateLimit(options: {
  windowMs: number;
  max: number;
  message?: string;
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
    const key = `${clientIp}:${req.route?.path || req.path}`;
    const now = Date.now();
    
    // Clean expired entries
    Object.keys(store).forEach(k => {
      if (store[k].resetTime < now) {
        delete store[k];
      }
    });
    
    // Check current request
    if (!store[key]) {
      store[key] = {
        count: 1,
        resetTime: now + options.windowMs
      };
    } else if (store[key].resetTime > now) {
      store[key].count++;
      
      if (store[key].count > options.max) {
        console.log(`[SECURITY] Rate limit exceeded for IP: ${clientIp}, Path: ${req.path}, Time: ${new Date().toISOString()}`);
        return res.status(429).json({
          error: options.message || 'Muitas tentativas. Tente novamente em alguns minutos.',
          valid: false
        });
      }
    } else {
      store[key] = {
        count: 1,
        resetTime: now + options.windowMs
      };
    }
    
    next();
  };
}