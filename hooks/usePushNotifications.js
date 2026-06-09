import ToastMessage from "@/components/ui/ToastMessage";
import { useState, useEffect, useCallback } from "react";
import { toast } from "@/utils/toast";
import { useUser } from "@/context/UserContext";

const urlBase64ToUint8Array = () => {
  const base64String = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!base64String) return new Uint8Array();
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

const usePushNotifications = ({ isApp }) => {
  const { user, loading, visitorId } = useUser();
  const [isSubscribed, setIsSubscribed] = useState(true);
  const [error, setError] = useState(null);

  // --- 1. HANDLE ANDROID TOKEN RECEIVER ---
  useEffect(() => {
    if (isApp) {
      // Define the global function that the Android Kotlin code will call
      window.onAndroidTokenReceived = async (token) => {
        console.log("Android FCM Token received:", token);

        // Format as a "fake" web subscription for your existing backend
        const fakeSubscription = {
          endpoint: `android-fcm:${token}`,
          keys: { p256dh: "none", auth: "none" },
        };

        try {
          const endpoint = user ? "/api/subscribe" : "/api/visitors/subscribe";
          await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subscription: fakeSubscription, visitorId }),
          });
          setIsSubscribed(true);
          localStorage.setItem("hideNotificationsApp", "true");
          toast.success(ToastMessage(t("enabledNotifications")));
        } catch (err) {
          console.error("Failed to save Android token to backend", err);
        }
      };
    }

    return () => {
      if (isApp) delete window.onAndroidTokenReceived;
    };
  }, [isApp, user, visitorId]);

  // --- 2. BROWSER-ONLY SERVICE WORKER LOGIC ---
  useEffect(() => {
    if (
      !isApp &&
      !loading &&
      "serviceWorker" in navigator &&
      "PushManager" in window
    ) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((swReg) => {
          swReg.pushManager.getSubscription().then(async (subscription) => {
            if (subscription) {
              try {
                const endpoint = user
                  ? "/api/users/notifications"
                  : "/api/visitors/notifications";

                const res = await fetch(endpoint, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ subscription, visitorId }),
                });
                const data = await res.json();
                setIsSubscribed(data.subscribed);
                localStorage.setItem("hideNotifications", "true");
              } catch (error) {
                setIsSubscribed(false);
              }
            } else {
              setIsSubscribed(false);
            }
          });
        })
        .catch((error) => {
          console.error("Service Worker Error", error);
          setError(error);
        });
    }
  }, [user, loading, visitorId, isApp]);

  // --- 3. SUBSCRIBE FUNCTION (BRANCHED) ---
  const subscribe = async ({ t }) => {
    try {
      if (isApp) {
        // ANDROID FLOW
        if (window.Android && window.Android.requestNotificationPermission) {
          // This triggers the Kotlin code, which gets the token and calls onAndroidTokenReceived
          window.Android.requestNotificationPermission();
          return null; // The logic continues in window.onAndroidTokenReceived
        } else {
          throw new Error("Android Bridge not found");
        }
      } else {
        // BROWSER FLOW
        const swReg = await navigator.serviceWorker.ready;
        const subscription = await swReg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(),
        });

        const endpoint = user ? "/api/subscribe" : "/api/visitors/subscribe";
        await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subscription, visitorId }),
        });

        setIsSubscribed(true);
        toast.success(ToastMessage(t("enabledNotifications")));
        return null;
      }
    } catch (error) {
      console.error("Subscription error: ", error);
      setError(error);
      return error;
    }
  };

  const disableNotifications = async () => {
    try {
      if (isApp) {
        // For app, we just hide it locally.
        // Real unsubscription happens via Android settings.
        setIsSubscribed(false);
        localStorage.removeItem("hideNotificationsApp");
        localStorage.setItem("hideNotifications", "");
      } else {
        const swReg = await navigator.serviceWorker.ready;
        const subscription = await swReg.pushManager.getSubscription();

        if (subscription) {
          await subscription.unsubscribe();
          const endpoint = user ? "/api/subscribe" : "/api/visitors/subscribe";
          await fetch(endpoint, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              endpoint: subscription.endpoint,
              visitorId,
            }),
          });
          setIsSubscribed(false);
        }
      }
    } catch (error) {
      setError(error);
      return error;
    }
  };

  return { isSubscribed, error, subscribe, disableNotifications };
};

export default usePushNotifications;
