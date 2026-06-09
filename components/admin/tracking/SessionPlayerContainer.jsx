"use client";
import { useState, useEffect, useRef } from "react";
import { Button, Tabs, Tab, Chip } from "@heroui/react";
import { useRouter } from "next/navigation";
import rrwebPlayer from "rrweb-player";
import "rrweb-player/dist/style.css";
import { format } from "date-fns";
import Image from "next/image";
import { anyImgUrl } from "@/utils/ImageUrl";

export default function SessionPlayerContainer({ sessionId, lang }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/tracking/sessions/${sessionId}?client=true`);
        if (!res.ok) throw new Error("Failed to load session");
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  useEffect(() => {
    if (data?.events && containerRef.current && !playerRef.current) {
      // Remove inactive time by compressing large gaps between events.
      // Any gap larger than MAX_GAP_MS is collapsed down to MAX_GAP_MS.
      const MAX_GAP_MS = 2000;
      const sorted = [...data.events].sort((a, b) => a.timestamp - b.timestamp);
      let totalShift = 0;
      const trimmedEvents = sorted.map((event, i) => {
        if (i === 0) return event;
        const gap = sorted[i].timestamp - sorted[i - 1].timestamp;
        if (gap > MAX_GAP_MS) {
          totalShift += gap - MAX_GAP_MS;
        }
        return { ...event, timestamp: event.timestamp - totalShift };
      });

      playerRef.current = new rrwebPlayer({
        target: containerRef.current,
        props: {
          events: trimmedEvents,
          UNSAFE_replayCanvas: false,
          width: containerRef.current.offsetWidth || 1000,
          height: 600,
          speedOption: [1, 1.5, 2, 4, 6],
          showController: true,
          autoPlay: true,
        },
      });
    }

    return () => {};
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col justify-center items-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#f48a42] to-[#f6a66a] flex items-center justify-center text-white text-2xl shadow-lg shadow-[#f48a42]/30 animate-pulse">
          🎬
        </div>
        <p className="mt-4 text-gray-500 font-medium">Loading session...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col justify-center items-center p-6">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <span className="text-4xl">❌</span>
        </div>
        <p className="text-gray-800 font-semibold md:text-lg text-base mb-2">{error}</p>
        <Button
          onClick={() => router.back()}
          className="bg-gradient-to-r from-[#f48a42] to-[#f6a66a] text-white"
        >
          ← Go Back
        </Button>
      </div>
    );
  }

  const { metadata } = data;

  // Extract custom events
  const customEvents = data.events?.filter((e) => e.type === 5) || [];
  const clickEvents = customEvents.filter((e) => e.data?.tag === "click");
  const apiCalls = customEvents.filter((e) => e.data?.tag === "api_call");

  const getJourneyDisplay = (journeyPath) => {
    if (!journeyPath || journeyPath.length === 0) return [];
    return journeyPath.map((p) => {
      if (p === "/" || p === "/en")
        return { label: "Home", icon: "🏠", path: p };
      if (p.includes("/product/") || p.includes("/products/"))
        return { label: "Product", icon: "📦", path: p };
      if (p.includes("/cart")) return { label: "Cart", icon: "🛒", path: p };
      if (p.includes("/checkout"))
        return { label: "Checkout", icon: "💳", path: p };
      if (p.includes("/search"))
        return { label: "Search", icon: "🔍", path: p };
      return { label: p.split("/").pop() || "Page", icon: "📄", path: p };
    });
  };

  const getDeviceInfo = (userAgent) => {
    if (!userAgent) return { type: "Unknown", icon: "💻", browser: "Unknown" };
    let type = "Desktop";
    let icon = "💻";
    if (/mobile/i.test(userAgent)) {
      type = "Mobile";
      icon = "📱";
    }
    if (/tablet|ipad/i.test(userAgent)) {
      type = "Tablet";
      icon = "📱";
    }

    let browser = "Unknown";
    if (/chrome/i.test(userAgent)) browser = "Chrome";
    else if (/firefox/i.test(userAgent)) browser = "Firefox";
    else if (/safari/i.test(userAgent)) browser = "Safari";
    else if (/edge/i.test(userAgent)) browser = "Edge";

    return { type, icon, browser };
  };

  const journey = getJourneyDisplay(metadata.journeyPath);
  const device = getDeviceInfo(metadata.userAgent);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="light"
          onClick={() => router.back()}
          className="mb-4 text-gray-600 hover:text-[#f48a42]"
        >
          ← Back to Sessions
        </Button>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
              <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#f48a42] to-[#f6a66a] flex items-center justify-center text-white text-xl shadow-lg shadow-[#f48a42]/30">
                ▶️
              </span>
              Session Replay
            </h1>
            <p className="text-gray-500 mt-1 ms-15 font-mono text-sm">
              {sessionId}
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-700 shadow-sm">
              🕐 {format(new Date(metadata.startedAt), "MMM dd, yyyy · HH:mm")}
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-700 shadow-sm">
              📄 {metadata.pageViews?.length || 0} pages
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Player Section */}
        <div className="xl:col-span-3 space-y-6">
          {/* Video Player */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-5 py-3 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span className="ms-4 text-gray-400 text-sm font-mono">
                {metadata.initialPath}
              </span>
            </div>
            <div
              ref={containerRef}
              className="rrweb-player-wrapper bg-gradient-to-br from-gray-100 to-gray-200 flex justify-center items-center"
              style={{ minHeight: "500px" }}
            />
          </div>

          {/* Journey Timeline */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[#f48a42]/10 flex items-center justify-center">
                🗺️
              </span>
              User Journey
            </h3>

            <div className="relative">
              {/* Timeline line */}
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-0"></div>

              {/* Journey steps */}
              <div className="flex items-start justify-between gap-2 overflow-x-auto pb-2">
                {journey.map((step, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center min-w-[80px] relative z-10"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl ${
                        i === 0
                          ? "bg-gradient-to-br from-[#f48a42] to-[#f6a66a] text-white shadow-md shadow-[#f48a42]/30"
                          : "bg-white border-2 border-gray-200"
                      } flex items-center justify-center text-lg`}
                    >
                      {step.icon}
                    </div>
                    <p className="mt-2 text-xs font-medium text-gray-700">
                      {step.label}
                    </p>
                    <p
                      className="text-[10px] text-gray-400 truncate max-w-[80px]"
                      title={step.path}
                    >
                      {step.path}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="xl:col-span-1 space-y-4">
          {/* User Info Card (only if logged in) */}
          {metadata.user && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                  👤
                </span>
                User Info
              </h3>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50/50 border border-green-100">
                  <div className="min-w-[40px]">
                    <Image
                      src={anyImgUrl({ src: metadata.user.avatar, size: 100 })}
                      unoptimized
                      width={40}
                      height={40}
                      className="rounded-full shadow-sm"
                      alt={metadata.user.fullName}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">
                      {metadata.user.fullName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {metadata.user.email}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="p-3 rounded-xl bg-gray-50">
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="font-medium text-gray-800">
                      {metadata.user.phone || "Not provided"}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50">
                    <p className="text-xs text-gray-500">Account Type</p>
                    <Chip
                      size="sm"
                      variant="flat"
                      color="success"
                      className="mt-1 capitalize"
                    >
                      {metadata.user.accountType || "User"}
                    </Chip>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Session Info Card */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[#f48a42]/10 flex items-center justify-center">
                📋
              </span>
              Session Info
            </h3>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f48a42]/20 to-[#f48a42]/10 flex items-center justify-center text-[#f48a42] font-bold text-sm">
                  {metadata.visitorId?.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">Visitor ID</p>
                  <p className="font-mono text-sm font-medium text-gray-800 truncate">
                    {metadata.visitorId}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-gray-50">
                  <p className="text-xs text-gray-500">Device</p>
                  <p className="font-medium text-gray-800 flex items-center gap-1">
                    <span>{device.icon}</span> {device.type}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50">
                  <p className="text-xs text-gray-500">Browser</p>
                  <p className="font-medium text-gray-800">{device.browser}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-gray-50">
                  <p className="text-xs text-gray-500">Screen</p>
                  <p className="font-medium text-gray-800">
                    {metadata.screen?.width}×{metadata.screen?.height}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50">
                  <p className="text-xs text-gray-500">Language</p>
                  <p className="font-medium text-gray-800">
                    {metadata.language?.split("-")[0].toUpperCase()}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-gray-50">
                <p className="text-xs text-gray-500">Referrer</p>
                <p
                  className="font-medium text-gray-800 text-sm truncate"
                  title={metadata.referrer}
                >
                  {metadata.referrer || "Direct visit"}
                </p>
              </div>
            </div>
          </div>

          {/* Events Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <Tabs
              aria-label="Events"
              variant="underlined"
              classNames={{
                tabList: "gap-0 w-full px-4 pt-2 border-b border-gray-100",
                cursor: "bg-[#f48a42]",
                tab: "px-4 py-2",
                tabContent: "group-data-[selected=true]:text-[#f48a42]",
              }}
            >
              <Tab
                key="clicks"
                title={
                  <div className="flex items-center gap-2">
                    <span>👆</span>
                    <span>Clicks</span>
                    <span className="px-1.5 py-0.5 rounded-md bg-gray-100 text-[10px] font-semibold">
                      {clickEvents.length}
                    </span>
                  </div>
                }
              >
                <div className="p-4 max-h-60 overflow-y-auto space-y-2">
                  {clickEvents.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">
                      No clicks recorded
                    </p>
                  ) : (
                    clickEvents.slice(0, 20).map((event, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-gray-50 text-sm"
                      >
                        <p className="font-medium text-gray-800 truncate">
                          {event.data.payload?.text || "Click"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {event.data.payload?.tag} ·{" "}
                          {event.data.payload?.id || "no id"}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </Tab>
              <Tab
                key="api"
                title={
                  <div className="flex items-center gap-2">
                    <span>🔗</span>
                    <span>API</span>
                    <span className="px-1.5 py-0.5 rounded-md bg-gray-100 text-[10px] font-semibold">
                      {apiCalls.length}
                    </span>
                  </div>
                }
              >
                <div className="p-4 max-h-60 overflow-y-auto space-y-2">
                  {apiCalls.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">
                      No API calls recorded
                    </p>
                  ) : (
                    apiCalls.slice(0, 20).map((event, i) => {
                      const hasError =
                        event.data.payload?.status >= 400 ||
                        event.data.payload?.error;
                      return (
                        <div
                          key={i}
                          className={`p-3 rounded-xl text-sm ${
                            hasError
                              ? "bg-red-50 border border-red-100"
                              : "bg-green-50 border border-green-100"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium text-gray-800 truncate flex-1">
                              {event.data.payload?.url?.split("/").pop()}
                            </p>
                            <span
                              className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                                hasError
                                  ? "bg-red-500 text-white"
                                  : "bg-green-500 text-white"
                              }`}
                            >
                              {event.data.payload?.status || "ERR"}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {event.data.payload?.method} ·{" "}
                            {event.data.payload?.duration}ms
                          </p>
                          {hasError && event.data.payload?.responseData && (
                            <p className="text-xs text-red-600 mt-2 p-2 bg-red-100 rounded-lg truncate">
                              {JSON.stringify(event.data.payload?.responseData)}
                            </p>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </Tab>
            </Tabs>
          </div>

          {/* Page Views */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                📄
              </span>
              Page Views
              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-xs font-semibold">
                {metadata.pageViews?.length || 0}
              </span>
            </h3>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {metadata.pageViews?.map((view, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-500">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {view.path}
                    </p>
                    <p className="text-xs text-gray-400">
                      {format(new Date(view.timestamp), "HH:mm:ss")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
