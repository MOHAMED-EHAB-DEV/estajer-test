"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ErrorLogsFilters from "./ErrorLogsFilters";
import ErrorLogsGroupedView from "./ErrorLogsGroupedView";
import ErrorLogsFlatView from "./ErrorLogsFlatView";
import ErrorLogDetailModal from "./ErrorLogDetailModal";

const ErrorLogsContainer = ({ initialData, queryParams, lang, translate }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState(queryParams?.viewMode || "grouped");
  const [selectedError, setSelectedError] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchData = useCallback(
    async (params = {}) => {
      setLoading(true);
      try {
        const apiParams = new URLSearchParams();
        apiParams.set("viewMode", params.viewMode || viewMode);

        if (params.endpoint) apiParams.set("endpoint", params.endpoint);
        if (params.method) apiParams.set("method", params.method);
        if (params.statusCode) apiParams.set("statusCode", params.statusCode);
        if (params.resolved !== undefined && params.resolved !== "")
          apiParams.set("resolved", params.resolved);
        if (params.search) apiParams.set("search", params.search);
        if (params.startDate) apiParams.set("startDate", params.startDate);
        if (params.endDate) apiParams.set("endDate", params.endDate);
        if (params.page) apiParams.set("page", params.page);

        const response = await fetch(`/api/admin/error-logs?${apiParams}`);
        const result = await response.json();

        if (result.success) {
          setData(result);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    },
    [viewMode]
  );

  const handleFilterChange = (filters) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    router.push(`?${params.toString()}`, { scroll: false });
    fetchData(filters);
  };

  const handleViewModeChange = (newMode) => {
    setViewMode(newMode);
    handleFilterChange({ ...queryParams, viewMode: newMode });
  };

  const handleMarkResolved = async (messageOrMessages, resolved = true) => {
    try {
      const messages = Array.isArray(messageOrMessages)
        ? messageOrMessages
        : [messageOrMessages];

      const response = await fetch("/api/admin/error-logs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bulkAction: true, messages, resolved }),
      });

      if (response.ok) {
        fetchData(queryParams);
      }
    } catch (error) {
      console.error("Error marking resolved:", error);
    }
  };

  const handleViewDetail = async (errorId) => {
    try {
      const response = await fetch(`/api/admin/error-logs/${errorId}`);
      const result = await response.json();

      if (result.success) {
        setSelectedError(result);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error("Error fetching detail:", error);
    }
  };

  const handleDeleteResolved = async () => {
    if (
      !confirm(
        lang === "ar"
          ? "هل أنت متأكد من حذف جميع الأخطاء المحلولة؟"
          : "Are you sure you want to delete all resolved errors?"
      )
    ) {
      return;
    }

    try {
      const response = await fetch("/api/admin/error-logs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deleteResolved: true }),
      });

      if (response.ok) {
        fetchData(queryParams);
      }
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  return (
    <div>
      {/* Filters */}
      <ErrorLogsFilters
        queryParams={queryParams}
        onFilterChange={handleFilterChange}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        onDeleteResolved={handleDeleteResolved}
        lang={lang}
        statusDistribution={data.statusDistribution}
      />

      {/* Content */}
      <div className="mt-6">
        {loading ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">
              {lang === "ar" ? "جاري التحميل..." : "Loading..."}
            </p>
          </div>
        ) : viewMode === "grouped" ? (
          <ErrorLogsGroupedView
            data={data.data || []}
            onMarkResolved={handleMarkResolved}
            onViewDetail={handleViewDetail}
            lang={lang}
          />
        ) : (
          <ErrorLogsFlatView
            data={data.data || []}
            pagination={data.pagination}
            onMarkResolved={handleMarkResolved}
            onViewDetail={handleViewDetail}
            onPageChange={(page) =>
              handleFilterChange({ ...queryParams, page })
            }
            lang={lang}
          />
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedError && (
        <ErrorLogDetailModal
          error={selectedError}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedError(null);
          }}
          onUpdate={() => fetchData(queryParams)}
          lang={lang}
        />
      )}
    </div>
  );
};

export default ErrorLogsContainer;
