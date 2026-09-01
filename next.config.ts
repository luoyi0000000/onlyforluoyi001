import type { NextConfig } from 'next'

/**
 * Cloudflare Workers Static Assets target.
 *
 * `output: 'export'` is the hard constraint that shapes this whole codebase:
 * no Server Actions, no Node-runtime route handlers, no ISR/revalidate,
 * no `next/headers`, no `cookies()`, no dynamic middleware. Every dynamic
 * route must supply `generateStaticParams`.
 */
const nextConfig: NextConfig = {
  output: 'export',

  // Emit `out/zh/index.html` rather than `out/zh.html`, which is what
  // Workers Static Assets serves most predictably for directory-style URLs.
  trailingSlash: true,

  // No image optimization service exists behind a static export.
  images: {
    unoptimized: true,
  },

  reactStrictMode: true,

  // Fail the build on type/lint errors instead of shipping them.
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: false },

  // Drop the `x-powered-by` fingerprint from the dev server responses.
  poweredByHeader: false,
}

export default nextConfig
