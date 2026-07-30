"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  startTransition,
  useMemo,
  useCallback,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { sendGTMEvent } from "@next/third-parties/google";

// Returns a cancel function — fixes the runWhenIdle timeout-ignored-in-fallback bug
const runWhenIdle = (callback, timeout = 2000) => {
  if (typeof window !== "undefined" && window.requestIdleCallback) {
    const id = window.requestIdleCallback(callback, { timeout });
    return () => window.cancelIdleCallback(id);
  } else {
    const id = setTimeout(callback, timeout); // uses actual timeout, not hardcoded 300
    return () => clearTimeout(id);
  }
};

const UserContext = createContext();

export function UserProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const isFirstRender = useRef(true);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [reload, setReload] = useState(false);
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [visitorId, setVisitorId] = useState("");

  const socketRef = useRef(null);
  const socketIdleRef = useRef(null);
  const visitorIdRef = useRef("");
  const isMounted = useRef(true);
  const favoriteProductsRef = useRef([]);
  const userRef = useRef(null);

  // Sync ref with state to prevent stale closures
  useEffect(() => {
    userRef.current = user;
    if (user) {
      sendGTMEvent({
        event: "user_data_update",
        customer: {
          id: user._id,
          email: user.email,
          phone: user.phone,
          name: user.fullName,
        },
      });
    }
  }, [user]);

  const updateFavoriteProducts = useCallback((newFavorites) => {
    // Handle both array injection and functional state updates
    const updatedFavorites =
      typeof newFavorites === "function"
        ? newFavorites(favoriteProductsRef.current)
        : newFavorites;

    favoriteProductsRef.current = updatedFavorites;
    setFavoriteProducts(updatedFavorites);
  }, []);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const updateVisitorId = useCallback((id) => {
    visitorIdRef.current = id;
    setVisitorId(id);
  }, []);

  const getFavoritesLocation = useCallback(() => {
    const path = typeof window !== "undefined" ? window.location.pathname : "";
    if (path.includes("/search/products")) return "search_results";
    if (path.includes("/favorites")) return "favorites_page";
    if (path.includes("/product/")) return "product_page";
    if (path.includes("/dashboard")) return "dashboard";
    return "listing";
  }, []);

  const getPageInfo = useCallback(() => {
    if (typeof window === "undefined") return { page: "/" };
    let currentPath = window.location.pathname;
    try {
      currentPath = decodeURIComponent(currentPath);
    } catch (e) {}
    const productMatch =
      currentPath.match(/\/products\/.*_ref_([a-f0-9]{24})/i) ||
      currentPath.match(/\/product\/([a-f0-9]{24})/i);
    if (productMatch) return { page: currentPath, productId: productMatch[1] };
    return { page: currentPath };
  }, []);

  const fetchFavorites = useCallback(() => {
    startTransition(async () => {
      try {
        const res = await fetch("/api/favorites");
        const data = await res.json();
        if (data.success) {
          const ids = data.favorites.map((product) => product._id);
          favoriteProductsRef.current = ids;
          setFavoriteProducts(ids);
        }
      } catch (error) {
        console.error("Failed to fetch favorites:", error);
      }
    });
  }, []);

  const fetchVisitorCount = useCallback(
    (currentUser) => {
      const { page, productId } = getPageInfo();

      runWhenIdle(async () => {
        if (!isMounted.current) return;
        try {
          const body = { page };
          if (productId) {
            body.productId = productId;
            if (currentUser?._id) body.visitorUserId = currentUser._id;
          }

          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const todayStr = today.toISOString().split("T")[0];
          const lastVisitDate = localStorage.getItem("lastVisitDate");

          const res = await fetch("/api/visitors", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
          const data = await res.json();
          if (data?.success && lastVisitDate !== todayStr) {
            localStorage.setItem("lastVisitDate", todayStr);
          }

          if (!visitorIdRef.current) {
            const res2 = await fetch("/api/visitor");
            const data2 = await res2.json();
            if (data2?.success && data2?.id) {
              updateVisitorId(data2.id);
              localStorage.setItem("visitorId", data2.id);
            }
          }
        } catch {
          return;
        }
      }, 1000);
    },
    [getPageInfo, updateVisitorId],
  );

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/user");
      const data = await res.json();

      if (!isMounted.current) return;

      // Urgent — must not be deferred
      setLoading(false);
      setUser(data.user);

      if (!data.user) {
        const id = localStorage.getItem("visitorId");
        if (id) updateVisitorId(id);
      }

      if (data.user) {
        fetchFavorites();

        if (socketIdleRef.current) {
          socketIdleRef.current();
          socketIdleRef.current = null;
        }

        socketIdleRef.current = runWhenIdle(async () => {
          socketIdleRef.current = null;

          // Abort if unmounted — fixes ghost socket memory leak on early unmount
          if (!isMounted.current) return;

          // Guard against duplicate connections (rapid reload or Strict Mode)
          if (socketRef.current?.connected) return;

          const socketUrl = "https://estajer.com";
          if (!socketUrl) return;

          const { default: io } = await import("socket.io-client");

          // Re-check after async import in case component unmounted during await
          if (!isMounted.current) return;
          if (socketRef.current?.connected) return;

          const socketConnection = io(socketUrl, {
            path: "/socket/socket.io",
            transports: ["polling", "websocket"],
          });

          socketRef.current = socketConnection;
          startTransition(() => setSocket(socketConnection));

          socketConnection.on("connect", () => {
            socketConnection.emit("join-user", data.user._id);
          });
          socketConnection.on("reconnect", () => {
            socketConnection.emit("join-user", data.user._id);
          });
          socketConnection.on("connect_error", (error) => {
            console.error("Socket connection error:", error);
          });
        }, 3000);
      }

      fetchVisitorCount(data.user ?? null);
      return data.user;
    } catch (error) {
      console.error("Failed to fetch user:", error);
      // Prevents infinite loading state if the auth request fails
      if (!isMounted.current) return;
      setLoading(false);
      const id = localStorage.getItem("visitorId");
      if (id) updateVisitorId(id);
      fetchVisitorCount(null);
    }
  }, [fetchFavorites, fetchVisitorCount, updateVisitorId]);

  const addToFavorites = useCallback(
    async (productId) => {
      try {
        // Use ref for synchronous optimistic update — avoids race on rapid clicks
        if (!favoriteProductsRef.current.includes(productId)) {
          favoriteProductsRef.current = [
            ...favoriteProductsRef.current,
            productId,
          ];
        }
        setFavoriteProducts([...favoriteProductsRef.current]);

        const res = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
        const data = await res.json();
        if (!data.success) {
          favoriteProductsRef.current = favoriteProductsRef.current.filter(
            (id) => id !== productId,
          );
          setFavoriteProducts([...favoriteProductsRef.current]);
          console.error("Failed to add to favorites:", data.error);
        }
      } catch (error) {
        favoriteProductsRef.current = favoriteProductsRef.current.filter(
          (id) => id !== productId,
        );
        setFavoriteProducts([...favoriteProductsRef.current]);
        console.error("Error adding to favorites:", error);
      }
    },
    [getFavoritesLocation],
  );

  const removeFromFavorites = useCallback(
    async (productId) => {
      try {
        // Use ref for synchronous optimistic update — avoids race on rapid clicks
        favoriteProductsRef.current = favoriteProductsRef.current.filter(
          (id) => id !== productId,
        );
        setFavoriteProducts([...favoriteProductsRef.current]);

        const res = await fetch(`/api/favorites?productId=${productId}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (!data.success) {
          favoriteProductsRef.current = [
            ...favoriteProductsRef.current,
            productId,
          ];
          setFavoriteProducts([...favoriteProductsRef.current]);
          console.error("Failed to remove from favorites:", data.error);
        }
      } catch (error) {
        favoriteProductsRef.current = [
          ...favoriteProductsRef.current,
          productId,
        ];
        setFavoriteProducts([...favoriteProductsRef.current]);
        console.error("Error removing from favorites:", error);
      }
    },
    [getFavoritesLocation],
  );

  const toggleFavorite = useCallback(
    (productId) => {
      if (!user) return router.push("/login?message=unauthorized");
      if (favoriteProductsRef.current.includes(productId))
        removeFromFavorites(productId);
      else addToFavorites(productId);
    },
    [user, router, addToFavorites, removeFromFavorites],
  );

  useEffect(() => {
    fetchUser();
    return () => {
      // Cancel any pending socket idle callback before it fires
      if (socketIdleRef.current) {
        socketIdleRef.current();
        socketIdleRef.current = null;
      }
      if (socketRef.current?.disconnect) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [reload, fetchUser]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      fetchVisitorCount(userRef.current);
    }, 300);
    return () => clearTimeout(timer);
  }, [pathname, fetchVisitorCount]);

  const contextValue = useMemo(
    () => ({
      user,
      setUser,
      loading,
      socket,
      setReload,
      favoriteProducts,
      setFavoriteProducts: updateFavoriteProducts,
      addToFavorites,
      removeFromFavorites,
      toggleFavorite,
      visitorId,
    }),
    [
      user,
      loading,
      socket,
      favoriteProducts,
      visitorId,
      addToFavorites,
      removeFromFavorites,
      toggleFavorite,
      updateFavoriteProducts,
    ],
  );

  return <UserContext value={contextValue}>{children}</UserContext>;
}

export const useUser = () => useContext(UserContext);
