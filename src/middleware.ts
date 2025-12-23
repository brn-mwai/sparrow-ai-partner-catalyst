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
      // Get onboarding cookie status (set after completing onboarding)
      const onboardingCompleted = request.cookies.get('sparrow_onboarding_completed');

      if (!onboardingCompleted) {
        // Check with API if onboarding is completed
        try {
          const baseUrl = request.nextUrl.origin;
          const checkResponse = await fetch(`${baseUrl}/api/user/onboarding`, {
            headers: {
              Cookie: request.headers.get('cookie') || '',
            },
          });

          if (checkResponse.ok) {
            const data = await checkResponse.json();

            if (!data.onboarding_completed) {
              // Redirect to onboarding
              const onboardingUrl = new URL('/onboarding', request.url);
              return NextResponse.redirect(onboardingUrl);
            } else {
              // Set cookie to avoid future API calls
              const response = NextResponse.next();
              response.cookies.set('sparrow_onboarding_completed', 'true', {
                maxAge: 60 * 60 * 24 * 30, // 30 days
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
              });
              return response;
            }
          }
        } catch (error) {
          // If check fails, allow access (don't block on error)
          console.error('Onboarding check failed:', error);
        }
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
