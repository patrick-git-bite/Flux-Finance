
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // This is the "VIP guest list" that allows your cloud environment to talk to the server.
  // It's now at the top level, as required by this version of Next.js.
  allowedDevOrigins: ['https://9003-firebase-flux-finance-1758740174461.cluster-r7kbxfo3fnev2vskbkhhphetq6.cloudworkstations.dev'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // The "magic" proxy that makes this all work.
  async rewrites() {
    return [
      {
        // This rule intercepts calls to the Google Auth API...
        source: '/identitytoolkit.googleapis.com/:path*',
        // ...and redirects them to the local emulator.
        destination: 'http://127.0.0.1:9099/identitytoolkit.googleapis.com/:path*',
      },
      {
        // This rule intercepts calls to the Firebase Functions API...
        source: '/functions-proxy/:path*',
        // ...and redirects them to the local emulator.
        destination: 'http://127.0.0.1:5001/studio-4432826442-a8369/us-central1/:path*',
      }
    ];
  },
};

export default nextConfig;
