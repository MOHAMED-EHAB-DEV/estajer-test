"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function MissingTranslationsContainer({ initialData, queryParams, lang }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] = useState(initialData?.data || []);
  const [stats, setStats] = useState(initialData?.stats || {
    totalKeys: 0,
    totalOccurrences: 0,
    unresolvedCount: 0,
    resolvedCount: 0,
  });
  const [pagination, setPagination] = useState(initialData?.pagination || { page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState(queryParams?.search || "");
  const [resolvedFilter, setResolvedFilter] = useState(queryParams?.resolved || "");
  const [sourceFilter, setSourceFilter] = useState(queryParams?.source || "");
  const [langFilter, setLangFilter] = useState(queryParams?.lang || "");
  const [copiedKey, setCopiedKey] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchData = useCallback(
    async (overrideParams = {}) => {
      setLoading(true);
      try {
        const apiParams = new URLSearchParams();
        const activeSearch = overrideParams.search !== undefined ? overrideParams.search : search;
        const activeResolved = overrideParams.resolved !== undefined ? overrideParams.resolved : resolvedFilter;
        const activeSource = overrideParams.source !== undefined ? overrideParams.source : sourceFilter;
        const activeLang = overrideParams.lang !== undefined ? overrideParams.lang : langFilter;
        const activePage = overrideParams.page || pagination.page || 1;

        if (activeSearch) apiParams.set("search", activeSearch);
        if (activeResolved !== "") apiParams.set("resolved", activeResolved);
        if (activeSource) apiParams.set("source", activeSource);
        if (activeLang) apiParams.set("lang", activeLang);
        apiParams.set("page", activePage);

        const response = await fetch(`/api/admin/missing-translations?${apiParams}`);
        const result = await response.json();

        if (result.success) {
          setData(result.data || []);
          setStats(result.stats);
          setPagination(result.pagination);
          setSelectedIds([]);
        }
      } catch (error) {
        console.error("Error fetching missing translations:", error);
      } finally {
        setLoading(false);
      }
    },
    [search, resolvedFilter, sourceFilter, langFilter, pagination.page]
  );

  const handleFilterSubmit = (e) => {
    e?.preventDefault();
    fetchData({ page: 1 });
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === data.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data.map((item) => item._id));
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkToggleResolved = async (resolved) => {
    if (selectedIds.length === 0) return;
    try {
      const response = await fetch("/api/admin/missing-translations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds, resolved }),
      });
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Error bulk updating status:", error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(lang === "ar" ? `هل أنت متأكد من حذف ${selectedIds.length} عنصر؟` : `Are you sure you want to delete ${selectedIds.length} items?`)) return;
    try {
      const response = await fetch("/api/admin/missing-translations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Error bulk deleting:", error);
    }
  };

  const handleToggleResolved = async (id, currentResolved) => {
    try {
      const response = await fetch("/api/admin/missing-translations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [id], resolved: !currentResolved }),
      });
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(lang === "ar" ? "هل أنت متأكد من الحذف؟" : "Are you sure you want to delete this record?")) return;
    try {
      const response = await fetch("/api/admin/missing-translations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [id] }),
      });
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const handleDeleteResolved = async () => {
    if (!confirm(lang === "ar" ? "هل أنت متأكد من حذف جميع العناصر المحلولة؟" : "Are you sure you want to delete all resolved records?")) return;
    try {
      const response = await fetch("/api/admin/missing-translations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deleteResolved: true }),
      });
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Error deleting resolved:", error);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="text-3xl font-extrabold text-gray-900">{stats.totalKeys || 0}</div>
          <div className="text-sm font-medium text-gray-500 mt-1">
            {lang === "ar" ? "إجمالي النصوص المفقودة" : "Total Missing Keys"}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="text-3xl font-extrabold text-blue-600">{stats.totalOccurrences || 0}</div>
          <div className="text-sm font-medium text-gray-500 mt-1">
            {lang === "ar" ? "إجمالي التكرارات" : "Total Occurrences"}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="text-3xl font-extrabold text-amber-600">{stats.unresolvedCount || 0}</div>
          <div className="text-sm font-medium text-gray-500 mt-1">
            {lang === "ar" ? "قيد الانتظار" : "Unresolved"}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="text-3xl font-extrabold text-emerald-600">{stats.resolvedCount || 0}</div>
          <div className="text-sm font-medium text-gray-500 mt-1">
            {lang === "ar" ? "تم الحل" : "Resolved"}
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
        <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              {lang === "ar" ? "بحث عن مفتاح أو صفحة" : "Search Key or Page"}
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={lang === "ar" ? "مثال: home.title أو /products" : "e.g. home.title or /products"}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              {lang === "ar" ? "الحالة" : "Status"}
            </label>
            <select
              value={resolvedFilter}
              onChange={(e) => {
                setResolvedFilter(e.target.value);
                fetchData({ resolved: e.target.value, page: 1 });
              }}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm"
            >
              <option value="">{lang === "ar" ? "الكل" : "All"}</option>
              <option value="false">{lang === "ar" ? "غير محلول" : "Unresolved"}</option>
              <option value="true">{lang === "ar" ? "محلول" : "Resolved"}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              {lang === "ar" ? "المصدر" : "Source"}
            </label>
            <select
              value={sourceFilter}
              onChange={(e) => {
                setSourceFilter(e.target.value);
                fetchData({ source: e.target.value, page: 1 });
              }}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm"
            >
              <option value="">{lang === "ar" ? "الكل" : "All"}</option>
              <option value="client">Client</option>
              <option value="server">Server</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition"
            >
              {lang === "ar" ? "فلترة" : "Filter"}
            </button>
            {stats.resolvedCount > 0 && (
              <button
                type="button"
                onClick={handleDeleteResolved}
                className="bg-red-50 hover:bg-red-100 text-red-600 font-medium px-3 py-2.5 rounded-xl text-xs transition border border-red-200"
                title={lang === "ar" ? "حذف المحلول" : "Delete Resolved"}
              >
                {lang === "ar" ? "حذف المحلول" : "Clear Resolved"}
              </button>
            )}
          </div>
        </form>

        {/* Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 bg-amber-50 p-4 rounded-xl border border-amber-200">
            <span className="text-sm font-semibold text-amber-900">
              {lang === "ar"
                ? `تم تحديد ${selectedIds.length} عنصر`
                : `${selectedIds.length} items selected`}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkToggleResolved(true)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition"
              >
                {lang === "ar" ? "تحديد المحددة كمحلولة" : "Mark Selected as Resolved"}
              </button>
              <button
                onClick={() => handleBulkToggleResolved(false)}
                className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-xs font-semibold rounded-lg transition"
              >
                {lang === "ar" ? "إلغاء تحديد المحددة" : "Mark Selected as Unresolved"}
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition"
              >
                {lang === "ar" ? "حذف المحددة" : "Delete Selected"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600 mx-auto"></div>
            <p className="mt-3 text-sm text-gray-500">{lang === "ar" ? "جاري التحميل..." : "Loading..."}</p>
          </div>
        ) : data.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {lang === "ar" ? "لا توجد ترجمات مفقودة مسجلة" : "No missing translations recorded"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-sm">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={data.length > 0 && selectedIds.length === data.length}
                      onChange={handleToggleSelectAll}
                      className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-4 text-start font-semibold">{lang === "ar" ? "المفتاح" : "Key"}</th>
                  <th className="px-4 py-4 text-start font-semibold">{lang === "ar" ? "الصفحة" : "Target Page"}</th>
                  <th className="px-4 py-4 text-start font-semibold">{lang === "ar" ? "اللغة / المصدر" : "Lang / Source"}</th>
                  <th className="px-4 py-4 text-center font-semibold">{lang === "ar" ? "التكرار" : "Count"}</th>
                  <th className="px-4 py-4 text-start font-semibold">{lang === "ar" ? "آخر ظهور" : "Last Seen"}</th>
                  <th className="px-4 py-4 text-center font-semibold">{lang === "ar" ? "الحالة" : "Status"}</th>
                  <th className="px-4 py-4 text-end font-semibold">{lang === "ar" ? "إجراءات" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.map((item) => {
                  const isSelected = selectedIds.includes(item._id);
                  return (
                    <tr key={item._id} className={`hover:bg-gray-50/80 transition ${isSelected ? "bg-amber-50/40" : ""}`}>
                      <td className="px-4 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(item._id)}
                          className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-4 font-mono font-medium text-gray-900">
                        <div className="flex items-center gap-2">
                          <span className="bg-amber-50 text-amber-900 px-2.5 py-1 rounded-lg border border-amber-200/60 select-all">
                            {item.key}
                          </span>
                          <button
                            onClick={() => copyToClipboard(item.key)}
                            className="text-gray-400 hover:text-amber-600 p-1 transition"
                            title="Copy Key"
                          >
                            {copiedKey === item.key ? (
                              <span className="text-xs text-emerald-600 font-sans font-bold">✓</span>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-gray-600 dir-ltr text-start">
                        <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {item.pageUrl || "/"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className="uppercase text-xs font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-100">
                            {item.lang}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded font-medium ${item.source === "server" ? "bg-purple-50 text-purple-700 border border-purple-100" : "bg-gray-100 text-gray-700"}`}>
                            {item.source}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center justify-center bg-amber-100 text-amber-900 font-bold px-3 py-1 rounded-full text-xs">
                          {item.count}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(item.lastSeen).toLocaleString(lang === "ar" ? "ar-EG" : "en-US")}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                            item.resolved
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : "bg-amber-100 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {item.resolved
                            ? (lang === "ar" ? "محلول" : "Resolved")
                            : (lang === "ar" ? "قيد الانتظار" : "Pending")}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-end">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleResolved(item._id, item.resolved)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
                              item.resolved
                                ? "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
                                : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
                            }`}
                          >
                            {item.resolved
                              ? (lang === "ar" ? "إلغاء التحديد" : "Unmark")
                              : (lang === "ar" ? "تحديد كمحلول" : "Mark Resolved")}
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {lang === "ar"
                ? `صفحة ${pagination.page} من ${pagination.totalPages}`
                : `Page ${pagination.page} of ${pagination.totalPages}`}
            </span>
            <div className="flex gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchData({ page: pagination.page - 1 })}
                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                {lang === "ar" ? "السابق" : "Previous"}
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchData({ page: pagination.page + 1 })}
                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                {lang === "ar" ? "التالي" : "Next"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
