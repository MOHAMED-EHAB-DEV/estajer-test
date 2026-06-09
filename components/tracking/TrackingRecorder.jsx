"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { getSessionId, getVisitorId } from "@/lib/tracking";
import { useUser } from "@/context/UserContext";
let globalSessionInitialized = false;
let globalLastTrackedPath = null;
let globalLastUserId = null;

export default function TrackingRecorder() {
  const { user } = useUser();
  const pathname = usePathname();
  const stopFnRef = useRef(null);
  const eventsRef = useRef([]);
  const sessionIdRef = useRef(null);
  const visitorIdRef = useRef(null);
  const flushIntervalRef = useRef(null);
  const rrwebRef = useRef(null); // Store rrweb instance
  const isFlushing = useRef(false); // Prevent concurrent flushes
  const isStartingRef = useRef(false); // Guard against concurrent/duplicate startup
  const initialFlushTimeoutRef = useRef(null); // Ref to cancel the initial flush timeout on stop

  useEffect(() => {
    // Determine if we should record this page
    const isAdminPage = pathname?.includes("/admin");

    const stopRecording = () => {
      isStartingRef.current = false;
      if (stopFnRef.current) {
        try {
          stopFnRef.current();
        } catch (e) {
          console.error("Error stopping rrweb", e);
        }
        stopFnRef.current = null;
      }
      if (flushIntervalRef.current) {
        clearInterval(flushIntervalRef.current);
        flushIntervalRef.current = null;
      }
      if (initialFlushTimeoutRef.current) {
        clearTimeout(initialFlushTimeoutRef.current);
        initialFlushTimeoutRef.current = null;
      }
    };

    const flushEvents = async () => {
      if (eventsRef.current.length === 0 || !sessionIdRef.current) return;
      // Prevent concurrent flush calls from racing each other
      if (isFlushing.current) return;
      isFlushing.current = true;

      const eventsToSend = [...eventsRef.current];
      eventsRef.current = [];

      try {
        await fetch("/api/tracking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "events",
            sessionId: sessionIdRef.current,
            events: eventsToSend,
          }),
        });
      } catch (err) {
        // eventsRef.current = [...eventsToSend, ...eventsRef.current];
      } finally {
        isFlushing.current = false;
      }
    };

    const startRecording = async () => {
      if (isAdminPage) return;

      // Prevent starting if we are already recording or starting
      if (stopFnRef.current || isStartingRef.current) return;
      isStartingRef.current = true;

      isFlushing.current = false;
      sessionIdRef.current = getSessionId();

      // Set initial tracked path to prevent duplicate pageview send on initial load
      if (!globalLastTrackedPath) {
        globalLastTrackedPath = window.location.pathname;
      }

      // Temporarily mark the user as tracked to prevent the concurrent identity useEffect from firing
      if (!globalSessionInitialized && user) {
        globalLastUserId = user._id;
      }

      // Only await on first load — localStorage read is sync under the hood
      // but the async/await suspends the function on every navigation.
      // On subsequent pages visitorIdRef is already populated, skip the yield.
      if (!visitorIdRef.current) {
        const vid = await getVisitorId();
        if (!isStartingRef.current) return; // Aborted
        visitorIdRef.current = vid;
      }

      // Track page view function
      const trackPageView = (path) => {
        try {
          fetch("/api/tracking", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "pageview",
              sessionId: sessionIdRef.current,
              path,
              timestamp: new Date().toISOString(),
            }),
          })
            .then((res) => res.json())
            .catch(() => {});
        } catch (err) {}
      };

      // Only initialize session once
      if (!globalSessionInitialized) {
        globalSessionInitialized = true;
        if (user) globalLastUserId = user._id;
        try {
          const response = await fetch("/api/tracking", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "init",
              sessionId: sessionIdRef.current,
              visitorId: visitorIdRef.current,
              user: user
                ? {
                    _id: user._id,
                    fullName: user.fullName,
                    avatar: user.avatar,
                    email: user.email,
                    phone: user.phone,
                    accountType: user.accountType,
                  }
                : null,
              metadata: {
                userAgent: navigator.userAgent,
                language: navigator.language,
                screen: {
                  width: window.screen.width,
                  height: window.screen.height,
                },
                referrer: document.referrer,
                startedAt: new Date().toISOString(),
                initialPath: window.location.pathname,
              },
            }),
          });

          if (!isStartingRef.current) return; // Aborted

          // Properly consume the response
          const result = await response.json();
          if (!isStartingRef.current) return; // Aborted
          if (!result.success) {
            console.error("Tracking init failed:", result);
            globalSessionInitialized = false;
          }
        } catch (err) {
          console.error("Tracking init error:", err);
          globalSessionInitialized = false;
        }
      }

      // Guard: only send pageview if path actually changed (prevents remount duplicates)
      if (globalLastTrackedPath !== window.location.pathname) {
        globalLastTrackedPath = window.location.pathname;
        trackPageView(window.location.pathname);
      }

      // Suppression for the annoying CSSStyleSheet SecurityError
      const handleSecurityError = (e) => {
        if (
          e.message?.includes("CSSStyleSheet") ||
          e.message?.includes("security policy")
        ) {
          e.preventDefault();
          e.stopPropagation();
          return true;
        }
      };
      window.addEventListener("error", handleSecurityError, true);

      try {
        // Only dynamically import rrweb if not already loaded.
        // Even a cached dynamic import suspends the function via await,
        // which creates a race window where pagehide can fire before
        // rrweb.record() starts on fast navigations.
        if (!rrwebRef.current) {
          const mod = await import("rrweb");
          if (!isStartingRef.current) return; // Aborted
          // Handle different module formats (ESM/CJS)
          rrwebRef.current = mod.default || mod;
        }
        const rrweb = rrwebRef.current;

        // Verify record function exists
        if (!rrweb || typeof rrweb.record !== "function") {
          console.error("rrweb: record function not found on imported module");
          isStartingRef.current = false;
          return;
        }

        // Core rrweb recording
        try {
          // IMPORTANT: Capture the stop function returned by rrweb.record
          const rrwebStop = rrweb.record({
            emit(event) {
              eventsRef.current.push(event);
            },
            // Optimization options to reduce data size
            sampling: {
              mousemove: 500, // Reduced frequency further
              mouseInteraction: {
                MouseUp: true,
                MouseDown: true,
                Click: true,
                Focus: true,
                Blur: true,
                TouchStart: true,
                TouchEnd: true,
              },
              scroll: 600,
              input: "last",
            },
            slimDOM: true, // Strips out scripts and other unnecessary elements
            recordCanvas: false,
            collectFonts: false,
            inlineStylesheet: false,
            maskAllInputs: false,
            checkoutEveryNms: 60000, // Fresh snapshot every minute
          });

          const handleGlobalClick = (e) => {
            try {
              const target = e.target?.closest?.("button, a");
              if (target) {
                const text = target.innerText || target.ariaLabel || "unnamed";
                rrweb.record.addCustomEvent("click", {
                  tag: target.tagName,
                  text: text.slice(0, 40),
                  id: target.id,
                });
              }
            } catch (e) {}
          };
          window.addEventListener("click", handleGlobalClick, true);

          const originalFetch = window.fetch;
          window.fetch = async (...args) => {
            const url = typeof args[0] === "string" ? args[0] : args[0]?.url;
            if (
              url &&
              (url.includes("/api/products") || url.includes("/api/orders")) &&
              !url.includes("tracking")
            ) {
              const start = Date.now();
              try {
                const response = await originalFetch(...args);
                rrweb.record.addCustomEvent("api_call", {
                  url,
                  status: response.status,
                  duration: Date.now() - start,
                });
                return response;
              } catch (error) {
                return originalFetch(...args);
              }
            }
            return originalFetch(...args);
          };

          // Correctly set the stop function
          stopFnRef.current = () => {
            try {
              if (typeof rrwebStop === "function") rrwebStop();
            } catch (error) {}
            window.removeEventListener("click", handleGlobalClick, true);
            window.removeEventListener("error", handleSecurityError, true);
            window.fetch = originalFetch;
          };

          flushIntervalRef.current = setInterval(flushEvents, 10000); // flush every 10s
          initialFlushTimeoutRef.current = setTimeout(() => {
            initialFlushTimeoutRef.current = null;
            flushEvents();
          }, 100); // Flush the initial FullSnapshot immediately

          isStartingRef.current = false; // Successfully started
        } catch (error) {
          isStartingRef.current = false;
          console.error("rrweb recording failed", error);
        }
      } catch (err) {
        isStartingRef.current = false;
        console.error("rrweb load failed", err);
      }
    };

    // Always stop previous before potentially starting new
    stopRecording();
    if (!isAdminPage) {
      startRecording();
    } else if (
      sessionIdRef.current &&
      pathname &&
      globalLastTrackedPath !== pathname
    ) {
      // Track page view even if not recording (for journey tracking)
      // Guard against duplicate sends on remount using same path guard as non-admin
      globalLastTrackedPath = pathname;
      try {
        fetch("/api/tracking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "pageview",
            sessionId: sessionIdRef.current,
            path: pathname,
            timestamp: new Date().toISOString(),
          }),
        })
          .then((res) => res.json())
          .catch(() => {});
      } catch (err) {}
    }

    return () => {
      // Flush first so events captured so far are sent, then stop the recorder
      flushEvents();
      stopRecording();
    };
  }, [pathname]);

  // Handle user login/identity changes
  useEffect(() => {
    if (user && user._id !== globalLastUserId && sessionIdRef.current) {
      globalLastUserId = user._id;

      const userData = {
        _id: user._id,
        fullName: user.fullName,
        avatar: user.avatar,
        email: user.email,
        phone: user.phone,
        accountType: user.accountType,
      };

      fetch("/api/tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "identity",
          sessionId: sessionIdRef.current,
          user: userData,
          timestamp: new Date().toISOString(),
        }),
      })
        .then((res) => res.json())
        .catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    const handleFlush = () => {
      if (eventsRef.current.length === 0 || !sessionIdRef.current) return;

      const data = JSON.stringify({
        type: "events",
        sessionId: sessionIdRef.current,
        events: eventsRef.current,
      });

      // Clear events after preparing data to avoid duplicate sends
      eventsRef.current = [];

      if (navigator.sendBeacon) {
        const blob = new Blob([data], { type: "application/json" });
        // sendBeacon returns false if the browser rejects the payload
        // (e.g. payload too large). Fall back to keepalive fetch in that case.
        const queued = navigator.sendBeacon("/api/tracking", blob);
        if (!queued) {
          fetch("/api/tracking", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: data,
            keepalive: true,
          }).catch(() => {});
        }
      } else {
        fetch("/api/tracking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: data,
          keepalive: true,
        }).catch(() => {});
      }
    };

    // Use both pagehide and visibilitychange for maximum coverage.
    // pagehide fires on tab/window close; visibilitychange fires when
    // switching tabs. Both are needed — the double-flush race is safe
    // because eventsRef is cleared atomically before sending.
    window.addEventListener("pagehide", handleFlush);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        handleFlush();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pagehide", handleFlush);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return null;
}
