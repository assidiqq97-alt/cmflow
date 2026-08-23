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
