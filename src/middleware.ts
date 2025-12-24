import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks/(.*)',
  '/api/health',
  '/privacy',
  '/terms',
  '/support',
  '/cookies',
]);

// Routes that require authentication but skip onboarding check
const skipOnboardingCheck = createRouteMatcher([
  '/onboarding',
  '/api/user/onboarding',
  '/api/user/profile',
]);

// API routes that accept Bearer token auth (from Chrome extension)
const isApiRoute = createRouteMatcher([
  '/api/briefs/(.*)',
  '/api/usage',
  '/api/user/(.*)',
  '/api/chat',
  '/api/calls/(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl;

  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // Skip Clerk protection for API routes with Bearer token
  const authHeader = request.headers.get('Authorization');
  if (isApiRoute(request) && authHeader?.startsWith('Bearer ')) {
    return NextResponse.next();
  }

  // Protect all routes except public ones
  if (!isPublicRoute(request)) {
    const { userId } = await auth.protect();

    // Check onboarding status for authenticated users on dashboard routes
    if (
      userId &&
      pathname.startsWith('/dashboard') &&
      !skipOnboardingCheck(request)
    ) {
      // Check cookie for onboarding completion (set by onboarding page)
      const onboardingCompleted = request.cookies.get('sparrow_onboarding_completed');

      if (!onboardingCompleted) {
        // Redirect to onboarding - it will check DB and redirect back if already completed
        const onboardingUrl = new URL('/onboarding', request.url);
        return NextResponse.redirect(onboardingUrl);
      }
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
