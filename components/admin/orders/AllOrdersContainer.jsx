"use client";
import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import FilterOptions from "@/components/admin/orders/FilterOptions";
import NewestOrders from "@/components/admin/NewestOrders";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "@/utils/toast";
import ToastMessage from "@/components/ui/ToastMessage";

const AllOrdersContainer = ({
  translate,
  langPrefix,
  lang,
  isAll = false,
  orders: initialOrders,
  totalOrders: initialTotalOrders,
  totalPages: initialTotalPages,
  currentPage,
  queryParams,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ranking, setRanking] = useState("all");
  const [status, setStatus] = useState(searchParams.get("status") || "all");
  const [selectedRange, setSelectedRange] = useState({
    from: searchParams.get("startDate")
      ? new Date(searchParams.get("startDate"))
      : null,
    to: searchParams.get("endDate")
      ? new Date(searchParams.get("endDate"))
      : null,
  });
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [ownerSearch, setOwnerSearch] = useState(
    searchParams.get("ownerSearch") || "",
  );
  const [customerSearch, setCustomerSearch] = useState(
    searchParams.get("customerSearch") || "",
  );
  const [selectedPartner, setSelectedPartner] = useState(
    searchParams.get("provider") || "all",
  );
  const [partners, setPartners] = useState([]);
  const [isPrintLoading, setIsPrintLoading] = useState(false);

  // Debounce search input with 400ms delay
  const [debouncedSearch] = useDebounce(search?.trim(), 400);
  const [debouncedOwnerSearch] = useDebounce(ownerSearch?.trim(), 400);
  const [debouncedCustomerSearch] = useDebounce(customerSearch?.trim(), 400);

  const [orders, setOrders] = useState(initialOrders);
  const [totalOrders, setTotalOrders] = useState(initialTotalOrders);
  const [totalPages, setTotalPages] = useState(initialTotalPages);

  useEffect(() => {
    setOrders(initialOrders);
    setTotalOrders(initialTotalOrders);
    setTotalPages(initialTotalPages);
  }, [initialOrders, initialTotalOrders, initialTotalPages]);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const response = await fetch("/api/partners?all=true");
        if (!response.ok) throw new Error("Failed to fetch partners");
        const result = await response.json();
        setPartners(result.data || []);
      } catch (error) {
        console.error("Error fetching partners:", error);
      }
    };
    fetchPartners();
  }, []);

  const handleRangeSelect = (range) => {
    setSelectedRange(range);
    const params = new URLSearchParams(searchParams);
    if (range?.from)
      params.set(
        "startDate",
        range.from.toLocaleDateString("en").replaceAll("/", "-"),
      );
    else params.delete("startDate");

    if (range?.to)
      params.set(
        "endDate",
        range.to.toLocaleDateString("en").replaceAll("/", "-"),
      );
    else params.delete("endDate");

    if (params.get("page")) params.delete("page");
    router.push(`?${params.toString()}`);
  };

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    let hasChanges = false;

    const currentStatus = params.get("status") || "all";
    if (status !== currentStatus) {
      if (status !== "all") params.set("status", status);
      else params.delete("status");
      hasChanges = true;
    }

    const currentSearch = params.get("search") || "";
    if (debouncedSearch !== currentSearch) {
      if (debouncedSearch) params.set("search", debouncedSearch);
      else params.delete("search");
      hasChanges = true;
    }

    const currentOwnerSearch = params.get("ownerSearch") || "";
    if (debouncedOwnerSearch !== currentOwnerSearch) {
      if (debouncedOwnerSearch) params.set("ownerSearch", debouncedOwnerSearch);
      else params.delete("ownerSearch");
      hasChanges = true;
    }

    const currentCustomerSearch = params.get("customerSearch") || "";
    if (debouncedCustomerSearch !== currentCustomerSearch) {
      if (debouncedCustomerSearch)
        params.set("customerSearch", debouncedCustomerSearch);
      else params.delete("customerSearch");
      hasChanges = true;
    }

    const currentProvider = params.get("provider") || "all";
    if (selectedPartner !== currentProvider) {
      if (selectedPartner !== "all") params.set("provider", selectedPartner);
      else params.delete("provider");
      hasChanges = true;
    }

    if (hasChanges) {
      if (params.get("page")) params.delete("page");
      router.push(`?${params.toString()}`);
    }
  }, [
    status,
    debouncedSearch,
    debouncedOwnerSearch,
    debouncedCustomerSearch,
    selectedPartner,
  ]);

  const handleExportExcel = async () => {
    try {
      setIsPrintLoading(true);
      const params = new URLSearchParams();
      if (status && status !== "all") params.set("status", status);
      if (selectedRange?.from)
        params.set(
          "startDate",
          selectedRange.from.toLocaleDateString("en").replaceAll("/", "-"),
        );
      if (selectedRange?.to)
        params.set(
          "endDate",
          selectedRange.to.toLocaleDateString("en").replaceAll("/", "-"),
        );
      if (debouncedSearch) params.set("id", debouncedSearch);
      if (debouncedOwnerSearch) params.set("ownerSearch", debouncedOwnerSearch);
      if (debouncedCustomerSearch)
        params.set("customerSearch", debouncedCustomerSearch);
      if (selectedPartner !== "all") params.set("provider", selectedPartner);

      const response = await fetch(`/api/orders/export?${params.toString()}`);
      if (!response.ok) throw new Error("فشل في تصدير البيانات");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `orders-${new Date().toLocaleDateString("en").replaceAll("/", "-")}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(ToastMessage("تم تصدير الطلبات بنجاح"));
    } catch (error) {
      console.error("Export error:", error);
      toast.error(ToastMessage("حدث خطأ أثناء تصدير البيانات"));
    } finally {
      setIsPrintLoading(false);
    }
  };

  return (
    <>
      <FilterOptions
        translate={translate}
        search={search}
        setSearch={setSearch}
        ownerSearch={ownerSearch}
        setOwnerSearch={setOwnerSearch}
        customerSearch={customerSearch}
        setCustomerSearch={setCustomerSearch}
        status={status}
        onRangeSelect={handleRangeSelect}
        selectedRange={selectedRange}
        setStatus={setStatus}
        ranking={ranking}
        setRanking={setRanking}
        selectedPartner={selectedPartner}
        setSelectedPartner={setSelectedPartner}
        partners={partners}
        lang={lang}
        isShowPrintButton={true}
        onPrint={handleExportExcel}
        isPrintLoading={isPrintLoading}
      />
      <NewestOrders
        translate={translate}
        langPrefix={langPrefix}
        key={"orders"}
        lang={lang}
        isAll={isAll}
        orders={orders}
        totalOrders={totalOrders}
        totalPages={totalPages}
        initialCurrentPage={currentPage}
        queryParams={queryParams}
      />
    </>
  );
};
export default AllOrdersContainer;
