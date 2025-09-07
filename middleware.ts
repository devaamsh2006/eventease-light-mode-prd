import { NextResponse, NextRequest } from 'next/server';
import { auth } from './src/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  try {
    // Define public routes that don't require authentication
    const publicRoutes = [
      '/',
      '/login',
      '/register',
      '/api/auth/signin',
      '/api/auth/signup',
      '/api/auth/signout',
      '/api/auth/session',
      '/api/auth/callback',
      '/api/auth/verify-email',
      '/api/auth/reset-password',
      '/api/auth/forgot-password'
    ];

    // Define static file extensions to ignore
    const staticFileExtensions = [
      '.ico',
      '.png',
      '.jpg',
      '.jpeg',
      '.gif',
      '.svg',
      '.webp',
      '.css',
      '.js',
      '.json',
      '.xml',
      '.txt',
      '.pdf',
      '.woff',
      '.woff2',
      '.ttf',
      '.eot'
    ];

    // Skip middleware for static files
    if (staticFileExtensions.some(ext => pathname.endsWith(ext))) {
      return NextResponse.next();
    }

    // Skip middleware for Next.js internal routes
    if (pathname.startsWith('/_next/') || pathname.startsWith('/api/_next/')) {
      return NextResponse.next();
    }

    // Allow public routes
    if (publicRoutes.includes(pathname) || pathname.startsWith('/api/auth/')) {
      return NextResponse.next();
    }

    // Get session from better-auth
    const session = await auth.api.getSession({
      headers: request.headers
    });

    // Check if user is authenticated
    if (!session || !session.user) {
      // Redirect unauthenticated users to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const user = session.user;
    const userRole = user.role || 'user';

    // Protect admin routes - only "organizer" role can access
    if (pathname.startsWith('/admin/')) {
      if (userRole !== 'organizer') {
        // Redirect unauthorized users to dashboard
        const dashboardUrl = new URL('/dashboard', request.url);
        return NextResponse.redirect(dashboardUrl);
      }
      return NextResponse.next();
    }

    // Protect dashboard routes - authenticated users only
    if (pathname.startsWith('/dashboard/')) {
      // User is already authenticated, allow access
      return NextResponse.next();
    }

    // Protect API routes that require authentication
    if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/')) {
      // API routes requiring authentication
      const protectedApiRoutes = [
        '/api/users',
        '/api/posts',
        '/api/events',
        '/api/bookings',
        '/api/profile'
      ];

      const isProtectedApi = protectedApiRoutes.some(route => 
        pathname.startsWith(route)
      );

      if (isProtectedApi) {
        // Return unauthorized for API routes
        return NextResponse.json(
          { error: 'Authentication required', code: 'UNAUTHORIZED' },
          { status: 401 }
        );
      }
    }

    // For all other routes, allow access if authenticated
    return NextResponse.next();

  } catch (error) {
    console.error('Middleware error:', error);

    // In case of middleware failure, redirect to login for protected routes
    const isProtectedRoute = pathname.startsWith('/dashboard/') || 
                           pathname.startsWith('/admin/') ||
                           (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/'));

    if (isProtectedRoute) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Authentication service unavailable', code: 'AUTH_ERROR' },
          { status: 503 }
        );
      } else {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        loginUrl.searchParams.set('error', 'auth_error');
        return NextResponse.redirect(loginUrl);
      }
    }

    // For public routes, continue despite error
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};