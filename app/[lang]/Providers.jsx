"use client";
import { Suspense, useEffect } from "react";
import { UserProvider } from "@/context/UserContext";
import dynamic from "next/dynamic";

// Lazy load TrackingRecorder to defer rrweb loading
const TrackingRecorder = dynamic(
  () => import("@/components/tracking/TrackingRecorder"),
  { ssr: false },
);

const ToastContainer = dynamic(
  () => import("react-toastify").then((mod) => mod.ToastContainer),
  { ssr: false },
);

export default function Providers({ children, dir, lang }) {
  // 2. Import CSS inside a useEffect to keep it out of the critical path
  useEffect(() => {
    import("react-toastify/dist/ReactToastify.css");
  }, []);

  return (
    <UserProvider>
      <Suspense fallback={null}>
        <TrackingRecorder />
        <ToastContainer
          hideProgressBar={false}
          autoClose={2500}
          position="top-center"
          closeOnClick
          pauseOnHover
          newestOnTop
          draggable
          theme={"light"}
          limit={2}
          rtl={dir === "rtl"}
        />
      </Suspense>
      {children}
    </UserProvider>
  );
}
