import { NextResponse } from "next/server";
import { rateLimit } from "./lib/rate-limit.js";

// ---------------------------------------------------------------------------
// Custom domain → shop slug cache (per-instance, 5-min TTL)
// ---------------------------------------------------------------------------
const _domainCache = new Map(); // domain → { slug: string|null, exp: number }
const DOMAIN_CACHE_TTL = 10 * 60 * 1000;

async function getSlugByDomain(domain, appUrl) {
  const now = Date.now();
  const cached = _domainCache.get(domain);
  if (cached && cached.exp > now) return cached.slug;
  try {
    const res = await fetch(
      `${appUrl}/api/shops/domain?domain=${encodeURIComponent(domain)}`,
      { next: { revalidate: 0 } },
    );
    const json = await res.json();
    const slug = json.slug || null;
    _domainCache.set(domain, { slug, exp: now + DOMAIN_CACHE_TTL });
    return slug;
  } catch {
    return null;
  }
}

// Function to add security headers to responses
function addSecurityHeaders(response) {
  response.headers.delete("X-Powered-By");
  // Content Security Policy
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https: https://*.clarity.ms https://c.bing.com https://assets.estajer.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://assets.estajer.com https://www.googletagmanager.com",
    "img-src 'self' data: blob: https: http: https://*.clarity.ms https://c.bing.com https://z.clarity.ms",
    "font-src 'self' data: https://fonts.gstatic.com https://assets.estajer.com",
    `connect-src 'self' data: https: wss: ws: https://*.clarity.ms https://c.bing.com https://*.bing.com https://z.clarity.ms https://t.clarity.ms https://assets.estajer.com ${process.env.NODE_ENV === "production" ? `https://estajer.com` : "http://localhost:3000"}`,
    "frame-src 'self' https:",
    "form-action 'self' https:",
    "base-uri 'self'",
    "object-src 'none'",
    "media-src 'self' blob:",
    "manifest-src 'self'",
    "worker-src 'self' blob:",
    "child-src 'self' blob:",
    "frame-ancestors 'self' https://*.clarity.ms https://*.bing.com",
  ];

  if (process.env.NODE_ENV === "production") {
    cspDirectives.push("upgrade-insecure-requests");
  }

  response.headers.set("Content-Security-Policy", cspDirectives.join("; "));

  // Frame protection
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  // MIME type protection
  response.headers.set("X-Content-Type-Options", "nosniff");

  // Relaxed CORS for third-party scripts like Clarity
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With",
  );

  // Relaxed Cross-Origin headers for third-party scripts like Clarity
  response.headers.set(
    "Cross-Origin-Opener-Policy",
    "same-origin-allow-popups",
  );
  response.headers.set("Cross-Origin-Resource-Policy", "cross-origin");

  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload",
    );
  }
}

const locales = ["ar", "en"];
const protectedRoutes = [
  "/dashboard",
  "/add-product",
  "/edit-product",
  "/request-product",
  "/edit-request-product",
  "/confirm-account",
];
const adminRoutes = ["/admin"];

function isProtectedRoute(pathname) {
  return protectedRoutes.some((route) => pathname.includes(route));
}

function isAdminRoute(pathname) {
  return adminRoutes.some((route) => pathname.includes(route));
}

function isBannedRoute(pathname) {
  return pathname.includes("/banned");
}

const createLimiter = ({ limit = 130, interval = 20 * 1000 }) => {
  return rateLimit({ limit, interval, uniqueTokenPerInterval: 500 });
};
// Configure rate limiting for different route types
const generalLimiter = createLimiter({});
const apiMutationLimiter = createLimiter({ limit: 20, interval: 10 * 1000 });
const authLimiter = createLimiter({ interval: 5 * 60 * 1000, limit: 10 });
const waffyLimiter = createLimiter({ limit: 200, interval: 5 * 1000 });

