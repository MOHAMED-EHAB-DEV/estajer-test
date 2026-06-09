"use client";

import { useState } from "react";

const methodColors = {
  GET: "bg-green-100 text-green-700",
  POST: "bg-blue-100 text-blue-700",
  PUT: "bg-yellow-100 text-yellow-700",
  PATCH: "bg-purple-100 text-purple-700",
  DELETE: "bg-red-100 text-red-700",
};

const ErrorLogsGroupedView = ({ data, onMarkResolved, onViewDetail, lang }) => {
  const [expandedEndpoints, setExpandedEndpoints] = useState({});
  const [expandedMethods, setExpandedMethods] = useState({});
  const [selectedErrors, setSelectedErrors] = useState(new Set());

  const toggleEndpoint = (endpoint) => {
    setExpandedEndpoints((prev) => ({
      ...prev,
      [endpoint]: !prev[endpoint],
    }));
  };

  const toggleMethod = (endpoint, method) => {
    const key = `${endpoint}-${method}`;
    setExpandedMethods((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleString(lang, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTimeAgo = (date) => {
    if (!date) return "";
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return lang === "ar" ? "الآن" : "Just now";
    if (minutes < 60)
      return lang === "ar" ? `منذ ${minutes} دقيقة` : `${minutes}m ago`;
    if (hours < 24)
      return lang === "ar" ? `منذ ${hours} ساعة` : `${hours}h ago`;
    return lang === "ar" ? `منذ ${days} يوم` : `${days}d ago`;
  };

  // Selection management functions
  const toggleError = (errorMessage) => {
    setSelectedErrors((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(errorMessage)) {
        newSet.delete(errorMessage);
      } else {
        newSet.add(errorMessage);
      }
      return newSet;
    });
  };

  const isGroupSelected = (methodGroup) => {
    if (!methodGroup.errors || methodGroup.errors.length === 0) return false;
    return methodGroup.errors.every((error) =>
      selectedErrors.has(error.message)
    );
  };

  const getGroupErrors = (methodGroup) => {
    if (!methodGroup.errors) return [];
    return methodGroup.errors.map((error) => error.message);
  };

  const toggleGroupSelection = (methodGroup) => {
    const groupErrors = getGroupErrors(methodGroup);
    const allSelected = isGroupSelected(methodGroup);

    setSelectedErrors((prev) => {
      const newSet = new Set(prev);
      if (allSelected) {
        // Deselect all in group
        groupErrors.forEach((msg) => newSet.delete(msg));
      } else {
        // Select all in group
        groupErrors.forEach((msg) => newSet.add(msg));
      }
      return newSet;
    });
  };

  const handleBulkMarkResolved = async (resolved = true) => {
    if (selectedErrors.size === 0) return;

    // Convert Set to Array and mark all selected errors
    const messages = Array.from(selectedErrors);
    await onMarkResolved(messages, resolved);

    // Clear selection after marking
    setSelectedErrors(new Set());
  };

  // Safety check for valid data
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900">
          {lang === "ar" ? "لا توجد أخطاء" : "No Errors Found"}
        </h3>
        <p className="text-gray-500 mt-1">
          {lang === "ar"
            ? "النظام يعمل بشكل سليم"
            : "System is running smoothly"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bulk Action Bar */}
      {selectedErrors.size > 0 && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl shadow-2xl border border-gray-200 px-6 py-4 flex items-center gap-4 z-50 animate-slide-up">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-blue-600">
                {selectedErrors.size}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-700">
              {lang === "ar"
                ? `${selectedErrors.size} خطأ محدد`
                : `${selectedErrors.size} error${
                    selectedErrors.size > 1 ? "s" : ""
                  } selected`}
            </span>
          </div>

          <div className="h-6 w-px bg-gray-200"></div>

          <button
            onClick={() => handleBulkMarkResolved(true)}
            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            {lang === "ar" ? "تحديد كمحلول" : "Mark Resolved"}
          </button>

          <button
            onClick={() => handleBulkMarkResolved(false)}
            className="px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {lang === "ar" ? "إعادة الفتح" : "Reopen"}
          </button>

          <button
            onClick={() => setSelectedErrors(new Set())}
            className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            {lang === "ar" ? "إلغاء التحديد" : "Clear"}
          </button>
        </div>
      )}

      {data.map((endpointGroup, endpointIdx) => {
        // Safety check for valid endpoint group structure
        if (
          !endpointGroup ||
          typeof endpointGroup._id !== "string" ||
          !Array.isArray(endpointGroup.methods)
        ) {
          return null;
        }

        return (
          <div
            key={endpointGroup._id || endpointIdx}
            className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden"
          >
            {/* Endpoint Header */}
            <button
              onClick={() => toggleEndpoint(endpointGroup._id)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-2 h-2 rounded-full ${
                    endpointGroup.methods?.some((m) =>
                      m.errors?.some((e) => !e.resolved)
                    )
                      ? "bg-red-500"
                      : "bg-green-500"
                  }`}
                />
                <code className="text-sm font-mono bg-gray-100 px-3 py-1 rounded-lg">
                  {endpointGroup._id}
                </code>
                <span className="px-2 py-0.5 bg-red-50 text-red-600 text-sm font-medium rounded-full">
                  {(endpointGroup.totalErrors || 0).toLocaleString()}{" "}
                  {lang === "ar" ? "خطأ" : "errors"}
                </span>
              </div>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform ${
                  expandedEndpoints[endpointGroup._id] ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Methods */}
            {expandedEndpoints[endpointGroup._id] && (
              <div className="border-t border-gray-100">
                {endpointGroup.methods.map((methodGroup, methodIdx) => {
                  if (!methodGroup || !methodGroup.method) return null;

                  return (
                    <div
                      key={`${endpointGroup._id}-${methodGroup.method}-${methodIdx}`}
                      className="border-b border-gray-50 last:border-b-0"
                    >
                      {/* Method Header */}
                      <div className="w-full px-6 py-3 flex items-center justify-between bg-gray-25 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          {/* Select All Checkbox */}
                          <label
                            className="flex items-center cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={isGroupSelected(methodGroup)}
                              onChange={() => toggleGroupSelection(methodGroup)}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                            />
                            <span className="ml-2 text-xs text-gray-500">
                              {lang === "ar" ? "تحديد الكل" : "Select All"}
                            </span>
                          </label>

                          <div className="h-4 w-px bg-gray-300"></div>

                          <button
                            onClick={() =>
                              toggleMethod(
                                endpointGroup._id,
                                methodGroup.method
                              )
                            }
                            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                          >
                            <span
                              className={`px-3 py-1 text-xs font-bold rounded-md ${
                                methodColors[methodGroup.method] ||
                                "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {methodGroup.method}
                            </span>
                            <span className="text-sm text-gray-600">
                              {methodGroup.errors?.length || 0}{" "}
                              {lang === "ar" ? "نوع خطأ" : "error types"} •{" "}
                              {methodGroup.totalErrors || 0}{" "}
                              {lang === "ar" ? "إجمالي" : "total"}
                            </span>
                          </button>
                        </div>
                        <svg
                          className={`w-4 h-4 text-gray-400 transition-transform ${
                            expandedMethods[
                              `${endpointGroup._id}-${methodGroup.method}`
                            ]
                              ? "rotate-180"
                              : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>

                      {/* Errors */}
                      {expandedMethods[
                        `${endpointGroup._id}-${methodGroup.method}`
                      ] && (
                        <div className="px-6 py-4 space-y-3 bg-gray-50">
                          {(methodGroup.errors || []).map((error, errorIdx) => {
                            if (!error) return null;

                            return (
                              <div
                                key={error.sampleId || errorIdx}
                                className="bg-white rounded-lg p-4 border border-gray-200 hover:border-red-200 transition-colors"
                              >
                                <div className="flex items-start gap-4">
                                  {/* Checkbox */}
                                  <label
                                    className="flex items-center cursor-pointer pt-1"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={selectedErrors.has(
                                        error.message
                                      )}
                                      onChange={() =>
                                        toggleError(error.message)
                                      }
                                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                                    />
                                  </label>

                                  <div className="flex items-start justify-between gap-4 flex-1 min-w-0">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-2">
                                        <span
                                          className={`px-2 py-0.5 text-xs font-medium rounded ${
                                            error.resolved
                                              ? "bg-green-100 text-green-700"
                                              : "bg-red-100 text-red-700"
                                          }`}
                                        >
                                          {error.resolved
                                            ? lang === "ar"
                                              ? "محلول"
                                              : "Resolved"
                                            : lang === "ar"
                                            ? "نشط"
                                            : "Active"}
                                        </span>
                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                                          {error.statusCode || 500}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                          {formatTimeAgo(error.lastOccurrence)}
                                        </span>
                                      </div>
                                      <p className="text-sm font-medium text-gray-900 break-words">
                                        {error.message || "Unknown error"}
                                      </p>
                                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                        <span>
                                          <strong className="text-red-600">
                                            {error.count || 1}x
                                          </strong>{" "}
                                          {lang === "ar"
                                            ? "مرات"
                                            : "occurrences"}
                                        </span>
                                        <span>
                                          {error.uniqueUsersCount || 0}{" "}
                                          {lang === "ar"
                                            ? "مستخدم متأثر"
                                            : "users affected"}
                                        </span>
                                        <span>
                                          {lang === "ar"
                                            ? "أول ظهور:"
                                            : "First:"}{" "}
                                          {formatDate(error.firstOccurrence)}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() =>
                                          onViewDetail(error.sampleId)
                                        }
                                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                        title={
                                          lang === "ar"
                                            ? "عرض التفاصيل"
                                            : "View Details"
                                        }
                                      >
                                        <svg
                                          className="w-5 h-5"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                          />
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                          />
                                        </svg>
                                      </button>
                                      <button
                                        onClick={() =>
                                          onMarkResolved(
                                            error.message,
                                            !error.resolved
                                          )
                                        }
                                        className={`p-2 rounded-lg transition-colors ${
                                          error.resolved
                                            ? "text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50"
                                            : "text-green-500 hover:text-green-600 hover:bg-green-50"
                                        }`}
                                        title={
                                          error.resolved
                                            ? lang === "ar"
                                              ? "إعادة الفتح"
                                              : "Reopen"
                                            : lang === "ar"
                                            ? "تحديد كمحلول"
                                            : "Mark Resolved"
                                        }
                                      >
                                        <svg
                                          className="w-5 h-5"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                          />
                                        </svg>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ErrorLogsGroupedView;
