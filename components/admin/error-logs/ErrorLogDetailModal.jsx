"use client";

import { useState } from "react";

const ErrorLogDetailModal = ({ error, onClose, onUpdate, lang }) => {
  const [notes, setNotes] = useState(error.data?.notes || "");
  const [saving, setSaving] = useState(false);

  const formatDate = (date) => {
    return new Date(date).toLocaleString(lang, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const handleSaveNotes = async () => {
    setSaving(true);
    try {
      await fetch(`/api/admin/error-logs/${error.data._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      onUpdate();
    } catch (err) {
      console.error("Error saving notes:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleResolved = async () => {
    try {
      await fetch(`/api/admin/error-logs/${error.data._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolved: !error.data.resolved }),
      });
      onUpdate();
      onClose();
    } catch (err) {
      console.error("Error toggling resolved:", err);
    }
  };

  const [decodedData, setDecodedData] = useState(null);

  const handleDecodeToken = async (token) => {
    try {
      const res = await fetch("/api/admin/debug-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      setDecodedData(data);
    } catch (err) {
      console.error("Error decoding token:", err);
      setDecodedData({ success: false, error: err.message });
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-red-600 to-red-700">
          <h2 className="text-xl font-bold text-white">
            {lang === "ar" ? "تفاصيل الخطأ" : "Error Details"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full ${
                  error.data.resolved
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {error.data.resolved
                  ? lang === "ar"
                    ? "محلول"
                    : "Resolved"
                  : lang === "ar"
                  ? "غير محلول"
                  : "Unresolved"}
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                {error.data.statusCode}
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-bold rounded-full">
                {error.data.method}
              </span>
            </div>
            <button
              onClick={handleToggleResolved}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                error.data.resolved
                  ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                  : "bg-green-100 text-green-700 hover:bg-green-200"
              }`}
            >
              {error.data.resolved
                ? lang === "ar"
                  ? "إعادة الفتح"
                  : "Reopen"
                : lang === "ar"
                ? "تحديد كمحلول"
                : "Mark Resolved"}
            </button>
          </div>

          {/* Error Message */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              {lang === "ar" ? "رسالة الخطأ" : "Error Message"}
            </h3>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium">{error.data.message}</p>
            </div>
          </div>

          {/* Endpoint */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              {lang === "ar" ? "نقطة النهاية" : "Endpoint"}
            </h3>
            <code className="block bg-gray-100 rounded-lg p-3 text-sm font-mono">
              {error.data.endpoint}
            </code>
          </div>

          {/* Times */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                {lang === "ar" ? "وقت الحدوث" : "Occurred At"}
              </h3>
              <p className="text-gray-900">
                {formatDate(error.data.createdAt)}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                {lang === "ar" ? "عدد المرات المتشابهة" : "Similar Occurrences"}
              </h3>
              <p className="text-gray-900 font-bold text-lg">
                {error.similarCount}x
              </p>
            </div>
          </div>

          {/* User Info */}
          {error.data.userId && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                {lang === "ar" ? "المستخدم" : "User"}
              </h3>
              <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                {error.data.userId.avatar && (
                  <img
                    src={error.data.userId.avatar}
                    alt=""
                    className="w-10 h-10 rounded-full"
                  />
                )}
                <div>
                  <p className="font-medium text-gray-900">
                    {error.data.userId.fullName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {error.data.userId.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Request Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {error.data.resourceId && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  {lang === "ar" ? "معرف المورد" : "Resource ID"}
                </h3>
                <code className="text-sm font-mono text-purple-600 bg-purple-50 px-2 py-1 rounded">
                  {error.data.resourceId}
                </code>
              </div>
            )}
            {error.data.userAgent && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  User Agent
                </h3>
                <p className="text-xs text-gray-600 bg-gray-50 rounded-lg p-2 break-all">
                  {error.data.userAgent}
                </p>
              </div>
            )}
            {error.data.ip && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  IP Address
                </h3>
                <p className="text-gray-900 font-mono">{error.data.ip}</p>
              </div>
            )}
          </div>

          {/* User Token */}
          {error.data.userToken && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500">
                  {lang === "ar" ? "رمز المستخدم" : "User Token"}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(error.data.userToken)}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    {lang === "ar" ? "نسخ" : "Copy"}
                  </button>
                  <button
                    onClick={() => handleDecodeToken(error.data.userToken)}
                    className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                  >
                    {lang === "ar" ? "فك التشفير" : "Decode & Check User"}
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 font-mono break-all line-clamp-2 hover:line-clamp-none cursor-pointer">
                {error.data.userToken}
              </p>

              {/* Decoded Token Result */}
              {decodedData && (
                <div className="mt-3 bg-white rounded border border-gray-200 p-3">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-xs font-bold text-gray-700 uppercase">
                      Decoded User Data
                    </h4>
                    <button
                      onClick={() => setDecodedData(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>
                  {decodedData.success ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {decodedData.user.avatar && (
                          <img
                            src={decodedData.user.avatar}
                            className="w-8 h-8 rounded-full"
                          />
                        )}
                        <div>
                          <p className="text-sm font-medium">
                            {decodedData.user.fullName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {decodedData.user.email}
                          </p>
                          <p className="text-xs text-gray-400">
                            ID: {decodedData.user._id}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs mt-2 text-gray-600">
                        <div>Role: {decodedData.user.accountType}</div>
                        <div>
                          Verified: {decodedData.user.isVerified ? "Yes" : "No"}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-red-600 text-xs">
                      <p className="font-medium">Error: {decodedData.error}</p>
                      {decodedData.decoded && (
                        <pre className="mt-2 text-[10px] bg-red-50 p-2 rounded">
                          {JSON.stringify(decodedData.decoded, null, 2)}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Request Body */}
          {error.data.requestBody && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500">
                  {lang === "ar" ? "بيانات الطلب" : "Request Body"}
                </h3>
                <button
                  onClick={() =>
                    copyToClipboard(
                      JSON.stringify(error.data.requestBody, null, 2)
                    )
                  }
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  {lang === "ar" ? "نسخ" : "Copy"}
                </button>
              </div>
              <pre className="bg-gray-900 text-green-400 rounded-lg p-4 text-xs overflow-x-auto max-h-40">
                {JSON.stringify(error.data.requestBody, null, 2)}
              </pre>
            </div>
          )}

          {/* Stack Trace */}
          {error.data.stack && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500">
                  {lang === "ar" ? "تتبع المكدس" : "Stack Trace"}
                </h3>
                <button
                  onClick={() => copyToClipboard(error.data.stack)}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  {lang === "ar" ? "نسخ" : "Copy"}
                </button>
              </div>
              <pre className="bg-gray-900 text-red-400 rounded-lg p-4 text-xs overflow-x-auto max-h-60">
                {error.data.stack}
              </pre>
            </div>
          )}

          {/* Similar Errors */}
          {error.similarErrors && error.similarErrors.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                {lang === "ar" ? "أخطاء مشابهة حديثة" : "Recent Similar Errors"}
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {error.similarErrors.map((similar, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-gray-50 rounded-lg p-3 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded">
                        {similar.method}
                      </span>
                      <code className="text-xs text-gray-600">
                        {similar.endpoint}
                      </code>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(similar.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              {lang === "ar" ? "ملاحظات" : "Notes"}
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                lang === "ar"
                  ? "أضف ملاحظات حول هذا الخطأ..."
                  : "Add notes about this error..."
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
              rows={3}
            />
            <div className="mt-2 flex justify-end">
              <button
                onClick={handleSaveNotes}
                disabled={saving}
                className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50"
              >
                {saving
                  ? lang === "ar"
                    ? "جاري الحفظ..."
                    : "Saving..."
                  : lang === "ar"
                  ? "حفظ الملاحظات"
                  : "Save Notes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorLogDetailModal;
