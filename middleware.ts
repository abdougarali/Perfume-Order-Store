import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware to protect Admin Routes
 * Checks login before accessing /admin/*
 */
export function middleware(request: NextRequest) {
  const session = request.cookies.get('admin_session');
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isLoginPage = request.nextUrl.pathname === '/admin/login';
  const isApiRoute = request.nextUrl.pathname.startsWith('/api');

  // Ignore API routes (they have separate protection)
  if (isApiRoute) {
    return NextResponse.next();
  }

  // If in Admin route but not on login page
  if (isAdminRoute && !isLoginPage) {
    // If not logged in → redirect to login
    if (!session || session.value !== 'authenticated') {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If on login page and logged in → redirect to dashboard
  if (isLoginPage && session?.value === 'authenticated') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    // Exclude static files and API routes
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
