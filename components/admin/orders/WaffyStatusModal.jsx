"use client";
import { useState, useEffect } from "react";
import { toast } from "@/utils/toast";
import ToastMessage from "../../ui/ToastMessage";
import { Check } from "@/components/ui/svgs/icons/CheckSvg";
import { CloseFilled } from "@/components/ui/svgs/icons/CloseFilledSvg";
import { FaTimes } from "@/components/ui/svgs/AdminIcons";
import { Modal, ModalContent, ModalBody } from "@heroui/modal";

const WaffyStatusModal = ({ order, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [data, setData] = useState(null);

  // Settlement distribution state
  const [showSettlePanel, setShowSettlePanel] = useState(false);
  const [settleMode, setSettleMode] = useState("fixed"); // "fixed" | "percentage"
  const [platformAmount, setPlatformAmount] = useState("");
  const [customerAmount, setCustomerAmount] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/orders/${order._id}/waffy`);
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      } else {
        toast.error(ToastMessage(result.error));
      }
    } catch (error) {
      toast.error(ToastMessage("Failed to fetch Waffy status"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [order._id]);

  const handleAction = async (action, extraBody = {}) => {
    try {
      if ((!data.hasValidLocation || !data.hasValidIban) && action != "email")
        return toast.error(ToastMessage("الملف غير مكتمل"));

      setActionLoading(true);
      const res = await fetch(`/api/orders/${order._id}/waffy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extraBody }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success(ToastMessage(result.message || "العملية تمت بنجاح"));
        setShowSettlePanel(false);
        setPlatformAmount("");
        setCustomerAmount("");
        fetchData();
        if (onSuccess) onSuccess();
      } else {
        toast.error(ToastMessage(result.error));
      }
    } catch (error) {
      toast.error(ToastMessage("فشلت العملية"));
    } finally {
      setActionLoading(false);
    }
  };

  // Derived settlement values
  const total = order?.totalAmount || 0;

  const parsedPlatform = parseFloat(platformAmount) || 0;
  const parsedCustomer = parseFloat(customerAmount) || 0;

  const derivedOwnerFixed =
    platformAmount !== ""
      ? Math.max(0, +(total - parsedPlatform - parsedCustomer).toFixed(2))
      : null;

  const derivedOwnerPct =
    platformAmount !== ""
      ? Math.max(0, +(100 - parsedPlatform - parsedCustomer).toFixed(2))
      : null;

  const handleSettle = () => {
    // If nothing entered → use default
    if (platformAmount === "" && customerAmount === "") {
      return handleAction("SETTLE_CONTRACT");
    }

    if (settleMode === "fixed") {
      const p = parsedPlatform;
      const c = parsedCustomer;
      const o = +(total - p - c).toFixed(2);
      if (o < 0)
        return toast.error(ToastMessage("المبالغ تتجاوز إجمالي الطلب"));
      if (p < 0 || c < 0)
        return toast.error(ToastMessage("لا يمكن إدخال أرقام سالبة"));
      return handleAction("SETTLE_CONTRACT", {
        customAmounts: { platform: p, owner: o, customer: c },
      });
    } else {
      const pp = parsedPlatform;
      const cp = parsedCustomer;
      const op = +(100 - pp - cp).toFixed(2);
      if (op < 0) return toast.error(ToastMessage("النسب تتجاوز 100%"));
      if (pp < 0 || cp < 0)
        return toast.error(ToastMessage("لا يمكن إدخال أرقام سالبة"));
      const p = +((pp / 100) * total).toFixed(2);
      const o = +((op / 100) * total).toFixed(2);
      const c = +((cp / 100) * total).toFixed(2);
      return handleAction("SETTLE_CONTRACT", {
        customAmounts: { platform: p, owner: o, customer: c },
      });
    }
  };

  const isEmailSentToday = () => {
    if (!data?.lastCashoutEmailSent) return false;
    const sentDate = new Date(data.lastCashoutEmailSent);
    const today = new Date();
    return (
      sentDate.getDate() === today.getDate() &&
      sentDate.getMonth() === today.getMonth() &&
      sentDate.getFullYear() === today.getFullYear()
    );
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      hideCloseButton
      size="xl"
      placement="center"
      classNames={{
        body: "py-6",
        backdrop: "bg-black/60",
        base: "border-none bg-white",
        header: "border-b border-gray-200",
      }}
    >
      <ModalContent className="!p-0 overflow-hidden font-NotoSansArabic">
        <div className="bg-gradient-to-r from-darkNavy to-darkNavy text-white md:p-6 p-4 rounded-t-2xl border-b border-darkNavy">
          <div className="flex items-center justify-between font-NotoSansArabic">
            <div className="flex items-center gap-3">
              <div className="md:w-10 md:h-10 w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center font-bold">
                W
              </div>
              <div className="text-start">
                <h3 className="text-lg md:text-xl font-bold">حالة عقد وافي</h3>
                <p className="text-gray-200 text-xs md:text-sm">
                  طلب رقم: {order?._id}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors p-2 hover:bg-white hover:bg-opacity-20 rounded-lg"
            >
              <FaTimes className="md:w-5 md:h-5 w-4 h-4" />
            </button>
          </div>
        </div>

        <ModalBody className="md:p-6 p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-10 h-10 border-4 border-[#f48a42] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 font-medium font-NotoSansArabic text-sm md:text-base">
                جاري جلب البيانات من وافي...
              </p>
            </div>
          ) : data ? (
            <div className="flex flex-col md:gap-6 gap-4 font-NotoSansArabic text-start">
              <div className="grid grid-cols-2 gap-4 text-start">
                <div
                  className={`md:p-4 p-3 rounded-xl border ${data.hasValidLocation ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
                >
                  <div className="text-[10px] md:text-xs text-gray-500 mb-1">
                    موقع المالك
                  </div>
                  <div className="flex items-center gap-2 font-bold text-xs md:text-sm">
                    {data.hasValidLocation ? (
                      <>
                        <Check className="text-success w-4 h-4" />
                        <span className="text-green-700">متوفر</span>
                      </>
                    ) : (
                      <>
                        <CloseFilled className="w-4 h-4" fill="#F44242" />
                        <span className="text-red-700">غير متوفر</span>
                      </>
                    )}
                  </div>
                </div>
                <div
                  className={`md:p-4 p-3 rounded-xl border ${data.hasValidIban ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
                >
                  <div className="text-[10px] md:text-xs text-gray-500 mb-1">
                    ايبان المالك
                  </div>
                  <div className="flex items-center gap-2 font-bold text-xs md:text-sm">
                    {data.hasValidIban ? (
                      <>
                        <Check className="text-success w-4 h-4" />
                        <span className="text-green-700">متوفر</span>
                      </>
                    ) : (
                      <>
                        <CloseFilled className="w-4 h-4" fill="#F44242" />
                        <span className="text-red-700">غير متوفر</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-[#F9FAFC] md:p-5 p-4 rounded-xl border border-[#EAEEF3]">
                <div className="text-xs md:text-sm text-gray-500 mb-2">
                  الحالة الحالية في وافي:
                </div>
                <div className="text-lg md:text-xl font-bold text-darkNavy inline-block bg-white md:px-4 md:py-2 px-3 py-1.5 rounded-lg shadow-sm border border-gray-100 uppercase">
                  {data.waffyStatus || "غير متاح"}
                </div>
                {order.milestoneId && (
                  <div className="mt-3 text-[10px] md:text-xs text-gray-400">
                    رقم الدفعة: {order.milestoneId}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 pt-2">
                {data.waffyStatus === "PAID" &&
                  ["completed", "received"].includes(data.orderStatus) && (
                    <button
                      className="w-full bg-[#2ECC71] text-white md:py-3.5 py-2.5 rounded-xl md:font-bold font-semibold text-sm md:text-base flex items-center justify-center gap-2 shadow-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                      onClick={() => handleAction("ACCEPT_CONTRACT")}
                      disabled={
                        actionLoading ||
                        !data.hasValidLocation ||
                        !data.hasValidIban
                      }
                    >
                      {actionLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <Check className="md:w-5 md:h-5 w-4 h-4" />
                          <span>قبول العقد</span>
                        </>
                      )}
                    </button>
                  )}

                {(data.waffyStatus === "ACCEPTED" ||
                  data.waffyStatus === "READY_FOR_CASH_OUT") && (
                  <div className="flex flex-col gap-3">
                    {/* Customization panel */}
                    {showSettlePanel && (
                      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 md:p-5 flex flex-col gap-4 shadow-sm">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                          خيارات توزيع مبالغ التسوية
                        </div>

                        {/* Mode toggle */}
                        <div className="flex p-1 bg-slate-200/50 rounded-xl text-xs font-medium">
                          <button
                            type="button"
                            className={`flex-1 py-1.5 rounded-lg transition-all ${
                              settleMode === "fixed"
                                ? "bg-white text-darkNavy shadow-sm font-bold"
                                : "text-gray-500 hover:text-gray-900"
                            }`}
                            onClick={() => {
                              setSettleMode("fixed");
                              setPlatformAmount("");
                              setCustomerAmount("");
                            }}
                          >
                            مبالغ ثابتة (ر.س)
                          </button>
                          <button
                            type="button"
                            className={`flex-1 py-1.5 rounded-lg transition-all ${
                              settleMode === "percentage"
                                ? "bg-white text-darkNavy shadow-sm font-bold"
                                : "text-gray-500 hover:text-gray-900"
                            }`}
                            onClick={() => {
                              setSettleMode("percentage");
                              setPlatformAmount("");
                              setCustomerAmount("");
                            }}
                          >
                            نسب مئوية (%)
                          </button>
                        </div>

                        {/* Total */}
                        <div className="flex justify-between items-center text-xs text-gray-500 bg-white border border-slate-100 rounded-lg px-3 py-2 shadow-xs">
                          <span>إجمالي قيمة الطلب</span>
                          <span className="font-bold text-darkNavy">
                            {total.toLocaleString()} ر.س
                          </span>
                        </div>

                        {/* Inputs */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {/* Platform */}
                          <div className="flex flex-col gap-1">
                            <label className="text-[11px] font-semibold text-gray-500">
                              المنصة (إستاجر)
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                min="0"
                                max={settleMode === "percentage" ? 100 : total}
                                step="0.01"
                                value={platformAmount}
                                onChange={(e) =>
                                  setPlatformAmount(e.target.value)
                                }
                                placeholder={
                                  settleMode === "fixed" ? "0.00" : "0"
                                }
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 pe-10 text-xs text-start focus:outline-none focus:border-[#f48a42] focus:ring-1 focus:ring-[#f48a42] bg-white transition-all"
                              />
                              <span className="absolute end-3 top-1/2 -translate-y-1/2 text-[10px] font-medium text-gray-400">
                                {settleMode === "fixed" ? "ر.س" : "%"}
                              </span>
                            </div>
                          </div>

                          {/* Customer */}
                          <div className="flex flex-col gap-1">
                            <label className="text-[11px] font-semibold text-gray-500">
                              العميل (افتراضي: 0)
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                min="0"
                                max={settleMode === "percentage" ? 100 : total}
                                step="0.01"
                                value={customerAmount}
                                onChange={(e) =>
                                  setCustomerAmount(e.target.value)
                                }
                                placeholder={
                                  settleMode === "fixed" ? "0.00" : "0"
                                }
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 pe-10 text-xs text-start focus:outline-none focus:border-[#f48a42] focus:ring-1 focus:ring-[#f48a42] bg-white transition-all"
                              />
                              <span className="absolute end-3 top-1/2 -translate-y-1/2 text-[10px] font-medium text-gray-400">
                                {settleMode === "fixed" ? "ر.س" : "%"}
                              </span>
                            </div>
                          </div>

                          {/* Owner (auto-calculated) */}
                          <div className="flex flex-col gap-1">
                            <label className="text-[11px] font-semibold text-gray-500">
                              المالك (محسوب)
                            </label>
                            <div className="w-full border border-dashed border-slate-200 bg-slate-100 rounded-lg px-3 py-2 text-xs text-start text-slate-700 flex justify-between items-center h-[36px] transition-all">
                              <span className="font-bold">
                                {platformAmount === ""
                                  ? "—"
                                  : settleMode === "fixed"
                                    ? (derivedOwnerFixed ?? "—")
                                    : (derivedOwnerPct ?? "—")}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                {settleMode === "fixed" ? "ر.س" : "%"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Summary row */}
                        {platformAmount !== "" && (
                          <div className="flex justify-between items-center text-xs text-gray-500 bg-white border border-slate-100 rounded-lg p-2.5 shadow-xs">
                            <span className="flex gap-1.5 items-center">
                              <span className="w-1.5 h-1.5 rounded-full bg-darkNavy"></span>
                              <span>المنصة:</span>
                              <strong className="text-darkNavy font-bold">
                                {settleMode === "fixed"
                                  ? `${parsedPlatform} ر.س`
                                  : `${parsedPlatform}%`}
                              </strong>
                            </span>
                            <span className="flex gap-1.5 items-center">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                              <span>العميل:</span>
                              <strong className="text-darkNavy font-bold">
                                {settleMode === "fixed"
                                  ? `${parsedCustomer} ر.س`
                                  : `${parsedCustomer}%`}
                              </strong>
                            </span>
                            <span className="flex gap-1.5 items-center">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#f48a42]"></span>
                              <span>المالك:</span>
                              <strong className="text-darkNavy font-bold">
                                {settleMode === "fixed"
                                  ? `${derivedOwnerFixed} ر.س`
                                  : `${derivedOwnerPct}%`}
                              </strong>
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    {/* Customize toggle link */}
                    <button
                      type="button"
                      onClick={() =>
                        setShowSettlePanel((v) => {
                          if (v) {
                            setPlatformAmount("");
                            setCustomerAmount("");
                          }
                          return !v;
                        })
                      }
                      disabled={!data.hasValidLocation || !data.hasValidIban}
                      className={`text-xs font-semibold text-gray-500 hover:text-darkNavy flex items-center justify-center gap-1.5 transition-colors mx-auto disabled:opacity-50 ${
                        showSettlePanel ? "my-4" : "mb-3"
                      }`}
                    >
                      <svg
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${showSettlePanel ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                      <span>
                        {showSettlePanel
                          ? "إلغاء التخصيص (استخدام الافتراضي)"
                          : "تخصيص توزيع مبالغ التسوية"}
                      </span>
                    </button>
                    {/* Single main action button */}
                    <button
                      className="w-full bg-[#f48a42] text-white md:py-3.5 py-2.5 rounded-xl md:font-bold font-semibold text-sm md:text-base flex items-center justify-center gap-2 shadow-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                      onClick={handleSettle}
                      disabled={
                        actionLoading ||
                        !data.hasValidLocation ||
                        !data.hasValidIban
                      }
                    >
                      {actionLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <Check className="md:w-5 md:h-5 w-4 h-4" />
                          <span>
                            {platformAmount !== ""
                              ? "تسوية العقد بالتوزيع المحدد"
                              : "تسوية العقد (افتراضي)"}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {(!data.hasValidLocation || !data.hasValidIban) && (
                  <button
                    className="w-full bg-[#EAEEF3] text-darkNavy md:py-3.5 py-2.5 rounded-xl md:font-bold font-semibold text-sm md:text-base flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handleAction("email")}
                    disabled={actionLoading || isEmailSentToday()}
                    title={
                      isEmailSentToday() ? "تم إرسال بريد اليوم بالفعل" : ""
                    }
                  >
                    {actionLoading ? (
                      <div className="w-5 h-5 border-2 border-darkNavy border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <svg
                          className="md:w-5 md:h-5 w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        <span>
                          {isEmailSentToday()
                            ? "تم إرسال البريد اليوم"
                            : "إرسال بريد إلكتروني لطلب النواقص"}
                        </span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {(!data.hasValidLocation || !data.hasValidIban) && (
                <div className="flex flex-col gap-1 items-center">
                  {!data.hasValidLocation && data.hasValidIban && (
                    <p className="text-[10px] md:text-xs text-red-500 font-medium text-center">
                      * يجب توفر موقع المالك للمتابعة (قبول العقد)
                    </p>
                  )}
                  {!data.hasValidIban && data.hasValidLocation && (
                    <p className="text-[10px] md:text-xs text-red-500 font-medium text-center">
                      * يجب توفر ايبان المالك للمتابعة (قبول العقد)
                    </p>
                  )}
                  {!data.hasValidIban && !data.hasValidLocation && (
                    <p className="text-[10px] md:text-xs text-red-500 font-medium text-center">
                      * يجب توفر ايبان المالك و موقع المالك للمتابعة (قبول
                      العقد)
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <p className="text-red-500 font-medium font-NotoSansArabic">
                فشل في تحميل البيانات
              </p>
              <button
                onClick={fetchData}
                className="text-darkNavy underline font-semibold"
              >
                إعادة المحاولة
              </button>
            </div>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default WaffyStatusModal;
