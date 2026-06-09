"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { getSessionId, getVisitorId } from "@/lib/tracking";
import { useUser } from "@/context/UserContext";

export default function TrackingRecorder() {
  const { user } = useUser();
  const pathname = usePathname();
  const stopFnRef = useRef(null);
  const eventsRef = useRef([]);
  const sessionIdRef = useRef(null);
  const visitorIdRef = useRef(null);
  const flushIntervalRef = useRef(null);
  const sessionInitialized = useRef(false);
  const lastUserIdRef = useRef(null);
  const rrwebRef = useRef(null); // Store rrweb instance

  useEffect(() => {
    // Determine if we should record this page
    const isAdminPage = pathname?.includes("/admin");

    const stopRecording = () => {
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
    };

    const flushEvents = async () => {
      if (eventsRef.current.length === 0 || !sessionIdRef.current) return;

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
      }
    };

    const startRecording = async () => {
      if (isAdminPage) return;

      // Prevent starting if we are already recording
      if (stopFnRef.current) return;

      sessionIdRef.current = getSessionId();
      visitorIdRef.current = await getVisitorId();

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
      if (!sessionInitialized.current) {
        if (user) lastUserIdRef.current = user._id;
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

          // Properly consume the response
          const result = await response.json();
          if (!result.success) {
            console.error("Tracking init failed:", result);
          }
          sessionInitialized.current = true;
        } catch (err) {
          console.error("Tracking init error:", err);
        }
      }

      trackPageView(window.location.pathname);

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
        // Dynamically import rrweb only when needed
        if (!rrwebRef.current) {
          const mod = await import("rrweb");
          // Handle different module formats (ESM/CJS)
          rrwebRef.current = mod.default || mod;
        }
        const rrweb = rrwebRef.current;

        // Verify record function exists
        if (!rrweb || typeof rrweb.record !== "function") {
          console.error("rrweb: record function not found on imported module");
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

          flushIntervalRef.current = setInterval(flushEvents, 10000);
        } catch (error) {
          console.error("rrweb recording failed", error);
        }
      } catch (err) {
        console.error("rrweb load failed", err);
      }
    };

    // Always stop previous before potentially starting new
    stopRecording();
    if (!isAdminPage) {
      startRecording();
    } else if (sessionIdRef.current && pathname) {
      // Track page view even if not recording (for journey tracking)
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
      stopRecording();
      flushEvents();
    };
  }, [pathname]);

  // Handle user login/identity changes
  useEffect(() => {
    if (user && user._id !== lastUserIdRef.current && sessionIdRef.current) {
      lastUserIdRef.current = user._id;

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
      if (eventsRef.current.length > 0 && sessionIdRef.current) {
        const data = JSON.stringify({
          type: "events",
          sessionId: sessionIdRef.current,
          events: eventsRef.current,
        });

        // Clear events after preparing data to avoid duplicate sends
        eventsRef.current = [];

        if (navigator.sendBeacon) {
          const blob = new Blob([data], { type: "application/json" });
          navigator.sendBeacon("/api/tracking", blob);
        } else {
          fetch("/api/tracking", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: data,
            keepalive: true,
          }).catch(() => {});
        }
      }
    };

    // Use pagehide and visibilitychange instead of beforeunload/unload
    // as they are more reliable and modern browser friendly
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
