"use client";
import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { sendGTMEvent } from "@next/third-parties/google";

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

  const getFavoritesLocation = () => {
    const path = typeof window !== "undefined" ? window.location.pathname : "";
    if (path.includes("/search/products")) return "search_results";
    if (path.includes("/favorites")) return "favorites_page";
    if (path.includes("/product/")) return "product_page";
    if (path.includes("/dashboard")) return "dashboard";
    return "listing";
  };

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/user");
      const data = await res.json();
      setLoading(false);
      setUser(data.user);
      if (!data.user) {
        const id = localStorage.getItem("visitorId");
        if (id) setVisitorId(id);
      }
      if (data.user) {
        // PERFORMANCE: Defer ALL non-critical operations to after initial render
        // This reduces Total Blocking Time significantly
        setTimeout(() => {
          // Mark user as online (non-critical)
          fetch("/api/auth/user/online", { method: "POST" }).catch(() => {});

          // Fetch favorites in background
          fetchFavorites().catch(() => {});
        }, 100);

        // PERFORMANCE: Defer socket connection even further (3 seconds)
        // Socket is not needed for initial page interaction
        setTimeout(async () => {
          const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || (process.env.NODE_ENV === "production" ? window.location.origin : null);
          if (!socketUrl) return;

          // Dynamically import IO only when the timeout hits
          const { default: io } = await import("socket.io-client");

          const socketConnection = io(socketUrl, {
            path: "/socket/socket.io",
            transports: ["polling", "websocket"],
          });
          setSocket(socketConnection);
          // Add connection event listeners
          socketConnection.on("connect", () => {
            socketConnection.emit("join-user", data.user._id);
          });
          socketConnection.on("reconnect", () =>
            socketConnection.emit("join-user", data.user._id),
          );
          socketConnection.on("connect_error", (error) =>
            console.error("Socket connection error:", error),
          );
        }, 3000); // Delay socket by 3 seconds
      }
      return data.user;
    } catch (error) {
      console.error("Failed to fetch user:", error);
      const id = localStorage.getItem("visitorId");
      if (id) setVisitorId(id);
    }
  };

  const fetchFavorites = async () => {
    try {
      const res = await fetch("/api/favorites");
      const data = await res.json();
      if (data.success) {
        const productIds = data.favorites.map((product) => product._id);
        setFavoriteProducts(productIds);
      }
    } catch (error) {
      console.error("Failed to fetch favorites:", error);
    }
  };

  // Detect product page and extract productId from URL
  const getPageInfo = () => {
    if (typeof window === "undefined") return { page: "/" };
    let pathname = window.location.pathname;
    try {
      pathname = decodeURIComponent(pathname);
    } catch (e) {}
    const productMatch =
      pathname.match(/\/products\/.*_ref_([a-f0-9]{24})/i) ||
      pathname.match(/\/product\/([a-f0-9]{24})/i);

    if (productMatch) return { page: pathname, productId: productMatch[1] };
    return { page: pathname };
  };

  // Fetch visitor count and increment it (non-blocking)
  const fetchVisitorCount = (currentUser) => {
    // Use setTimeout to make this completely non-blocking
    setTimeout(async () => {
      try {
        const { page, productId } = getPageInfo();

        // Build POST body – always include the page
        const body = { page };
        if (productId) {
          body.productId = productId;
          if (currentUser?._id) body.visitorUserId = currentUser._id;
        }

        // Track overall unique daily visit via localStorage gate
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString().split("T")[0];
        const lastVisitDate = localStorage.getItem("lastVisitDate");

        // Always POST (server rate-limits per IP+page), but mark overall visit
        const res = await fetch("/api/visitors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (data?.success && lastVisitDate !== todayStr) {
          localStorage.setItem("lastVisitDate", todayStr);
        }

        if (!visitorId) {
          const res2 = await fetch("/api/visitor");
          const data2 = await res2.json();
          if (data2?.success && data2?.id) {
            setVisitorId(data2.id);
            localStorage.setItem("visitorId", data2.id);
          }
        }
      } catch (error) {
        return;
      }
    }, 1000); // Delay visitor count to not impact initial render
  };

  // Add a product to favorites
  const addToFavorites = async (productId) => {
    try {
      // Optimistically update UI
      setFavoriteProducts((prev) => {
        if (!prev.includes(productId)) return [...prev, productId];
        return prev;
      });

      try {
        console.log(getFavoritesLocation());
        sendGTMEvent({
          event: "add_to_wishlist",
          product_id: productId,
          location: getFavoritesLocation(),
        });
      } catch (_) {}

      // Send request to API
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      const data = await res.json();
      if (!data.success) {
        // Revert if failed
        setFavoriteProducts((prev) => prev.filter((id) => id !== productId));
        console.error("Failed to add to favorites:", data.error);
      }
    } catch (error) {
      // Revert if failed
      setFavoriteProducts((prev) => prev.filter((id) => id !== productId));
      console.error("Error adding to favorites:", error);
    }
  };

  // Remove a product from favorites
  const removeFromFavorites = async (productId) => {
    try {
      // Optimistically update UI
      setFavoriteProducts((prev) => prev.filter((id) => id !== productId));

      try {
        sendGTMEvent({
          event: "remove_from_wishlist",
          product_id: productId,
          location: getFavoritesLocation(),
        });
      } catch (_) {}

      // Send request to API
      const res = await fetch(`/api/favorites?productId=${productId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!data.success) {
        // Revert if failed
        setFavoriteProducts((prev) => [...prev, productId]);
        console.error("Failed to remove from favorites:", data.error);
      }
    } catch (error) {
      // Revert if failed
      setFavoriteProducts((prev) => [...prev, productId]);
      console.error("Error removing from favorites:", error);
    }
  };

  // Toggle favorite status
  const toggleFavorite = (productId) => {
    if (!user) return router.push("/login?message=unauthorized");
    if (favoriteProducts.includes(productId)) removeFromFavorites(productId);
    else addToFavorites(productId);
  };

  useEffect(() => {
    fetchUser().then((currentUser) => {
      fetchVisitorCount(currentUser);
    });
    const handleBeforeUnload = () =>
      fetch("/api/auth/user/offline", { method: "POST", keepalive: true });
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (socket && typeof socket.disconnect === "function")
        socket.disconnect();
    };
  }, [reload]);

  // Track page visits on client-side navigation (Next.js Link / router.push)
  // Skips the very first render since the main useEffect handles that.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    // Small delay so the new page's URL is fully committed
    const timer = setTimeout(() => {
      fetchVisitorCount(user);
    }, 300);
    return () => clearTimeout(timer);
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        loading,
        socket,
        setReload,
        favoriteProducts,
        setFavoriteProducts,
        addToFavorites,
        removeFromFavorites,
        toggleFavorite,
        visitorId,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
