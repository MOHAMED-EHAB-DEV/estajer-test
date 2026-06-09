"use client";
import { useState, useEffect, Fragment, useMemo } from "react";
import { useDebounce } from "use-debounce";
import {
  Button,
  Chip,
  Input,
  Select,
  SelectItem,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Pagination,
} from "@heroui/react";
import Link from "next/link";
import { format } from "date-fns";
import {
  FaSearch,
  FaEye,
  FaTrash,
  FaExclamationTriangle,
} from "@/components/ui/svgs/AdminIcons";
import Image from "next/image";
import { anyImgUrl } from "@/utils/ImageUrl";
import { CalendarIcon } from "@/components/ui/svgs/icons/CalendarIconSvg";
import { Calendar } from "@/components/ui/calendar";

import { useRouter, useSearchParams } from "next/navigation";

export default function AdminSessionsContainer({
  lang,
  initialData,
  queryParams,
}) {
  const router = useRouter();
  const searchParamsHook = useSearchParams();

  const [loading, setLoading] = useState(false);

  // Local states for inputs (synced to URL later)
  const [filter, setFilter] = useState(queryParams?.search || "");
  const [debouncedFilter] = useDebounce(filter, 500);
  const [journeyFilter, setJourneyFilter] = useState(
    queryParams?.journey || "",
  );
  const [dateFrom, setDateFrom] = useState(queryParams?.dateFrom || "");
  const [dateTo, setDateTo] = useState(queryParams?.dateTo || "");
  const [sizeFilter, setSizeFilter] = useState(queryParams?.size || "");
  const [deviceFilter, setDeviceFilter] = useState(queryParams?.device || "");
  const [browserFilter, setBrowserFilter] = useState(
    queryParams?.browser || "",
  );

  const [expandedGroups, setExpandedGroups] = useState(new Set());
  const [isDeleting, setIsDeleting] = useState(null); // Track session ID being deleted
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [bulkDeleteDate, setBulkDeleteDate] = useState(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const paginatedGroups = initialData?.data || [];
  const pagination = initialData?.pagination || {};
  const page = pagination.page || 1;
  const totalPages = pagination.pages || 1;
  const totalSessions = pagination.totalSessions || 0;
  const uniqueVisitors = pagination.total || 0;
  const withRecordingsCount = pagination.withRecordings || 0;
  const rowsPerPage = pagination.limit || 15;

  const formatSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  useEffect(() => {
    setLoading(false);
  }, [initialData]);

  const fetchSessions = async () => {
    setLoading(true);
    router.refresh();
    setTimeout(() => setLoading(false), 500);
  };

  const handleDeleteSession = async (sessionId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this session? This action cannot be undone.",
      )
    )
      return;

    try {
      setIsDeleting(sessionId);
      const res = await fetch(
        `/api/tracking/sessions/${sessionId}?client=true`,
        {
          method: "DELETE",
        },
      );

      if (res.ok) {
        // Remove session from local state
        setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId));
      } else {
        const error = await res.json();
        alert(error.error || "Failed to delete session");
      }
    } catch (error) {
      console.error("Delete session failed", error);
      alert("An error occurred while deleting the session");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleBulkDelete = async (onClose) => {
    if (!bulkDeleteDate) return alert("Please select a date first.");

    if (
      !window.confirm(
        `Are you sure you want to delete ALL sessions recorded before ${
          bulkDeleteDate instanceof Date
            ? format(bulkDeleteDate, "yyyy-MM-dd")
            : bulkDeleteDate
        }? This action is permanent and cannot be undone.`,
      )
    )
      return;

    try {
      setIsBulkDeleting(true);
      const formattedDate =
        bulkDeleteDate instanceof Date
          ? format(bulkDeleteDate, "yyyy-MM-dd")
          : bulkDeleteDate;
      const res = await fetch(
        `/api/tracking/sessions?beforeDate=${formattedDate}&client=true`,
        {
          method: "DELETE",
        },
      );

      const data = await res.json();
      if (res.ok) {
        alert(data.message || "Bulk deletion successful.");
        fetchSessions(); // Refresh the list
        if (onClose) onClose();
      } else {
        alert(data.error || "Failed to bulk delete sessions.");
      }
    } catch (error) {
      console.error("Bulk delete failed", error);
      alert("An error occurred during bulk deletion.");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const getDeviceType = (userAgent) => {
    if (!userAgent) return { type: "Unknown", icon: "💻" };
    if (/mobile/i.test(userAgent)) return { type: "Mobile", icon: "📱" };
    if (/tablet|ipad/i.test(userAgent)) return { type: "Tablet", icon: "📱" };
    return { type: "Desktop", icon: "💻" };
  };

  const getBrowserType = (userAgent) => {
    if (!userAgent) return "Unknown";
    if (userAgent.includes("Chrome") && !userAgent.includes("Edg"))
      return "Chrome";
    if (userAgent.includes("Safari") && !userAgent.includes("Chrome"))
      return "Safari";
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Edg")) return "Edge";
    return "Other";
  };

  useEffect(() => {
    const params = new URLSearchParams(searchParamsHook.toString());
    let hasChanges = false;

    const currentSearch = params.get("search") || "";
    if (debouncedFilter !== currentSearch) {
      if (debouncedFilter) params.set("search", debouncedFilter);
      else params.delete("search");
      hasChanges = true;
    }

    const currentJourney = params.get("journey") || "";
    if (journeyFilter !== currentJourney) {
      if (journeyFilter) params.set("journey", journeyFilter);
      else params.delete("journey");
      hasChanges = true;
    }

    const currentDateFrom = params.get("dateFrom") || "";
    if (dateFrom !== currentDateFrom) {
      if (dateFrom) params.set("dateFrom", dateFrom);
      else params.delete("dateFrom");
      hasChanges = true;
    }

    const currentDateTo = params.get("dateTo") || "";
    if (dateTo !== currentDateTo) {
      if (dateTo) params.set("dateTo", dateTo);
      else params.delete("dateTo");
      hasChanges = true;
    }

    const currentSize = params.get("size") || "";
    if (sizeFilter !== currentSize) {
      if (sizeFilter) params.set("size", sizeFilter);
      else params.delete("size");
      hasChanges = true;
    }

    const currentDevice = params.get("device") || "";
    if (deviceFilter !== currentDevice) {
      if (deviceFilter) params.set("device", deviceFilter);
      else params.delete("device");
      hasChanges = true;
    }

    const currentBrowser = params.get("browser") || "";
    if (browserFilter !== currentBrowser) {
      if (browserFilter) params.set("browser", browserFilter);
      else params.delete("browser");
      hasChanges = true;
    }

    if (hasChanges) {
      params.delete("page"); // reset client pagination on filter change
      router.push(`?${params.toString()}`);
    }
  }, [
    journeyFilter,
    dateFrom,
    dateTo,
    debouncedFilter,
    sizeFilter,
    deviceFilter,
    browserFilter,
  ]);

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParamsHook.toString());
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  const presetJourneys = [
    { label: "All Sessions", value: "" },
    { label: "Product → Cart", value: "/product,/cart" },
    { label: "Search → Product", value: "/search,/product" },
    { label: "Home → Product", value: "/,/product" },
    { label: "Cart → Checkout", value: "/cart,/checkout" },
  ];

  const presetSizes = [
    { label: "All Sizes", value: "" },
    { label: "Tiny (< 50 KB)", value: "tiny" },
    { label: "Small (50-250 KB)", value: "small" },
    { label: "Medium (250 KB - 1 MB)", value: "medium" },
    { label: "Large (> 1 MB)", value: "large" },
  ];

  const presetDevices = [
    { label: "All Devices", value: "" },
    { label: "Desktop", value: "desktop" },
    { label: "Mobile", value: "mobile" },
    { label: "Tablet", value: "tablet" },
  ];

  const presetBrowsers = [
    { label: "All Browsers", value: "" },
    { label: "Chrome", value: "chrome" },
    { label: "Safari", value: "safari" },
    { label: "Firefox", value: "firefox" },
    { label: "Edge", value: "edge" },
  ];

  const getJourneyDisplay = (journeyPath) => {
    if (!journeyPath || journeyPath.length === 0) return [];
    return journeyPath.slice(0, 4).map((p) => {
      if (p === "/" || p === "/en") return { label: "Home", icon: "🏠" };
      if (p.includes("/product/") || p.includes("/products/"))
        return { label: "Product", icon: "📦" };
      if (p.includes("/cart")) return { label: "Cart", icon: "🛒" };
      if (p.includes("/checkout")) return { label: "Checkout", icon: "💳" };
      if (p.includes("/search")) return { label: "Search", icon: "🔍" };
      return { label: p.split("/").pop() || p, icon: "📄" };
    });
  };

  // Handled entirely by server
  // const uniqueVisitors = new Set(filteredSessions.map((s) => s.visitorId)).size;
  // const withRecordings = filteredSessions.filter((s) => s.hasRecording).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center gap-3">
              <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#f48a42] to-[#f6a66a] flex items-center justify-center text-white text-xl shadow-lg shadow-[#f48a42]/30">
                🎬
              </span>
              User Sessions
            </h1>
            <p className="text-gray-500 mt-2 ms-15">
              Track and analyze visitor behavior
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onPress={onOpen}
              className="bg-white text-red-500 border border-red-100 font-semibold shadow-sm hover:bg-red-50 transition-all"
              startContent={<FaTrash size={16} />}
              size="lg"
            >
              Cleanup
            </Button>
            <Button
              onClick={fetchSessions}
              className="bg-gradient-to-r from-[#f48a42] to-[#f6a66a] text-white font-semibold shadow-lg shadow-[#f48a42]/30 hover:shadow-xl transition-all"
              isLoading={loading}
              size="lg"
            >
              ↻ Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">
                Total Sessions
              </p>
              <p className="text-3xl font-bold text-gray-800 mt-1">
                {totalSessions}
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#f48a42]/10 to-[#f48a42]/20 flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">
                With Recordings
              </p>
              <p className="text-3xl font-bold text-gray-800 mt-1">
                {withRecordingsCount}
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
              <span className="text-2xl">🎥</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">
                Unique Visitors
              </p>
              <p className="text-3xl font-bold text-gray-800 mt-1">
                {uniqueVisitors}
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#f48a42]/10 flex items-center justify-center">
            <FaSearch size={14} className="text-[#f48a42]" />
          </div>
          <h3 className="font-semibold text-gray-700">Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <Input
            placeholder="Search IP, Name, Session/Visitor Id..."
            value={filter}
            onValueChange={setFilter}
            variant="bordered"
            isClearable
            classNames={{
              input: "text-sm",
              inputWrapper:
                "border-gray-200 hover:border-[#f48a42] focus-within:!border-[#f48a42]",
            }}
            startContent={<FaSearch size={14} className="text-gray-400" />}
          />

          <Select
            placeholder="Journey pattern"
            selectedKeys={journeyFilter ? [journeyFilter] : []}
            onSelectionChange={(keys) =>
              setJourneyFilter(Array.from(keys)[0] || "")
            }
            variant="bordered"
            classNames={{
              trigger:
                "border-gray-200 hover:border-[#f48a42] data-[focus=true]:border-[#f48a42]",
            }}
          >
            {presetJourneys.map((journey) => (
              <SelectItem key={journey.value} value={journey.value}>
                {journey.label}
              </SelectItem>
            ))}
          </Select>

          <Select
            placeholder="Device Type"
            selectedKeys={deviceFilter ? [deviceFilter] : []}
            onSelectionChange={(keys) =>
              setDeviceFilter(Array.from(keys)[0] || "")
            }
            variant="bordered"
            classNames={{
              trigger:
                "border-gray-200 hover:border-[#f48a42] data-[focus=true]:border-[#f48a42]",
            }}
          >
            {presetDevices.map((device) => (
              <SelectItem key={device.value} value={device.value}>
                {device.label}
              </SelectItem>
            ))}
          </Select>

          <Select
            placeholder="Browser"
            selectedKeys={browserFilter ? [browserFilter] : []}
            onSelectionChange={(keys) =>
              setBrowserFilter(Array.from(keys)[0] || "")
            }
            variant="bordered"
            classNames={{
              trigger:
                "border-gray-200 hover:border-[#f48a42] data-[focus=true]:border-[#f48a42]",
            }}
          >
            {presetBrowsers.map((browser) => (
              <SelectItem key={browser.value} value={browser.value}>
                {browser.label}
              </SelectItem>
            ))}
          </Select>

          <Select
            placeholder="Recording Size"
            selectedKeys={sizeFilter ? [sizeFilter] : []}
            onSelectionChange={(keys) =>
              setSizeFilter(Array.from(keys)[0] || "")
            }
            variant="bordered"
            classNames={{
              trigger:
                "border-gray-200 hover:border-[#f48a42] data-[focus=true]:border-[#f48a42]",
            }}
          >
            {presetSizes.map((size) => (
              <SelectItem key={size.value} value={size.value}>
                {size.label}
              </SelectItem>
            ))}
          </Select>

          <Input
            type="date"
            label="From"
            labelPlacement="outside"
            value={dateFrom}
            onValueChange={setDateFrom}
            variant="bordered"
            classNames={{
              inputWrapper:
                "border-gray-200 hover:border-[#f48a42] focus-within:!border-[#f48a42]",
            }}
          />

          <Input
            type="date"
            label="To"
            labelPlacement="outside"
            value={dateTo}
            onValueChange={setDateTo}
            variant="bordered"
            classNames={{
              inputWrapper:
                "border-gray-200 hover:border-[#f48a42] focus-within:!border-[#f48a42]",
            }}
          />
        </div>

        {(journeyFilter ||
          dateFrom ||
          dateTo ||
          deviceFilter ||
          browserFilter) && (
          <div className="mt-4 flex gap-2 flex-wrap items-center">
            <span className="text-xs text-gray-500">Active:</span>
            {journeyFilter && (
              <Chip
                size="sm"
                variant="flat"
                className="bg-[#f48a42]/10 text-[#f48a42]"
                onClose={() => setJourneyFilter("")}
              >
                {journeyFilter}
              </Chip>
            )}
            {deviceFilter && (
              <Chip
                size="sm"
                variant="flat"
                className="bg-indigo-50 text-indigo-600"
                onClose={() => setDeviceFilter("")}
              >
                Device:{" "}
                {presetDevices.find((p) => p.value === deviceFilter)?.label}
              </Chip>
            )}
            {browserFilter && (
              <Chip
                size="sm"
                variant="flat"
                className="bg-purple-50 text-purple-600"
                onClose={() => setBrowserFilter("")}
              >
                Browser:{" "}
                {presetBrowsers.find((p) => p.value === browserFilter)?.label}
              </Chip>
            )}
            {(dateFrom || dateTo) && (
              <Chip
                size="sm"
                variant="flat"
                className="bg-blue-50 text-blue-600"
                onClose={() => {
                  setDateFrom("");
                  setDateTo("");
                }}
              >
                Date Range
              </Chip>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Spinner size="lg" color="warning" />
            <p className="text-gray-500 mt-4">Loading sessions...</p>
          </div>
        ) : paginatedGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <span className="text-4xl">📭</span>
            </div>
            <p className="text-gray-600 font-medium">No sessions found</p>
            <p className="text-gray-400 text-sm mt-1">
              Try adjusting your filters
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-start px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Visitor
                    </th>
                    <th className="text-start px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Started
                    </th>
                    <th className="text-start px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Journey
                    </th>
                    <th className="text-start px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Device
                    </th>
                    <th className="text-start px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="text-start px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-center px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginatedGroups.map((group) => {
                    const { visitorId, sessions, latestSession, sessionCount } =
                      group;
                    const isExpanded = expandedGroups.has(visitorId);
                    const userData = latestSession.user;
                    const device = getDeviceType(latestSession.userAgent);

                    return (
                      <Fragment key={visitorId}>
                        {/* Main visitor row */}
                        <tr
                          key={visitorId}
                          className={`group transition-colors ${
                            sessionCount > 1
                              ? "hover:bg-gray-50/50 cursor-pointer"
                              : "hover:bg-gray-50/30"
                          }`}
                          onClick={() => {
                            if (sessionCount <= 1) return;
                            const newExpanded = new Set(expandedGroups);
                            if (isExpanded) {
                              newExpanded.delete(visitorId);
                            } else {
                              newExpanded.add(visitorId);
                            }
                            setExpandedGroups(newExpanded);
                          }}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {/* Expand/Collapse Icon or Spacer */}
                              {sessionCount > 1 ? (
                                <div
                                  className="text-gray-400 transition-transform"
                                  style={{
                                    transform: isExpanded
                                      ? "rotate(90deg)"
                                      : "rotate(0deg)",
                                  }}
                                >
                                  ▶
                                </div>
                              ) : (
                                <div className="w-4" /> // Spacer for alignment
                              )}

                              {userData ? (
                                <>
                                  <div className="min-w-[40px]">
                                    <Image
                                      src={anyImgUrl({
                                        src: userData.avatar,
                                        size: 100,
                                      })}
                                      unoptimized
                                      width={40}
                                      height={40}
                                      className="rounded-xl shadow-sm border border-gray-100"
                                      alt={userData.fullName}
                                    />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-bold text-gray-800 text-sm truncate max-w-[150px]">
                                      {userData.fullName}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate max-w-[150px]">
                                      {userData.email}
                                    </p>
                                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                                      {sessionCount > 1
                                        ? `${sessionCount} sessions`
                                        : latestSession.sessionId}
                                    </p>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f48a42]/20 to-[#f48a42]/10 flex items-center justify-center text-[#f48a42] font-bold text-sm">
                                    {visitorId?.slice(0, 2).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-800 text-sm">
                                      Visitor {visitorId?.slice(0, 8)}
                                    </p>
                                    <p className="text-xs text-gray-400 font-mono">
                                      {sessionCount > 1
                                        ? `${sessionCount} sessions`
                                        : latestSession.sessionId}
                                    </p>
                                  </div>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-gray-800 text-sm">
                                {latestSession.startedAt
                                  ? format(
                                      new Date(latestSession.startedAt),
                                      "MMM dd, yyyy",
                                    )
                                  : "N/A"}
                              </p>
                              <p className="text-xs text-gray-400">
                                {latestSession.startedAt
                                  ? format(
                                      new Date(latestSession.startedAt),
                                      "HH:mm:ss",
                                    )
                                  : ""}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1 flex-wrap">
                              {getJourneyDisplay(latestSession.journeyPath)
                                .length > 0 ? (
                                getJourneyDisplay(
                                  latestSession.journeyPath,
                                ).map((step, i) => (
                                  <div key={i} className="flex items-center">
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 text-xs font-medium text-gray-600">
                                      <span>{step.icon}</span>
                                      <span className="hidden sm:inline">
                                        {step.label}
                                      </span>
                                    </span>
                                    {i <
                                      getJourneyDisplay(
                                        latestSession.journeyPath,
                                      ).length -
                                        1 && (
                                      <span className="text-gray-300 mx-1">
                                        →
                                      </span>
                                    )}
                                  </div>
                                ))
                              ) : (
                                <span className="text-xs text-gray-400">
                                  No journey
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{device.icon}</span>
                              <div>
                                <p className="text-sm font-medium text-gray-700">
                                  {device.type}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {latestSession.ipAddress
                                    ? `IP: ${latestSession.ipAddress}`
                                    : "Unknown IP"}
                                </p>
                                <p className="text-[10px] text-gray-400">
                                  {latestSession.screen?.width}×
                                  {latestSession.screen?.height}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-700">
                                {formatSize(
                                  sessionCount > 1
                                    ? sessions.reduce(
                                        (sum, s) => sum + (s.fileSize || 0),
                                        0,
                                      )
                                    : latestSession.fileSize,
                                )}
                              </span>
                              {sessionCount > 1 && (
                                <span className="text-[10px] text-gray-400">
                                  Total for {sessionCount}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {sessions.some((s) => s.hasRecording) ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-xs font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                {sessionCount > 1
                                  ? `${
                                      sessions.filter((s) => s.hasRecording)
                                        .length
                                    } Available`
                                  : "Available"}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-500 text-xs font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                                No Recording
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              {sessionCount > 1 ? (
                                <span className="text-xs text-gray-500">
                                  {isExpanded
                                    ? "Click to collapse"
                                    : "Click to expand"}
                                </span>
                              ) : (
                                <>
                                  <Button
                                    size="sm"
                                    variant="flat"
                                    isIconOnly
                                    className="bg-red-50 text-red-500 hover:bg-red-100 min-w-[32px] w-[32px]"
                                    onPress={() =>
                                      handleDeleteSession(
                                        latestSession.sessionId,
                                      )
                                    }
                                    isLoading={
                                      isDeleting === latestSession.sessionId
                                    }
                                  >
                                    <FaTrash size={14} />
                                  </Button>
                                  <Button
                                    as={Link}
                                    href={`/${lang}/admin/sessions/${latestSession.sessionId}`}
                                    size="sm"
                                    className={`${
                                      latestSession.hasRecording
                                        ? "bg-gradient-to-r from-[#f48a42] to-[#f6a66a] text-white shadow-md shadow-[#f48a42]/20"
                                        : "bg-gray-100 text-gray-400"
                                    }`}
                                    isDisabled={!latestSession.hasRecording}
                                  >
                                    <FaEye size={14} />
                                    View
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* Expanded session rows */}
                        {sessionCount > 1 &&
                          isExpanded &&
                          sessions.map((session, idx) => {
                            const sessionDevice = getDeviceType(
                              session.userAgent,
                            );
                            const sessionJourney = getJourneyDisplay(
                              session.journeyPath,
                            );

                            return (
                              <tr
                                key={session.sessionId}
                                className="bg-gray-50/30 hover:bg-gray-100/50 transition-colors border-l-4 border-[#f48a42]"
                              >
                                <td className="px-6 py-3 pl-16">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-400">
                                      #{idx + 1}
                                    </span>
                                    <div>
                                      <p className="text-xs text-gray-600 font-mono">
                                        {session.sessionId}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-3">
                                  <div>
                                    <p className="text-xs text-gray-700">
                                      {session.startedAt
                                        ? format(
                                            new Date(session.startedAt),
                                            "MMM dd, yyyy",
                                          )
                                        : "N/A"}
                                    </p>
                                    <p className="text-[10px] text-gray-400">
                                      {session.startedAt
                                        ? format(
                                            new Date(session.startedAt),
                                            "HH:mm:ss",
                                          )
                                        : ""}
                                    </p>
                                  </div>
                                </td>
                                <td className="px-6 py-3">
                                  <div className="flex items-center gap-1 flex-wrap">
                                    {sessionJourney.length > 0 ? (
                                      sessionJourney.map((step, i) => (
                                        <div
                                          key={i}
                                          className="flex items-center"
                                        >
                                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-gray-200 text-[10px] font-medium text-gray-600">
                                            <span>{step.icon}</span>
                                            <span className="hidden sm:inline">
                                              {step.label}
                                            </span>
                                          </span>
                                          {i < sessionJourney.length - 1 && (
                                            <span className="text-gray-300 mx-0.5 text-xs">
                                              →
                                            </span>
                                          )}
                                        </div>
                                      ))
                                    ) : (
                                      <span className="text-[10px] text-gray-400">
                                        No journey
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-3">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-sm">
                                      {sessionDevice.icon}
                                    </span>
                                    <div>
                                      <p className="text-xs text-gray-600">
                                        {sessionDevice.type}
                                      </p>
                                      <p className="text-[10px] text-gray-400">
                                        {session.ipAddress
                                          ? `IP: ${session.ipAddress}`
                                          : "Unknown IP"}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-3">
                                  <span className="text-xs text-gray-600 font-medium">
                                    {formatSize(session.fileSize)}
                                  </span>
                                </td>
                                <td className="px-6 py-3">
                                  {session.hasRecording ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-medium">
                                      <span className="w-1 h-1 rounded-full bg-green-500"></span>
                                      Yes
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-200 text-gray-500 text-[10px] font-medium">
                                      No
                                    </span>
                                  )}
                                </td>
                                <td className="px-6 py-3 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <Button
                                      as={Link}
                                      href={`/${lang}/admin/sessions/${session.sessionId}`}
                                      size="sm"
                                      className={`${
                                        session.hasRecording
                                          ? "bg-gradient-to-r from-[#f48a42] to-[#f6a66a] text-white shadow-md shadow-[#f48a42]/20"
                                          : "bg-gray-100 text-gray-400"
                                      }`}
                                      isDisabled={!session.hasRecording}
                                    >
                                      <FaEye size={12} />
                                      View
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="flat"
                                      isIconOnly
                                      className="bg-red-50 text-red-500 hover:bg-red-100 min-w-[28px] w-[28px] h-[28px]"
                                      onPress={() =>
                                        handleDeleteSession(session.sessionId)
                                      }
                                      isLoading={
                                        isDeleting === session.sessionId
                                      }
                                    >
                                      <FaTrash size={12} />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-100 gap-4">
                <p className="text-sm text-gray-500">
                  Showing {(page - 1) * rowsPerPage + 1} to{" "}
                  {Math.min(page * rowsPerPage, uniqueVisitors)} of{" "}
                  {uniqueVisitors} visitors
                </p>
                <Pagination
                  isCompact
                  showControls
                  showShadow
                  color="warning"
                  page={page}
                  total={totalPages}
                  onChange={handlePageChange}
                  classNames={{
                    cursor:
                      "bg-gradient-to-r from-[#f48a42] to-[#f6a66a] text-white font-bold",
                  }}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Bulk Delete Modal */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="center"
        classNames={{
          body: "py-4",
          backdrop: "bg-darkNavy/50 backdrop-blur-sm",
          base: "border-none bg-white dark:bg-gray-900 rounded-3xl",
          header: "border-b-[1.5px] border-gray-200 mx-8 p-8",
          footer: "pb-6",
          closeButton: "absolute top-9 left-8 text-3xl",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-600">
                    <FaTrash size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      Cleanup Recordings
                    </h2>
                    <p className="text-sm font-normal text-gray-500">
                      Manage storage by removing old data
                    </p>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody className="py-8">
                <div className="space-y-6">
                  <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl flex gap-4">
                    <div className="text-orange-500 shrink-0 mt-1">
                      <FaExclamationTriangle size={20} />
                    </div>
                    <div className="text-sm text-orange-800 leading-relaxed">
                      <strong>Important:</strong> This action will permanently
                      delete all session recordings and metadata recorded before
                      your selected date. This cannot be undone.
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 ml-1">
                      Delete everything before:
                    </label>
                    <Popover placement="bottom" showArrow={true}>
                      <PopoverTrigger>
                        <div className="flex items-center gap-3 px-4 border-2 border-gray-100 hover:border-[#f48a42] focus-within:!border-[#f48a42] rounded-2xl h-14 cursor-pointer transition-all bg-white shadow-sm">
                          <CalendarIcon className="text-gray-400" size={18} />
                          <span
                            className={
                              bulkDeleteDate ? "text-gray-800" : "text-gray-400"
                            }
                          >
                            {bulkDeleteDate
                              ? format(new Date(bulkDeleteDate), "PPPP")
                              : "Select a date"}
                          </span>
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="p-0 border-none bg-transparent shadow-none">
                        <Calendar
                          mode="single"
                          selected={
                            bulkDeleteDate
                              ? new Date(bulkDeleteDate)
                              : undefined
                          }
                          onSelect={setBulkDeleteDate}
                          lang={lang}
                          className="shadow-2xl"
                          disabled={false}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter className="gap-3">
                <Button
                  variant="flat"
                  onPress={onClose}
                  className="font-semibold px-6 rounded-xl hover:bg-gray-100"
                >
                  Cancel
                </Button>
                <Button
                  color="danger"
                  className="font-bold px-8 rounded-xl shadow-lg shadow-red-200"
                  onPress={() => handleBulkDelete(onClose)}
                  isLoading={isBulkDeleting}
                  startContent={!isBulkDeleting && <FaTrash size={18} />}
                >
                  Confirm Deletion
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
