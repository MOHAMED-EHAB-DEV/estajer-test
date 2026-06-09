"use client";
import { useState } from "react";
import { FaTimes } from "@/components/ui/svgs/AdminIcons";
import { toast } from "@/utils/toast";
import ToastMessage from "../../ui/ToastMessage";
import { Calendar } from "@/components/ui/calendar";

const EditOrderDatesModal = ({ order, onClose, onSuccess, translate }) => {
  const [loading, setLoading] = useState(false);

  // Calculate rental duration (number of days)
  const calculateDuration = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    return Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
  };

  const initialDuration = order
    ? calculateDuration(order.startDate, order.endDate)
    : 1;

  const [duration, setDuration] = useState(initialDuration);

  // Initialize date range for Calendar component
  const [dateRange, setDateRange] = useState(
    order
      ? {
          from: new Date(order.startDate),
          to: new Date(order.endDate),
        }
      : {},
  );

  // Handle date range selection from Calendar
  const handleDateSelect = (range) => {
    if (!range || !range.from) {
      setDateRange({});
      setDuration(1);
      return;
    }

    const from = range.from;
    const to = range.to || from;

    setDateRange({ from, to });

    // Calculate and update duration
    const newDuration = calculateDuration(from, to);
    setDuration(newDuration);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!dateRange.from || !dateRange.to) {
      toast.error(ToastMessage("يرجى تحديد تاريخ البداية والنهاية"));
      return;
    }

    if (dateRange.to < dateRange.from) {
      toast.error(ToastMessage("تاريخ النهاية يجب أن يكون بعد تاريخ البداية"));
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/orders/${order._id}?client=true`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateDates",
          startDate: dateRange.from.toISOString(),
          endDate: dateRange.to.toISOString(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(ToastMessage("تم تحديث تواريخ الطلب بنجاح"));
        onSuccess();
      } else {
        toast.error(ToastMessage(data.error || "فشل في تحديث تواريخ الطلب"));
      }
    } catch (error) {
      console.error("Error updating order dates:", error);
      toast.error(ToastMessage("فشل في تحديث تواريخ الطلب"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative mx-auto w-full md:max-w-2xl max-w-lg shadow-2xl rounded-2xl bg-white">
        {/* Header */}
        <div
          className="sticky top-0 bg-gradient-to-r from-[#f48a42] to-[#f48a42] md:p-6 p-4 rounded-t-2xl border-b border-[#f48a42] z-20"
          style={{ background: "linear-gradient(to right, #f48a42, #e67a32)" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="md:w-10 md:h-10 w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="md:w-5 md:h-5 w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold">تعديل تواريخ الطلب</h3>
                <p className="text-orange-100 text-xs md:text-sm">
                  طلب رقم: {order?.contractId}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-orange-200 transition-colors p-2 hover:bg-white hover:bg-opacity-20 rounded-lg"
            >
              <FaTimes className="md:w-5 md:h-5 w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="md:p-6 p-3">
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            {/* Duration Change Warning */}

            {/* Calendar */}
            <div className="flex justify-center">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={handleDateSelect}
                disabled={{}}
                className="rounded-lg border border-gray-200"
              />
            </div>
            {duration !== initialDuration && dateRange.from && dateRange.to && (
              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
                <div className="flex items-center gap-2 text-yellow-800">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="md:w-5 md:h-5 w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                    />
                  </svg>
                  <span className="text-xs md:text-sm font-semibold">
                    تحذير: تم تغيير مدة الإيجار من {initialDuration} أيام إلى{" "}
                    {duration} أيام
                  </span>
                </div>
              </div>
            )}
            {/* Summary */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="text-xs md:text-sm font-semibold text-gray-700 mb-3">
                ملخص التغييرات
              </h4>
              <div className="space-y-2 text-xs md:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">تاريخ البداية:</span>
                  <span className="font-medium">
                    {dateRange.from
                      ? new Date(dateRange.from).toLocaleDateString("ar", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">تاريخ النهاية:</span>
                  <span className="font-medium">
                    {dateRange.to
                      ? new Date(dateRange.to).toLocaleDateString("ar", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "-"}
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                  <span className="text-gray-500">مدة الإيجار:</span>
                  <span className="font-semibold text-[#f48a42]">
                    {duration} أيام
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="md:px-6 md:py-3 px-4 py-2 border-2 border-gray-300 rounded-xl text-xs md:text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 shadow-sm"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={loading}
                className="md:px-8 md:py-3 px-5 py-2 border-2 border-transparent rounded-xl shadow-lg text-xs md:text-sm font-bold text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f48a42] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                style={{
                  background: "linear-gradient(to right, #f48a42, #e67a32)",
                }}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>جاري الحفظ...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="md:w-4 md:h-4 w-3.5 h-3.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                    <span>حفظ التغييرات</span>
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditOrderDatesModal;
