import withBundleAnalyzer from "@next/bundle-analyzer";

/** @type {import('next').NextConfig} */
const isProduction = process.env.NODE_ENV === "production";

const nextConfig = {
  distDir: process.env.BUILD_DIR || ".next",
  assetPrefix: isProduction ? "https://assets.estajer.com" : "",
  compress: false,
  // Disable X-Powered-By header for security
  poweredByHeader: false,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  serverExternalPackages: ['sharp'],
  // PERFORMANCE: Enable production optimizations
  reactStrictMode: true,
  experimental: {
    serverActions: {
      allowedOrigins: [
        process.env.NEXT_PUBLIC_APP_URL || "https://estajer.com",
        "secure.paytabs.sa",
      ],
      bodySizeLimit: "10mb",
    },
    // optimizeCss: true,
    // inlineCss: true,

    // PERFORMANCE: Optimize package imports to reduce bundle size
    optimizePackageImports: [
      // UI Component Libraries
      "@heroui/react",

      // Visualization Libraries
      "@visx/axis",
      "@visx/event",
      "@visx/group",
      "@visx/responsive",
      "@visx/scale",
      "@visx/shape",
      "@visx/tooltip",

      // Animation
      "framer-motion",

      // Date utilities
      "date-fns",
      "react-day-picker",

      // PERFORMANCE: Add heavy dependencies for tree-shaking
      "socket.io-client",
      "driver.js",
      "react-toastify",
    ],

    // webpackBuildWorker: true,
  },
  async headers() {
    // Content Security Policy configuration
    // Adjust these based on your external services
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https: https://*.clarity.ms https://c.bing.com https://assets.estajer.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://assets.estajer.com",
      "img-src 'self' data: blob: https: http: https://*.clarity.ms https://c.bing.com https://z.clarity.ms",
      "font-src 'self' data: https://fonts.gstatic.com https://assets.estajer.com",
      "connect-src 'self' data: https: wss: ws: https://*.clarity.ms https://c.bing.com https://*.bing.com https://z.clarity.ms https://t.clarity.ms https://assets.estajer.com",
      "frame-src 'self' https:",
      "form-action 'self' https:",
      "base-uri 'self'",
      "object-src 'none'",
      "media-src 'self' blob:",
      "manifest-src 'self'",
      "worker-src 'self' blob:",
      "child-src 'self' blob:",
      "frame-ancestors 'self' https://*.clarity.ms https://*.bing.com",
      ...(isProduction ? ["upgrade-insecure-requests"] : []),
    ];

    const ContentSecurityPolicy = cspDirectives.join("; ");

    return [
      {
        source: "/ads.txt",
        headers: [
          {
            key: "Content-Type",
            value: "text/plain; charset=utf-8",
          },
        ],
      },
      {
        source: "/",
        headers: [
          {
            key: "Link",
            value: '</.well-known/api-catalog>; rel="api-catalog"',
          },
        ],
      },
      {
        // Apply security headers to all routes
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Content Security Policy
          {
            key: "Content-Security-Policy",
            value: ContentSecurityPolicy,
          },
          // Cross-Origin-Opener-Policy - isolates the browsing context
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
          // Cross-Origin-Resource-Policy
          {
            key: "Cross-Origin-Resource-Policy",
            value: "cross-origin",
          },
          // Referrer Policy
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Access Control Allow Origin for Clarity/external tools to fetch assets
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, OPTIONS",
          },
          // Permissions Policy (replaces Feature-Policy)
          {
            key: "Permissions-Policy",
            value:
              "camera=(self), microphone=(), geolocation=(self), interest-cohort=()",
          },
          ...(isProduction
            ? [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=31536000; includeSubDomains; preload",
                },
              ]
            : []),
        ],
      },
    ];
  },
};

const withBundleAnalyzerConfig = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default withBundleAnalyzerConfig(nextConfig);

// set ANALYZE=true
