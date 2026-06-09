import { LRUCache } from "lru-cache";

export function rateLimit(options) {
  const tokenCache = new LRUCache({
    max: options.uniqueTokenPerInterval || 500, // Maximum number of tokens to track
    ttl: options.interval || 60000, // Time-to-live (defaults to 1 minute)
  });

  return {
    check: async (request, pathname = null) => {
      // Get IP from request
      const forwarded = request.headers.get("x-forwarded-for")?.split(",");

      const realIp =
        request.headers.get("x-real-ip") ||
        forwarded?.[1] ||
        forwarded?.[0] ||
        "anonymous";

      const ip = realIp.replace("::ffff:", "");

      if (ip === "127.0.0.1" || ip === "::1" || ip === "141.147.136.72")
        return Promise.resolve();
      
      // Create a unique key combining IP and pathname for per-page rate limiting
      const cacheKey = pathname ? `${ip}:${pathname}` : ip;
      
      // Get current count for this IP + pathname combination
      const currentTokenCount = tokenCache.get(cacheKey) || 0;

      // Check if the token count exceeds the limit
      if (currentTokenCount >= options.limit) {
        const error = new Error("Rate limit exceeded, please try again later.");
        error.status = 429;
        throw error;
      }

      // Increment the token count for this specific IP + pathname
      tokenCache.set(cacheKey, currentTokenCount + 1);

      return Promise.resolve();
    },
  };
}
