import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.licdn.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.linkedin.com',
        pathname: '/**',
      },
    ],
  },

  // Environment variables that should be available on the client
  env: {
    NEXT_PUBLIC_APP_NAME: 'Sparrow AI',
  },

  // Experimental features
  experimental: {
    // Enable server actions
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // Security and CORS headers
  async headers() {
    return [
      {
        // Apply CSP to all routes - allows ElevenLabs SDK, Phosphor Icons, Rive to work
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://api.elevenlabs.io https://*.clerk.accounts.dev https://*.clerk.com https://clerk.sprrw.app https://*.sprrw.app https://challenges.cloudflare.com https://*.hcaptcha.com https://unpkg.com https://cdn.jsdelivr.net https://vercel.live blob:",
              "style-src 'self' 'unsafe-inline' https://unpkg.com https://cdn.jsdelivr.net https://*.hcaptcha.com",
              "img-src 'self' data: blob: https: http:",
              "font-src 'self' data: https://unpkg.com https://cdn.jsdelivr.net",
              "connect-src 'self' https://api.elevenlabs.io wss://api.elevenlabs.io https://*.clerk.accounts.dev https://*.clerk.com https://clerk.sprrw.app https://*.sprrw.app https://challenges.cloudflare.com https://*.hcaptcha.com https://*.supabase.co wss://*.supabase.co https://api.groq.com https://generativelanguage.googleapis.com https://unpkg.com https://cdn.jsdelivr.net ws://127.0.0.1:* ws://localhost:*",
              "media-src 'self' blob: https://api.elevenlabs.io",
              "worker-src 'self' blob:",
              "frame-src 'self' https://*.clerk.accounts.dev https://*.clerk.com https://clerk.sprrw.app https://*.sprrw.app https://challenges.cloudflare.com https://*.hcaptcha.com",
            ].join('; '),
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,PATCH,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
    ];
  },
};

export default nextConfig;
