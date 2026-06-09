"use client";

import { useState } from "react";

const ErrorLogsFilters = ({
  queryParams,
  onFilterChange,
  viewMode,
  onViewModeChange,
  onDeleteResolved,
  lang,
  statusDistribution,
}) => {
  const [filters, setFilters] = useState({
    search: queryParams?.search || "",
    endpoint: queryParams?.endpoint || "",
    method: queryParams?.method || "",
    statusCode: queryParams?.statusCode || "",
    resolved: queryParams?.resolved || "",
    startDate: queryParams?.startDate || "",
    endDate: queryParams?.endDate || "",
  });

  const handleChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const handleApply = () => {
    onFilterChange({ ...filters, viewMode });
  };

  const handleClear = () => {
    const clearedFilters = {
      search: "",
      endpoint: "",
      method: "",
      statusCode: "",
      resolved: "",
      startDate: "",
      endDate: "",
    };
    setFilters(clearedFilters);
    onFilterChange({ ...clearedFilters, viewMode });
  };

  const methods = ["GET", "POST", "PUT", "PATCH", "DELETE"];

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
      {/* View Mode Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">
            {lang === "ar" ? "طريقة العرض:" : "View Mode:"}
          </span>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange("grouped")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                viewMode === "grouped"
                  ? "bg-white text-red-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {lang === "ar" ? "مجموعة" : "Grouped"}
            </button>
            <button
              onClick={() => onViewModeChange("flat")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                viewMode === "flat"
                  ? "bg-white text-red-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {lang === "ar" ? "قائمة" : "Flat List"}
            </button>
          </div>
        </div>

        <button
          onClick={onDeleteResolved}
          className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
        >
          {lang === "ar" ? "حذف المحلولة" : "Delete Resolved"}
        </button>
      </div>

      {/* Filters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {lang === "ar" ? "بحث" : "Search"}
          </label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleChange("search", e.target.value)}
            placeholder={lang === "ar" ? "رسالة الخطأ..." : "Error message..."}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>

        {/* Endpoint */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {lang === "ar" ? "نقطة النهاية" : "Endpoint"}
          </label>
          <input
            type="text"
            value={filters.endpoint}
            onChange={(e) => handleChange("endpoint", e.target.value)}
            placeholder="/api/..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>

        {/* Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {lang === "ar" ? "الطريقة" : "Method"}
          </label>
          <select
            value={filters.method}
            onChange={(e) => handleChange("method", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="">{lang === "ar" ? "الكل" : "All"}</option>
            {methods.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </div>

        {/* Status Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {lang === "ar" ? "رمز الحالة" : "Status Code"}
          </label>
          <select
            value={filters.statusCode}
            onChange={(e) => handleChange("statusCode", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="">{lang === "ar" ? "الكل" : "All"}</option>
            {statusDistribution?.map((item) => (
              <option key={item._id} value={item._id}>
                {item._id} ({item.count})
              </option>
            ))}
          </select>
        </div>

        {/* Resolved Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {lang === "ar" ? "الحالة" : "Status"}
          </label>
          <select
            value={filters.resolved}
            onChange={(e) => handleChange("resolved", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="">{lang === "ar" ? "الكل" : "All"}</option>
            <option value="false">
              {lang === "ar" ? "غير محلول" : "Unresolved"}
            </option>
            <option value="true">{lang === "ar" ? "محلول" : "Resolved"}</option>
          </select>
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {lang === "ar" ? "من تاريخ" : "From Date"}
          </label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleChange("startDate", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {lang === "ar" ? "إلى تاريخ" : "To Date"}
          </label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleChange("endDate", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-end gap-2">
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
          >
            {lang === "ar" ? "تطبيق" : "Apply"}
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            {lang === "ar" ? "مسح" : "Clear"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorLogsFilters;
