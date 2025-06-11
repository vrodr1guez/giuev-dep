import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user' | 'sales';
  name: string;
  permissions: string[];
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-development';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Generate JWT token
export function generateToken(user: Omit<User, 'permissions'>): string {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Verify JWT token
export function verifyToken(token: string): AuthTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// Extract token from request
export function extractTokenFromRequest(request: NextRequest): string | null {
  // Check Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check cookies
  const token = request.cookies.get('auth-token');
  if (token) {
    return token.value;
  }

  return null;
}

// Authenticate request
export async function authenticateRequest(request: NextRequest): Promise<AuthResult> {
  const token = extractTokenFromRequest(request);
  
  if (!token) {
    return { success: false, error: 'No token provided' };
  }

  const payload = verifyToken(token);
  if (!payload) {
    return { success: false, error: 'Invalid token' };
  }

  // In a real app, you would fetch user from database
  // For now, we'll create a mock user based on the token
  const user: User = {
    id: payload.userId,
    email: payload.email,
    role: payload.role as 'admin' | 'user' | 'sales',
    name: payload.email.split('@')[0], // Mock name from email
    permissions: getPermissionsForRole(payload.role as 'admin' | 'user' | 'sales'),
  };

  return { success: true, user };
}

// Get permissions for role
function getPermissionsForRole(role: 'admin' | 'user' | 'sales'): string[] {
  const permissions = {
    admin: [
      'read:contacts',
      'write:contacts',
      'delete:contacts',
      'read:demos',
      'write:demos',
      'delete:demos',
      'read:analytics',
      'write:settings',
      'manage:users',
    ],
    sales: [
      'read:contacts',
      'write:contacts',
      'read:demos',
      'write:demos',
      'read:analytics',
    ],
    user: [
      'read:own-data',
      'write:own-data',
    ],
  };

  return permissions[role] || [];
}

// Check if user has permission
export function hasPermission(user: User, permission: string): boolean {
  return user.permissions.includes(permission);
}

// Middleware factory for protecting routes
export function requireAuth(requiredPermissions: string[] = []) {
  return async (request: NextRequest) => {
    const authResult = await authenticateRequest(request);
    
    if (!authResult.success || !authResult.user) {
      return {
        authenticated: false,
        error: authResult.error || 'Authentication failed',
      };
    }

    // Check permissions
    if (requiredPermissions.length > 0) {
      const hasRequiredPermissions = requiredPermissions.every(permission =>
        hasPermission(authResult.user!, permission)
      );

      if (!hasRequiredPermissions) {
        return {
          authenticated: false,
          error: 'Insufficient permissions',
        };
      }
    }

    return {
      authenticated: true,
      user: authResult.user,
    };
  };
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Mock user authentication (replace with database lookup)
export async function authenticateUser(email: string, password: string): Promise<User | null> {
  // This is a mock implementation
  // In production, you would query your database
  const mockUsers = [
    {
      id: '1',
      email: 'admin@giuev.com',
      password: await hashPassword('admin123'), // In real app, this would be pre-hashed in DB
      role: 'admin' as const,
      name: 'Admin User',
    },
    {
      id: '2',
      email: 'sales@giuev.com',
      password: await hashPassword('sales123'),
      role: 'sales' as const,
      name: 'Sales User',
    },
  ];

  const user = mockUsers.find(u => u.email === email);
  if (!user) return null;

  const isPasswordValid = await verifyPassword(password, user.password);
  if (!isPasswordValid) return null;

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    permissions: getPermissionsForRole(user.role),
  };
}

// Rate limiting for auth endpoints
const authAttempts = new Map<string, { count: number; lastAttempt: number }>();

export function checkRateLimit(identifier: string, maxAttempts = 5, windowMs = 15 * 60 * 1000): boolean {
  const now = Date.now();
  const attempts = authAttempts.get(identifier);

  if (!attempts) {
    authAttempts.set(identifier, { count: 1, lastAttempt: now });
    return true;
  }

  // Reset if window has passed
  if (now - attempts.lastAttempt > windowMs) {
    authAttempts.set(identifier, { count: 1, lastAttempt: now });
    return true;
  }

  // Increment attempts
  attempts.count++;
  attempts.lastAttempt = now;

  return attempts.count <= maxAttempts;
}

// Clean up old rate limit entries
setInterval(() => {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes

  for (const [key, value] of authAttempts.entries()) {
    if (now - value.lastAttempt > windowMs) {
      authAttempts.delete(key);
    }
  }
}, 5 * 60 * 1000); // Clean up every 5 minutes

// Generate secure random string for sessions
export function generateSecureRandom(length = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

// CSRF token generation and validation
const csrfTokens = new Map<string, number>();

export function generateCSRFToken(): string {
  const token = generateSecureRandom(32);
  csrfTokens.set(token, Date.now());
  return token;
}

export function validateCSRFToken(token: string): boolean {
  const timestamp = csrfTokens.get(token);
  if (!timestamp) return false;

  // Token expires after 1 hour
  const isExpired = Date.now() - timestamp > 60 * 60 * 1000;
  if (isExpired) {
    csrfTokens.delete(token);
    return false;
  }

  return true;
}

// Clean up expired CSRF tokens
setInterval(() => {
  const now = Date.now();
  const expireTime = 60 * 60 * 1000; // 1 hour

  for (const [token, timestamp] of csrfTokens.entries()) {
    if (now - timestamp > expireTime) {
      csrfTokens.delete(token);
    }
  }
}, 10 * 60 * 1000); // Clean up every 10 minutes 