import type { NextConfig } from "next";

/**
 * Resolve the backend base URL for API proxy rewrites.
 *
 * - Dev:  NEXT_PUBLIC_API_URL = "http://localhost:8000"  (set in frontend/.env)
 * - Prod: BACKEND_INTERNAL_URL = "https://creatoros-backend.onrender.com"
 *         (set automatically by Render via the render.yaml fromService reference)
 *
 * We prefer the explicit BACKEND_INTERNAL_URL in production so the protocol
 * is always well-defined, then fall back to NEXT_PUBLIC_API_URL for local dev.
 */
function resolveBackendUrl(): string {
  const raw =
    process.env.BACKEND_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://127.0.0.1:8000';

  // If the value already starts with http(s):// return as-is (dev env or full URL)
  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    return raw;
  }

  // Render's fromService.property: host returns just the hostname (e.g. creatoros-backend.onrender.com)
  return `https://${raw}`;
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'logo.clearbit.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
  async rewrites() {
    const backendUrl = resolveBackendUrl();
    console.log(`[next.config] API proxy → ${backendUrl}`);
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
