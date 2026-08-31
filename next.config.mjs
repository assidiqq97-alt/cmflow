/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // Ignore les erreurs de typage TypeScript pendant le build de production Vercel
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignore les erreurs et avertissements ESLint pendant le build
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.fbcdn.net',
      },
      {
        protocol: 'https',
        hostname: '*.cdninstagram.com',
      },
      {
        protocol: 'https',
        hostname: '*.licdn.com',
      },
      {
        protocol: 'https',
        hostname: 'media.licdn.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/dashboard',
        destination: '/dashboard.html',
      },
      {
        source: '/admin',
        destination: '/admin.html',
      },
      {
        source: '/planning',
        destination: '/planning.html',
      },
      {
        source: '/billing',
        destination: '/billing.html',
      },
      {
        source: '/clients',
        destination: '/clients.html',
      },
      {
        source: '/analytics',
        destination: '/analytics.html',
      },
      {
        source: '/inbox',
        destination: '/inbox.html',
      },
      {
        source: '/settings',
        destination: '/settings.html',
      },
      {
        source: '/channels',
        destination: '/channels.html',
      },
      {
        source: '/settings/channels',
        destination: '/channels.html',
      },
      {
        source: '/dashboard/channels',
        destination: '/channels.html',
      },
      {
        source: '/dashboard/settings/channels',
        destination: '/channels.html',
      },
      {
        source: '/validation',
        destination: '/validation.html',
      },
      {
        source: '/startpage',
        destination: '/startpage.html',
      },
      {
        source: '/bio',
        destination: '/startpage.html',
      },
      {
        source: '/login',
        destination: '/login.html',
      },
      {
        source: '/register',
        destination: '/register.html',
      },
      {
        source: '/media',
        destination: '/media.html',
      },
      {
        source: '/legal',
        destination: '/legal.html',
      },
      {
        source: '/onboarding',
        destination: '/onboarding.html',
      },
      {
        source: '/v/:token',
        destination: '/client-review.html',
      },
      {
        source: '/approve/:token',
        destination: '/client-review.html',
      },
    ];
  },
};

export default nextConfig;
