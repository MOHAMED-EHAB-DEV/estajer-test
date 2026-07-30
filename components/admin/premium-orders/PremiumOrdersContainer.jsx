"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useTranslations } from "@/hooks/useTranslations";
import Image from "next/image";

export default function PremiumOrdersContainer({
  initialData,
  translate,
  lang,
}) {
  const trans = useTranslations(translate);
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState("all"); // all | starter | growth
  const [statusFilter, setStatusFilter] = useState("all"); // all | paid | not-paid

  const { groupedOrders = [] } = initialData;

  // Filter grouped orders based on search and selected plan/status filters
  const filteredGroups = groupedOrders.filter((group) => {
    const user = group.user || {};
    const matchesSearch =
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm);

    const matchesPlan =
      planFilter === "all" || group.orders.some((o) => o.plan === planFilter);

    const matchesStatus =
      statusFilter === "all" ||
      group.orders.some((o) => o.status === statusFilter);

    return matchesSearch && matchesPlan && matchesStatus;
  });

  const getPlanBadgeStyle = (plan) => {
    switch (plan) {
      case "growth":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "starter":
        return "bg-sky-50 text-sky-700 border-sky-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "paid":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "not-paid":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getWaffyStatusBadgeStyle = (status) => {
    switch (status?.toUpperCase()) {
      case "PAID":
      case "COMPLETED":
      case "CASH_OUT_APPROVED":
      case "ACCEPTED":
      case "READY_FOR_CASH_OUT":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "PAYMENT_PROCESSING":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "NOT_PAID":
      case "FAILED":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getOrderTypeBadgeStyle = (type) => {
    switch (type) {
      case "upgrade":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "new":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200/60 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder={trans("admin.premiumOrders.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 text-xs md:text-sm focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none transition-all"
          />
          <div className="absolute start-3 top-1/2 -translate-y-1/2 text-neutral-400">
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Status and Plan Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Plan Filter */}
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-neutral-200 text-xs md:text-sm focus:border-primary focus:outline-none bg-white font-bold text-slate-700 cursor-pointer"
          >
            <option value="all">{trans("admin.premiumOrders.allPlans")}</option>
            <option value="starter">
              {trans("admin.premiumOrders.starterPlan")}
            </option>
            <option value="growth">
              {trans("admin.premiumOrders.growthPlan")}
            </option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-neutral-200 text-xs md:text-sm focus:border-primary focus:outline-none bg-white font-bold text-slate-700 cursor-pointer"
          >
            <option value="all">
              {trans("admin.premiumOrders.allStatuses")}
            </option>
            <option value="paid">{trans("admin.premiumOrders.paid")}</option>
            <option value="not-paid">
              {trans("admin.premiumOrders.notPaid")}
            </option>
          </select>
        </div>
      </div>

      {/* Main Grouped List */}
      <div className="space-y-4">
        {filteredGroups.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200/60 p-20 text-center flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center text-primary">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            </div>
            <p className="text-neutral-400 font-bold text-sm">
              {trans("admin.premiumOrders.noOrdersFound")}
            </p>
          </div>
        ) : (
          filteredGroups.map((group) => {
            const user = group.user || {};
            const activePlan = user.shopPlan;

            return (
              <div
                key={user._id}
                className="bg-white rounded-2xl border border-neutral-200/60 shadow-sm overflow-hidden"
              >
                {/* Group Header (User Details Card) */}
                <div className="bg-slate-50/50 border-b border-neutral-100 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.fullName}
                        className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-sm ring-1 ring-neutral-200"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-orange-500 text-white font-extrabold flex items-center justify-center text-sm shadow-sm">
                        {user.fullName?.charAt(0).toUpperCase() || "U"}
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm md:text-base font-black text-slate-800 font-NotoSansArabic leading-snug">
                        {user.fullName || "—"}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] text-neutral-500">
                        <span className="font-medium">{user.email || "—"}</span>
                        <span className="text-neutral-300">•</span>
                        <span className="font-medium" dir="ltr">
                          {user.phone || "—"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Current Active Plan Badge */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                      {trans("admin.premiumOrders.activePlanLabel")}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${
                        activePlan === "growth"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : activePlan === "starter"
                            ? "bg-sky-50 text-sky-700 border-sky-200"
                            : "bg-neutral-100 text-neutral-600 border-neutral-200"
                      }`}
                    >
                      {activePlan
                        ? trans(`admin.premiumOrders.activePlan.${activePlan}`)
                        : trans("admin.premiumOrders.noPlan")}
                    </span>
                  </div>
                </div>

                {/* Group Body (User Premium Orders Table) */}
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-start text-xs md:text-sm">
                    <thead>
                      <tr className="bg-neutral-50/50 border-b border-neutral-100 text-neutral-500 font-bold text-[10px] md:text-xs uppercase tracking-wider">
                        <th className="px-5 py-3.5 text-start font-black">
                          {trans("admin.premiumOrders.requestedPlan")}
                        </th>
                        <th className="px-5 py-3.5 text-start font-black">
                          {trans("admin.premiumOrders.orderType")}
                        </th>
                        <th className="px-5 py-3.5 text-start font-black">
                          {trans("admin.premiumOrders.coupon")}
                        </th>
                        <th className="px-5 py-3.5 text-start font-black">
                          {trans("admin.premiumOrders.amount")}
                        </th>
                        <th className="px-5 py-3.5 text-start font-black">
                          {trans("admin.premiumOrders.paymentStatus")}
                        </th>
                        <th className="px-5 py-3.5 text-start font-black">
                          {trans("admin.premiumOrders.waffyStatus")}
                        </th>
                        <th className="px-5 py-3.5 text-start font-black">
                          {trans("admin.premiumOrders.createdAt")}
                        </th>
                        <th className="px-5 py-3.5 text-start font-black">
                          Waffy ID
                        </th>
                        <th className="px-5 py-3.5 text-start font-black">
                          {trans("admin.premiumOrders.links")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {group.orders.map((order) => (
                        <tr
                          key={order._id}
                          className="hover:bg-neutral-50/30 transition-colors"
                        >
                          {/* Plan */}
                          <td className="px-5 py-3.5">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-black uppercase tracking-wider ${getPlanBadgeStyle(order.plan)}`}
                            >
                              {order.plan === "growth"
                                ? trans("admin.premiumOrders.activePlan.growth")
                                : trans(
                                    "admin.premiumOrders.activePlan.starter",
                                  )}
                            </span>
                          </td>

                          {/* Order Type */}
                          <td className="px-5 py-3.5">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-black uppercase tracking-wider ${getOrderTypeBadgeStyle(order.orderType)}`}
                            >
                              {order.orderType === "upgrade"
                                ? trans("admin.premiumOrders.upgrade")
                                : trans("admin.premiumOrders.new")}
                            </span>
                          </td>

                          {/* Coupon */}
                          <td className="px-5 py-3.5">
                            {order.couponCode ? (
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md text-[10px] w-fit font-mono uppercase tracking-wider">
                                  {order.couponCode}
                                </span>
                                {order.discountPercent ? (
                                  <span className="text-[10px] text-neutral-500 font-bold">
                                    -{order.discountPercent}%
                                  </span>
                                ) : null}
                              </div>
                            ) : (
                              <span className="text-neutral-400">—</span>
                            )}
                          </td>

                          {/* Amount */}
                          <td className="px-5 py-3.5 font-bold text-slate-800">
                            {order.amount}{" "}
                            {trans("admin.premiumOrders.currency")}
                          </td>

                          {/* Status */}
                          <td className="px-5 py-3.5">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md border text-[10px] font-black uppercase tracking-wider ${getStatusBadgeStyle(order.status)}`}
                            >
                              <span
                                className={`w-1 h-1 rounded-full ${order.status === "paid" ? "bg-emerald-500" : "bg-rose-500"}`}
                              />
                              {order.status === "paid"
                                ? trans("admin.premiumOrders.paid")
                                : trans("admin.premiumOrders.notPaid")}
                            </span>
                          </td>

                          {/* Waffy Status */}
                          <td className="px-5 py-3.5">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border text-[10px] font-black uppercase tracking-wider ${getWaffyStatusBadgeStyle(order.waffyStatus)}`}
                            >
                              {order.waffyStatus}
                            </span>
                          </td>

                          {/* Created At */}
                          <td className="px-5 py-3.5 text-neutral-500 font-medium">
                            {format(
                              new Date(order.createdAt),
                              "yyyy/MM/dd HH:mm",
                            )}
                          </td>

                          {/* Milestone/Contract ID */}
                          <td
                            className="px-5 py-3.5 text-neutral-500 font-mono text-[11px] max-w-[120px] truncate"
                            title={order.milestoneId}
                          >
                            {order.milestoneId}
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-3.5">
                            {order.paymentUrl ? (
                              <a
                                href={order.paymentUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary hover:underline font-bold text-xs"
                              >
                                {trans("admin.premiumOrders.paymentLink")}
                              </a>
                            ) : (
                              <span className="text-neutral-400">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
