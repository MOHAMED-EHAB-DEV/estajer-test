"use client";

const methodColors = {
  GET: "bg-green-100 text-green-700",
  POST: "bg-blue-100 text-blue-700",
  PUT: "bg-yellow-100 text-yellow-700",
  PATCH: "bg-purple-100 text-purple-700",
  DELETE: "bg-red-100 text-red-700",
};

const ErrorLogsFlatView = ({
  data,
  pagination,
  onMarkResolved,
  onViewDetail,
  onPageChange,
  lang,
}) => {
  const formatTimeAgo = (date) => {
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

  if (!data || data.length === 0) {
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
    <div>
      {/* Error List */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {data.map((error, idx) => (
            <div key={idx} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-red-600 text-white text-sm font-bold rounded-full">
                      {error.count}x
                    </span>
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
                    {error.statusCodes?.map((code) => (
                      <span
                        key={code}
                        className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded"
                      >
                        {code}
                      </span>
                    ))}
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(error.lastOccurrence)}
                    </span>
                  </div>

                  {/* Error Message */}
                  <p className="text-sm font-medium text-gray-900 break-words mb-2">
                    {error.message}
                  </p>

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    {/* Methods */}
                    <div className="flex items-center gap-1">
                      {error.methods?.map((method) => (
                        <span
                          key={method}
                          className={`px-2 py-0.5 font-bold rounded ${methodColors[method]}`}
                        >
                          {method}
                        </span>
                      ))}
                    </div>

                    {/* Endpoints */}
                    <div className="text-gray-500">
                      {error.endpoints?.length > 2 ? (
                        <span>
                          {error.endpoints.slice(0, 2).join(", ")} +
                          {error.endpoints.length - 2}{" "}
                          {lang === "ar" ? "المزيد" : "more"}
                        </span>
                      ) : (
                        <span>{error.endpoints?.join(", ")}</span>
                      )}
                    </div>

                    {/* Users Affected */}
                    <span className="text-gray-500">
                      {error.uniqueUsersCount}{" "}
                      {lang === "ar" ? "مستخدم متأثر" : "users affected"}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => onViewDetail(error.sampleId)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title={lang === "ar" ? "عرض التفاصيل" : "View Details"}
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
                      onMarkResolved(error.message, !error.resolved)
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
          ))}
        </div>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {lang === "ar" ? "السابق" : "Previous"}
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">
            {lang === "ar" ? "صفحة" : "Page"} {pagination.page}{" "}
            {lang === "ar" ? "من" : "of"} {pagination.totalPages}
          </span>
          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {lang === "ar" ? "التالي" : "Next"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ErrorLogsFlatView;
