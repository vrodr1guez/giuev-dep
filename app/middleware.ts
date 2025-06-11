import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of public paths that don't require authentication
const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password'];

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Check if the path is in the public paths list
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname.startsWith(path) || request.nextUrl.pathname === '/'
  );
  
  // For demo purposes, we'll use a simple cookie to check if user is logged in
  // In a real app, you'd use a JWT token or session cookie with validation
  const isAuthenticated = request.cookies.has('auth-token');
  
  // If the path requires authentication and user is not authenticated, redirect to login
  if (!isPublicPath && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // If user is authenticated and trying to access login page, redirect to dashboard
  if (isAuthenticated && publicPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /fonts (inside public directory)
     * 4. /examples (inside public directory)
     * 5. all root files inside public (e.g. favicon.ico)
     */
    '/((?!api|_next|fonts|examples|[\\w-]+\\.\\w+).*)',
  ],
}; 