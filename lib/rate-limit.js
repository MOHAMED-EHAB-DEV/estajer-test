import { LRUCache } from "lru-cache";

export function rateLimit(options) {
  const tokenCache = new LRUCache({
    max: options.uniqueTokenPerInterval || 500,
    ttl: options.interval || 60000,
  });

  return {
    check: async (request, pathname = null) => {
      const forwarded = request.headers.get("x-forwarded-for")?.split(",");

      // Optimized extraction sequence
      const realIp =
        request.headers.get("cf-connecting-ip") || // 1. Cloudflare's direct header
        request.headers.get("x-real-ip") || // 2. Restored Nginx header
        forwarded?.[0] || // 3. Leftmost standard client IP
        "anonymous";

      const ip = realIp.replace("::ffff:", "").trim();

      // Skip rate limiting for localhost or server public IP
      if (ip === "127.0.0.1" || ip === "::1" || ip === "141.147.136.72")
        return Promise.resolve();

      const cacheKey = pathname ? `${ip}:${pathname}` : ip;
      const currentTokenCount = tokenCache.get(cacheKey) || 0;

      if (currentTokenCount >= options.limit) {
        const error = new Error("Rate limit exceeded, please try again later.");
        error.status = 429;
        throw error;
      }

      tokenCache.set(cacheKey, currentTokenCount + 1);

      return Promise.resolve();
    },
  };
}
