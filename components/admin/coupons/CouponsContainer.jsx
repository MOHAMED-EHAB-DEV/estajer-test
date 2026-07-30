"use client";
import React, { useState } from "react";
import Button from "../../ui/Button";
import { toast } from "@/utils/toast";
import ToastMessage from "../../ui/ToastMessage";
import { useTranslations } from "@/hooks/useTranslations";
import CustomModal from "@/components/ui/CustomModal";

export default function CouponsContainer({ initialData, translate, lang }) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`admin${key}`);
  const [coupons, setCoupons] = useState(initialData?.coupons || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [code, setCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [trialMonths, setTrialMonths] = useState("");
  const [isActive, setIsActive] = useState(true);

  const generateRandomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleOpenModal = () => {
    setCode(generateRandomCode());
    setIsModalOpen(true);
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!code || !discountPercent) {
      toast.error(ToastMessage(t(".coupons.errorFillRequired")));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          discountPercent,
          usageLimit: usageLimit || null,
          expiresAt: expiresAt || null,
          trialMonths: trialMonths || null,
          isActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create coupon");
      }

      setCoupons((prev) => [data.coupon, ...prev]);
      toast.success(ToastMessage(t(".coupons.successCreate")));
      setIsModalOpen(false);

      // Reset form
      setCode("");
      setDiscountPercent("");
      setUsageLimit("");
      setExpiresAt("");
      setTrialMonths("");
      setIsActive(true);
    } catch (err) {
      toast.error(
        ToastMessage(
          err.message === "coupon_exists"
            ? t(".coupons.errorCouponExists")
            : err.message,
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");

      setCoupons((prev) =>
        prev.map((c) =>
          c._id === id ? { ...c, isActive: data.coupon.isActive } : c,
        ),
      );
      toast.success(ToastMessage(t(".coupons.successUpdate")));
    } catch (err) {
      toast.error(ToastMessage(err.message));
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm(t(".coupons.confirmDelete"))) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete coupon");

      setCoupons((prev) => prev.filter((c) => c._id !== id));
      toast.success(ToastMessage(t(".coupons.successDelete")));
    } catch (err) {
      toast.error(ToastMessage(err.message));
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-slate-800 font-NotoSansArabic">
          {t(".coupons.totalCoupons").replace("{count}", coupons.length)}
        </h2>
        <Button
          onClick={handleOpenModal}
          className="bg-gradient-to-r from-orange-500 to-[#F97316] text-white font-extrabold px-6 py-3 rounded-xl hover:opacity-95 shadow-md shadow-orange-500/10 text-sm"
        >
          {t(".coupons.addNew")}
        </Button>
      </div>

      {/* Coupons Table / Grid */}
      {coupons.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200/60 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-[#FFF5EC] rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-100">
            <svg
              className="w-8 h-8 text-orange-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
              />
            </svg>
          </div>
          <h3 className="text-slate-800 font-black mb-1">
            {t(".coupons.emptyTitle")}
          </h3>
          <p className="text-neutral-400 text-xs max-w-sm mx-auto leading-relaxed">
            {t(".coupons.emptyDesc")}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-200/60 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-start border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-neutral-200/60 text-slate-400 text-xs font-black uppercase tracking-wider">
                  <th className="px-6 py-4 text-start font-NotoSansArabic">
                    {t(".coupons.code")}
                  </th>
                  <th className="px-6 py-4 text-start font-NotoSansArabic">
                    {t(".coupons.discount")}
                  </th>
                  <th className="px-6 py-4 text-start font-NotoSansArabic">
                    {t(".coupons.trialDuration")}
                  </th>
                  <th className="px-6 py-4 text-start font-NotoSansArabic">
                    {t(".coupons.usage")}
                  </th>
                  <th className="px-6 py-4 text-start font-NotoSansArabic">
                    {t(".coupons.expiryDate")}
                  </th>
                  <th className="px-6 py-4 text-start font-NotoSansArabic">
                    {t(".coupons.status")}
                  </th>
                  <th className="px-6 py-4 text-center font-NotoSansArabic">
                    {t(".coupons.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-sm">
                {coupons.map((coupon) => {
                  const hasExpired =
                    coupon.expiresAt && new Date(coupon.expiresAt) < new Date();
                  const isLimitReached =
                    coupon.usageLimit !== null &&
                    coupon.usageCount >= coupon.usageLimit;

                  return (
                    <tr
                      key={coupon._id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      {/* Code */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono font-black text-slate-800 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
                          {coupon.code}
                        </span>
                      </td>
                      {/* Discount */}
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-800">
                        {coupon.discountPercent}%
                      </td>
                      {/* Trial months */}
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium">
                        {coupon.trialMonths
                          ? t(".coupons.months").replace(
                              "{months}",
                              coupon.trialMonths,
                            )
                          : t(".coupons.fullYear")}
                      </td>
                      {/* Usage */}
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium">
                        <span className="font-bold text-slate-800">
                          {coupon.usageCount}
                        </span>
                        <span className="text-neutral-400"> / </span>
                        <span>
                          {coupon.usageLimit === null
                            ? t(".coupons.unlimited")
                            : coupon.usageLimit}
                        </span>
                      </td>
                      {/* Expiry Date */}
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium">
                        {coupon.expiresAt ? (
                          <span
                            className={
                              hasExpired ? "text-red-500 font-bold" : ""
                            }
                          >
                            {new Date(coupon.expiresAt).toLocaleDateString(
                              lang === "ar" ? "ar-EG" : "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </span>
                        ) : (
                          <span className="text-neutral-400">—</span>
                        )}
                      </td>
                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {hasExpired ? (
                          <span className="text-[10px] font-extrabold text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-100">
                            {t(".coupons.expired")}
                          </span>
                        ) : isLimitReached ? (
                          <span className="text-[10px] font-extrabold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                            {t(".coupons.limitReached")}
                          </span>
                        ) : coupon.isActive ? (
                          <span className="text-[10px] font-extrabold text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-100">
                            {t(".coupons.active")}
                          </span>
                        ) : (
                          <span className="text-[10px] font-extrabold text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-full border border-neutral-200">
                            {t(".coupons.inactive")}
                          </span>
                        )}
                      </td>
                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-center space-x-2 rtl:space-x-reverse">
                        <button
                          onClick={() =>
                            handleToggleActive(coupon._id, coupon.isActive)
                          }
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${
                            coupon.isActive
                              ? "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100/75"
                              : "bg-green-50 text-green-600 border-green-200 hover:bg-green-100/75"
                          }`}
                        >
                          {coupon.isActive
                            ? t(".coupons.deactivate")
                            : t(".coupons.activate")}
                        </button>
                        <button
                          onClick={() => handleDeleteCoupon(coupon._id)}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100/75 transition-colors"
                        >
                          {t(".coupons.delete")}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Modal using CustomModal */}
      <CustomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="md"
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden"
      >
        <div className="p-6 md:p-8 relative overflow-auto">
          {/* Close */}
          <button
            onClick={() => setIsModalOpen(false)}
            className="absolute top-4 end-4 w-8 h-8 rounded-lg flex items-center justify-center bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-slate-800 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <h3 className="text-lg font-black text-slate-800 font-NotoSansArabic mb-2">
            {t(".coupons.createModal.title")}
          </h3>
          <p className="text-neutral-400 text-xs mb-6">
            {t(".coupons.createModal.subtitle")}
          </p>

          <form onSubmit={handleCreateCoupon} className="space-y-4 text-start">
            {/* Code */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 font-NotoSansArabic">
                {t(".coupons.createModal.codeLabel")}
              </label>
              <input
                type="text"
                required
                placeholder="EX: WELCOME100, TRIAL4"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().trim())}
                className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 focus:bg-white transition-colors rounded-xl px-4 py-3 text-sm font-semibold uppercase tracking-wider"
              />
            </div>

            {/* Discount Percent */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 font-NotoSansArabic">
                {t(".coupons.createModal.discountLabel")}
              </label>
              <input
                type="number"
                required
                min="1"
                max="100"
                placeholder="100"
                value={discountPercent}
                onChange={(e) => {
                  const val = e.target.value;
                  setDiscountPercent(val);
                  if (val !== "100") {
                    setTrialMonths("");
                  }
                }}
                className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 focus:bg-white transition-colors rounded-xl px-4 py-3 text-sm font-semibold"
              />
            </div>

            {/* Trial Months */}
            {discountPercent === "100" && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 font-NotoSansArabic">
                  {t(".coupons.createModal.trialLabel")}
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder={t(".coupons.createModal.trialPlaceholder")}
                  value={trialMonths}
                  onChange={(e) => setTrialMonths(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 focus:bg-white transition-colors rounded-xl px-4 py-3 text-sm font-semibold"
                />
                <p className="text-[10px] text-neutral-400 mt-1 font-medium">
                  {t(".coupons.createModal.trialDesc")}
                </p>
              </div>
            )}

            {/* Usage Limit */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 font-NotoSansArabic">
                {t(".coupons.createModal.limitLabel")}
              </label>
              <input
                type="number"
                min="1"
                placeholder="1"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 focus:bg-white transition-colors rounded-xl px-4 py-3 text-sm font-semibold"
              />
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 font-NotoSansArabic">
                {t(".coupons.createModal.expiryLabel")}
              </label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 focus:bg-white transition-colors rounded-xl px-4 py-3 text-sm font-semibold"
              />
            </div>

            {/* Active Toggle */}
            <div className="flex items-center gap-2.5 py-1.5">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4.5 h-4.5 accent-orange-500 rounded cursor-pointer"
              />
              <label
                htmlFor="isActive"
                className="text-xs font-bold text-slate-700 cursor-pointer font-NotoSansArabic"
              >
                {t(".coupons.createModal.activeLabel")}
              </label>
            </div>

            {/* Submit */}
            <div className="pt-4 flex gap-3">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-orange-500 to-[#F97316] text-white font-extrabold py-3.5 rounded-xl hover:opacity-95 text-sm flex items-center justify-center gap-2 shadow-md shadow-orange-500/10"
              >
                {loading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {t(".coupons.createModal.submit")}
              </Button>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors text-sm"
              >
                {t(".coupons.createModal.cancel")}
              </button>
            </div>
          </form>
        </div>
      </CustomModal>
    </div>
  );
}
