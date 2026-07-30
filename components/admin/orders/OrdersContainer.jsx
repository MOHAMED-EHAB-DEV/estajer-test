"use client";

import { useState, Suspense, useEffect } from "react";
import FilterOptions from "@/components/admin/orders/FilterOptions";
import Cards from "@/components/admin/Cards";
import { box3DQuestionMarkFill } from "@/components/ui/svgs/CardsSvg";
import { useTranslations } from "@/hooks/useTranslations";
import NewestOrders from "@/components/admin/NewestOrders";
import dynamic from "next/dynamic";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

const OrdersCharts = dynamic(() => import("./OrdersCharts"), {
  ssr: false,
});

const OrdersContainer = ({
  translate,
  langPrefix,
  lang,
  initialOrders,
  initialStats,
}) => {
  const trans = useTranslations(translate);
  const router = useRouter();
  const pathname = usePathname();
  const searchParamsHook = useSearchParams();

  const [status, setStatus] = useState(searchParamsHook.get("status") || "all");
  const [selectedRange, setSelectedRange] = useState({
    from: null,
    to: null,
  });
  const [dateAdded, setDateAdded] = useState("all");
  const [search, setSearch] = useState(searchParamsHook.get("search") || "");

  const orders = initialOrders || [];
  const stats = initialStats || null;
  const [isInitialMount, setIsInitialMount] = useState(true);

  useEffect(() => {
    if (isInitialMount) {
      setIsInitialMount(false);
      return;
    }

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParamsHook.toString());

      if (status && status !== "all") params.set("status", status);
      else params.delete("status");

      if (search) params.set("search", search);
      else params.delete("search");

      const formatDate = (date) => {
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        const y = date.getFullYear();
        return `${m}/${d}/${y}`;
      };

      if (selectedRange?.from) {
        params.set("startDate", formatDate(selectedRange.from));
      } else {
        params.delete("startDate");
      }

      if (selectedRange?.to) {
        params.set("endDate", formatDate(selectedRange.to));
      } else {
        params.delete("endDate");
      }

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }, 500);

    return () => clearTimeout(timer);
  }, [status, search, selectedRange]);

  const cards = [
    {
      title: trans("admin.home.cards.newNotPaidOrders"),
      Icon: box3DQuestionMarkFill,
      iconColor: "#F48A42",
      value: stats?.newNotPaidOrders || 0,
      review: stats?.newNotPaidOrders > 0 ? "طلبات جديدة غير مدفوعة" : "لا توجد طلبات جديدة",
      reviewColor: stats?.newNotPaidOrders > 0 ? "#F48A42" : "#6B7280",
      valueColor: "#9747FF",
    },
    {
      title: trans("admin.home.cards.pendingPaidOrders"),
      Icon: box3DQuestionMarkFill,
      iconColor: "#9747FF",
      value: stats?.pendingPaidOrders || 0,
      review: stats?.pendingPaidOrders > 0 ? "طلبات مدفوعة قيد الانتظار" : "لا توجد طلبات قيد الانتظار",
      reviewColor: stats?.pendingPaidOrders > 0 ? "#9747FF" : "#6B7280",
      valueColor: "#9747FF",
    },
    {
      title: trans("admin.home.cards.confirmedOrders"),
      Icon: box3DQuestionMarkFill,
      iconColor: "#4FD6B6",
      value: stats?.confirmedOrders || 0,
      review: stats?.confirmedOrders > 0 ? "طلبات مؤكدة" : "لا توجد طلبات مؤكدة",
      reviewColor: stats?.confirmedOrders > 0 ? "#4FD6B6" : "#6B7280",
      valueColor: "#4FD6B6",
    },
    {
      title: trans("admin.home.cards.receivedOrders"),
      Icon: box3DQuestionMarkFill,
      iconColor: "#4FD658",
      value: stats?.receivedOrders || 0,
      review: stats?.receivedOrders > 0 ? "طلبات مستلمة" : "لا توجد طلبات مستلمة",
      reviewColor: stats?.receivedOrders > 0 ? "#4FD658" : "#6B7280",
      valueColor: "#4FD658",
    },
    {
      title: trans("admin.home.cards.completedOrders"),
      Icon: box3DQuestionMarkFill,
      iconColor: "#4FD658",
      value: stats?.completedOrders || 0,
      review: stats?.completedOrders > 0 ? "طلبات مكتملة" : "لا توجد طلبات مكتملة",
      reviewColor: stats?.completedOrders > 0 ? "#4FD658" : "#6B7280",
      valueColor: "#4FD658",
    },
    {
      title: trans("admin.home.cards.cancelledOrders"),
      Icon: box3DQuestionMarkFill,
      iconColor: "#F55757",
      value: stats?.cancelledOrders || 0,
      review: stats?.cancelledOrders > 0 ? "طلبات ملغية" : "لا توجد طلبات ملغية",
      reviewColor: stats?.cancelledOrders > 0 ? "#F55757" : "#6B7280",
      valueColor: "#F55757",
    },
    {
      title: trans("admin.home.cards.rejectingOrders"),
      Icon: box3DQuestionMarkFill,
      iconColor: "#F55757",
      value: stats?.rejectingOrders || 0,
      review: stats?.rejectingOrders > 0 ? "طلبات جاري الالغاء" : "لا توجد طلبات جاري الغائها",
      reviewColor: stats?.rejectingOrders > 0 ? "#F55757" : "#6B7280",
      valueColor: "#F55757",
    },
    {
      title: trans("admin.home.cards.rejectionConfirmedOrders"),
      Icon: box3DQuestionMarkFill,
      iconColor: "#F55757",
      value: stats?.rejectionConfirmedOrders || 0,
      review: stats?.rejectionConfirmedOrders > 0 ? "طلبات الغاء مؤكدة" : "لا توجد طلبات الغاء مؤكدة",
      reviewColor: stats?.rejectionConfirmedOrders > 0 ? "#F55757" : "#6B7280",
      valueColor: "#F55757",
    },
    {
      title: trans("admin.home.cards.notReturnedOrders"),
      Icon: box3DQuestionMarkFill,
      iconColor: "#F55757",
      value: stats?.notReturnedOrders || 0,
      review: stats?.notReturnedOrders > 0 ? "طلبات غير مرتجعة" : "لا توجد طلبات غير مرتجعة",
      reviewColor: stats?.notReturnedOrders > 0 ? "#F55757" : "#6B7280",
      valueColor: "#F55757",
    },
    {
      title: trans("admin.home.cards.allOrders"),
      Icon: box3DQuestionMarkFill,
      iconColor: "#173DFA",
      value: stats?.allOrders || 0,
      review: "إجمالي الطلبات",
      reviewColor: "#173DFA",
      valueColor: "#173DFA",
    },
  ];

  return (
    <>
      <FilterOptions
        translate={translate}
        search={search}
        setSearch={setSearch}
        showStatus={false}
        selectedRange={selectedRange}
        onRangeSelect={setSelectedRange}
        dateAdded={dateAdded}
        setDateAdded={setDateAdded}
        isShowPrintButton={false}
        lang={lang}
      />
      <Suspense
        fallback={
          <Cards translate={trans} langPrefix={langPrefix} placeholder />
        }
      >
        <Cards
          translate={trans}
          langPrefix={langPrefix}
          cards={cards}
          filterValue={dateAdded}
        />
      </Suspense>
      <OrdersCharts stats={stats} />
      <Suspense
        fallback={
          <NewestOrders
            translate={translate}
            langPrefix={langPrefix}
            placeholder
            lang={lang}
          />
        }
      >
        <NewestOrders
          translate={translate}
          langPrefix={langPrefix}
          key={"orders"}
          lang={lang}
          orders={orders}
        />
      </Suspense>
    </>
  );
};
export default OrdersContainer;