export async function middleware(req) {
  const pathname = req.nextUrl.pathname;
  const searchParams = req.nextUrl.search;
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", pathname);
  const method = req.method;

  // Handle preflight OPTIONS requests
  if (method === "OPTIONS") {
    const response = new NextResponse(null, { status: 204 });
    addSecurityHeaders(response);
    return response;
  }

  // Handle shop login/register/confirm-account/banned/forgot-password page rewrites to the main site pages
  const authPagesPattern =
    /^\/(?:(ar|en)\/)?shops\/[^\/]+\/(login|register|confirm-account|banned|forgot-password)$/;
  const authMatch = pathname.match(authPagesPattern);
  if (authMatch) {
    const localeSegment = authMatch[1] ? `${authMatch[1]}/` : "";
    const pageSegment = authMatch[2];
    const rewriteResponse = NextResponse.rewrite(
      new URL(`/${localeSegment}${pageSegment}${searchParams}`, req.url),
      { request: { headers: requestHeaders } },
    );
    addSecurityHeaders(rewriteResponse);
    return rewriteResponse;
  }

  // Handle Markdown content negotiation for agents
  if (req.headers.get("accept")?.includes("text/markdown")) {
    const isHomePage =
      pathname === "/" || pathname === "/en" || pathname === "/ar";

    if (isHomePage) {
      const isEnglish = pathname.startsWith("/en");
      const markdownContent = isEnglish
        ? "# Estajer | Rent Anything\n\nDiscover a wide range of products for rent. From electronics to tools, find what you need without buying.\n\n[Browse Products](/en/search/products)\n[Add Product](/en/add-product)"
        : "# استأجر | كل احتياجاتك\n\nاكتشف مجموعة واسعة من المنتجات للإيجار. من الإلكترونيات إلى الأدوات، اعثر على ما تحتاجه دون عناء الشراء.\n\n[تصفح المنتجات](/search/products)\n[أضف منتج](/add-product)";

      const response = new NextResponse(markdownContent, {
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "x-markdown-tokens": "100",
        },
      });
      addSecurityHeaders(response);
      return response;
    }

    // Rewrite Product Pages to dynamic markdown API route
    if (pathname.includes("/products/")) {
      const pathParts = pathname.split("/");
      const productRef = pathParts[pathParts.length - 1];

      // Only rewrite if the segment is a valid 24-char hex MongoDB ObjectId
      if (/^[a-f\d]{24}$/i.test(productRef)) {
        const response = NextResponse.rewrite(
          new URL(`/api/markdown/product/${productRef}`, req.url),
        );
        addSecurityHeaders(response);
        return response;
      }
    }
  }

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/_static") ||
    pathname.startsWith("/.well-known") ||
    pathname.includes("/assets") ||
    pathname.includes("/icons") ||
    pathname.includes("manifest.json") ||
    pathname === "/openapi.json"
  ) {
    return NextResponse.next();
  }

  // // --- MAINTENANCE MODE ---
  // const MAINTENANCE_MODE = true;
  // if (MAINTENANCE_MODE && !pathname.includes("/maintenance")) {
  //   if (pathname.startsWith("/api/")) {
  //     const response = NextResponse.json(
  //       { success: false, message: "Site under maintenance / الموقع قيد التحديث" },
  //       { status: 503 },
  //     );
  //     addSecurityHeaders(response);
  //     return response;
  //   }
  //   let matchedLocale = "ar";
  //   const segment = pathname.split("/")[1];
  //   if (locales.includes(segment)) {
  //     matchedLocale = segment;
  //   }
  //   const response = NextResponse.rewrite(
  //     new URL(`/${matchedLocale}/maintenance`, req.url),
  //   );
  //   addSecurityHeaders(response);
  //   return response;
  // }
  // // -------------------------

  // Apply rate limiting to ALL routes (API and web pages)
  try {
    if (pathname.includes("/api/")) {
      try {
        if (pathname.includes("/api/missing-translations"))
          await generalLimiter.check(req, pathname);
        else if (
          pathname.includes("/login") ||
          pathname.includes("/register") ||
          pathname.includes("/forgot-password") ||
          pathname.includes("/api/change-password")
        )
          await authLimiter.check(req, pathname);
        else if (pathname.includes("/api/tracking"))
          await waffyLimiter.check(req, pathname);
        else if (pathname.includes("/api/waffy/callback"))
          await waffyLimiter.check(req, pathname);
        else {
          // Different limits based on HTTP method for other API routes
          if (method === "GET") await generalLimiter.check(req, pathname);
          else await apiMutationLimiter.check(req, pathname); // POST, PUT, DELETE, PATCH, etc.
        }
      } catch (error) {
        console.log("error from route: " + pathname + " method: " + method);
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 429 },
        );
      } // General rate limiting for all other routes
    } else await generalLimiter.check(req, pathname);
  } catch (error) {
    if (error.status === 429) {
      console.log("error from page: " + pathname);
      const response = new NextResponse(
        "Too Many Requests, please try again later.",
        {
          status: 429,
          headers: { "Retry-After": "60", "Content-Type": "text/plain" },
        },
      );
      addSecurityHeaders(response);
      return response;
    } // If it's not a rate limit error, continue processing
  }
  // For API routes, only apply rate limiting - skip locale and auth logic
  if (pathname.startsWith("/api/")) {
    const response = NextResponse.next();
    addSecurityHeaders(response);
    return response;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://estajer.com";
  const mainHostname = new URL(appUrl).hostname; // "estajer.com"

  const reqHostname = req.headers.get("host") || req.nextUrl.hostname;

  const isCustomDomain =
    reqHostname !== mainHostname &&
    reqHostname !== "localhost:3000" &&
    !reqHostname.endsWith(".vercel.app") &&
    !reqHostname.endsWith(".localhost");

  if (isCustomDomain) {
    const slug = await getSlugByDomain(reqHostname, appUrl);
    if (slug) {
      const supportedLocales = ["ar", "en"];
      const defaultLocale = "ar";

      // ---------------------------------------------------------------------------
      // Clean URL strategy for custom domains
      //
      // Goal: browser bar should NEVER show /shops/{slug}. All links inside the
      // shop use Next.js internal paths like /ar/shops/electra/products/123, but
      // on the custom domain those look ugly. We redirect them to clean URLs and
      // then internally rewrite the clean URL back to the full Next.js path.
      //
      // Flow:
      //  REDIRECT cases (messy URL → clean URL, browser bar changes):
      //    /{locale}/shops/{slug}[/sub]  →  301 → /{locale}[/sub]
      //    /shops/{slug}[/sub]           →  301 → [/sub] or /
      //
      //  REWRITE cases (clean URL → internal Next.js path, browser bar stays):
      //    /                             →  /ar/shops/{slug}
      //    /{locale}                     →  /{locale}/shops/{slug}
      //    /{locale}/sub/path            →  /{locale}/shops/{slug}/sub/path
      //    /sub/path  (no locale)        →  /ar/shops/{slug}/sub/path
      // ---------------------------------------------------------------------------

      const localePattern = supportedLocales.join("|");

      // Case A: URL contains /{locale}/shops/{slug}[/subpath] → redirect to clean URL
      const fullPrefixMatch = pathname.match(
        new RegExp(`^\\/(${localePattern})\\/shops\\/${slug}(\\/.*)?$`),
      );
      if (fullPrefixMatch) {
        const locale = fullPrefixMatch[1];
        const subPath = fullPrefixMatch[2] || "";
        const cleanPath = `/${locale}${subPath}`;
        const redirectResponse = NextResponse.redirect(
          new URL(cleanPath + searchParams, req.url),
          { status: 301 },
        );
        addSecurityHeaders(redirectResponse);
        return redirectResponse;
      }

      // Case B: URL contains /shops/{slug}[/subpath] (no locale) → redirect to clean URL
      const noPrefixMatch = pathname.match(
        new RegExp(`^\\/shops\\/${slug}(\\/.*)?$`),
      );
      if (noPrefixMatch) {
        const subPath = noPrefixMatch[1] || "";
        const cleanPath = subPath || "/";
        const redirectResponse = NextResponse.redirect(
          new URL(cleanPath + searchParams, req.url),
          { status: 301 },
        );
        addSecurityHeaders(redirectResponse);
        return redirectResponse;
      }

      // User-account pages — bypass the shop rewrite on custom domains
      const isUserAccountPath =
        /^\/(?:(ar|en)\/)?(login|register|confirm-account|banned|forgot-password|change-password|dashboard|shop-preview|premium-completed)(\/.*)?$/.test(
          pathname,
        );
      if (!isUserAccountPath) {
        // Case C: clean URL → internally rewrite to /{locale}/shops/{slug}/subpath
        let targetLocale = defaultLocale;
        let shopSubPath = "";

        const localeAndSubMatch = pathname.match(
          new RegExp(`^\\/(${localePattern})(\\/.*)?$`),
        );
        if (localeAndSubMatch) {
          const detectedLocale = localeAndSubMatch[1];
          const subPath = localeAndSubMatch[2] || "";

          // /ar is the default locale — strip it from the URL (redirect), same as main domain
          if (detectedLocale === defaultLocale) {
            const cleanPath = subPath || "/";
            const arRedirect = NextResponse.redirect(
              new URL(cleanPath + searchParams, req.url),
              { status: 308 },
            );
            addSecurityHeaders(arRedirect);
            return arRedirect;
          }

          targetLocale = detectedLocale;
          shopSubPath = subPath;
        } else if (pathname !== "/") {
          // /subpath without locale — use default locale
          shopSubPath = pathname;
        }

        const rewriteUrl = `/${targetLocale}/shops/${slug}${shopSubPath}${searchParams}`;
        const rewriteResponse = NextResponse.rewrite(
          new URL(rewriteUrl, req.url),
          { request: { headers: requestHeaders } },
        );
        addSecurityHeaders(rewriteResponse);
        return rewriteResponse;
      }
    }
  }

  // For non-API routes, continue with locale and authentication logic
  let locale = pathname.split("/")[1];

  const token = req.cookies.get("token")?.value;

  const pathnameIsMissingLocale = locales.every(
    (locale) =>
      !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`,
  );

  if (pathnameIsMissingLocale) locale = false;

  // Redirect authenticated users from login page
  if (
    (pathname.includes("/login") || pathname.includes("/register")) &&
    token
  ) {
    const response = NextResponse.redirect(
      new URL(`/${locale ? `${locale}/` : ""}dashboard`, req.url),
    );
    addSecurityHeaders(response);
    return response;
  }

  // Only verify user for protected routes
  const reLogin = () => {
    if (process.env.DisableAuth) {
      const response = NextResponse.next();
      addSecurityHeaders(response);
      return response;
    }
    // Redirect to login page if not authenticated
    const response = NextResponse.redirect(
      new URL(
        `/${
          locale ? `${locale}/` : ""
        }login?page=${pathname}&message=unauthorized`,
        req.url,
      ),
    );
    // cookies.delete() ignores domain — use set with maxAge:0 to properly clear
    const isProduction = process.env.NODE_ENV === "production";
    response.cookies.set("token", "", {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 0,
      domain: isProduction ? ".estajer.com" : "",
      path: "/",
    });
    addSecurityHeaders(response);
    return response;
  };

  if (isProtectedRoute(pathname)) {
    if (!token) return reLogin();
    try {
      const userResponse = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/user`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const userData = await userResponse.json();
      if (!userData.user?._id) return reLogin();
      if (
        userData.user.isVerified &&
        pathname === `/${locale ? `${locale}/` : ""}confirm-account`
      ) {
        const response = NextResponse.redirect(
          new URL(`/${locale ? `${locale}/` : ""}`, req.url),
        );
        addSecurityHeaders(response);
        return response;
      }
      if (
        !userData.user.isVerified &&
        pathname !== `/${locale ? `${locale}/` : ""}confirm-account`
      ) {
        const response = NextResponse.redirect(
          new URL(`/${locale ? `${locale}/` : ""}confirm-account`, req.url),
        );
        addSecurityHeaders(response);
        return response;
      }
      if (userData.user.isBanned) {
        const response = NextResponse.redirect(
          new URL(`/${locale ? `${locale}/` : ""}banned`, req.url),
        );
        addSecurityHeaders(response);
        return response;
      }
      if (
        userData.user.isRenter &&
        pathname === `/${locale ? `${locale}/` : ""}dashboard/renter`
      ) {
        const response = NextResponse.redirect(
          new URL(`/${locale ? `${locale}/` : ""}dashboard/`, req.url),
        );
        addSecurityHeaders(response);
        return response;
      }
      if (
        !userData.user.isRenter &&
        pathname === `/${locale ? `${locale}/` : ""}dashboard`
      ) {
        const response = NextResponse.redirect(
          new URL(`/${locale ? `${locale}/` : ""}dashboard/renter`, req.url),
        );
        addSecurityHeaders(response);
        return response;
      }
      if (pathname.includes("/dashboard/visits") && !userData.user.premium) {
        const response = NextResponse.redirect(
          new URL(`/${locale ? `${locale}/` : ""}dashboard`, req.url),
        );
        addSecurityHeaders(response);
        return response;
      }
    } catch (error) {
      return reLogin();
    }
  }

  // Only verify admin for admin routes
  if (isAdminRoute(pathname)) {
    if (!token) return reLogin();
    try {
      const userResponse = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/user`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const userData = await userResponse.json();
      if (!userData.user?._id || userData.user?.accountType !== "admin") {
        const response = NextResponse.redirect(new URL("/", req.url));
        addSecurityHeaders(response);
        return response;
      }
    } catch (error) {
      return reLogin();
    }
  }

  // Restrict /banned page to only banned users
  if (isBannedRoute(pathname)) {
    if (!token) {
      // No token - redirect to home
      const response = NextResponse.redirect(
        new URL(`/${locale ? `${locale}/` : ""}`, req.url),
      );
      addSecurityHeaders(response);
      return response;
    }
    try {
      const userResponse = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/user`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const userData = await userResponse.json();
      if (!userData.user?._id || !userData.user.isBanned) {
        // User not found or not banned - redirect to home
        const response = NextResponse.redirect(
          new URL(`/${locale ? `${locale}/` : ""}`, req.url),
        );
        addSecurityHeaders(response);
        return response;
      }
      // User is banned - allow access
    } catch (error) {
      // Error fetching user - redirect to home
      const response = NextResponse.redirect(
        new URL(`/${locale ? `${locale}/` : ""}`, req.url),
      );
      addSecurityHeaders(response);
      return response;
    }
  }

  // Handle missing locale first
  if (pathnameIsMissingLocale) {
    const response = NextResponse.rewrite(
      new URL(`/ar${pathname}${searchParams}`, req.url),
      { request: { headers: requestHeaders } },
    );
    addSecurityHeaders(response);
    return response;
  }

  // Handle Arabic locale redirect
  if (pathname.startsWith(`/ar`)) {
    const newPath = pathname.replace("/ar", pathname !== "/ar" ? "" : "/");
    const response = NextResponse.redirect(
      new URL(`${newPath}${searchParams}`, req.url),
      { status: 308 },
    );
    addSecurityHeaders(response);
    return response;
  }

  // Default response with security headers
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  addSecurityHeaders(response);
  return response;
}

export const config = {
  matcher: [
    // Include API routes for rate limiting, but exclude static files and Next.js internals
    "/((?!_next/static|_next/image|_static|public|fonts|icons|screenshots|og|favicon.ico|svgs|.*sitemap\\.xml|robots\\.txt|sw\\.js|manifest\\.json|openapi\\.json|assets|_vercel|translations|estajer|\\.well-known).*)",
  ],
};
