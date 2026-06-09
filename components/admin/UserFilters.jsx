"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "use-debounce";
import { Select, SelectItem } from "@heroui/react";
import { Search } from "@/components/ui/svgs/icons/SearchSvg";
import { useTranslations } from "@/hooks/useTranslations";
import DateRangePicker from "@/components/admin/DateRangePicker";
import { Print } from "@/components/ui/svgs/icons/PrintSvg";
import Button from "@/components/ui/Button";

const UserFilters = ({
  queryParams,
  translate,
  lang,
  onPrint,
  isPrintLoading = false,
}) => {
  const trans = useTranslations(translate);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(queryParams?.search || "");
  const [accountType, setAccountType] = useState(
    queryParams?.accountType || "all",
  );
  const [status, setStatus] = useState(queryParams?.status || "all");
  const [isRenter, setIsRenter] = useState(queryParams?.isRenter || "all");
  const [hasApprovedProduct, setHasApprovedProduct] = useState(
    queryParams?.hasApprovedProduct || "all",
  );

  const [selectedRange, setSelectedRange] = useState({
    from: searchParams.get("startDate")
      ? new Date(searchParams.get("startDate"))
      : null,
    to: searchParams.get("endDate")
      ? new Date(searchParams.get("endDate"))
      : null,
  });

  const [debouncedSearch] = useDebounce(searchTerm.trim(), 400);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    let hasChanges = false;

    const currentSearch = params.get("search") || "";
    if (debouncedSearch !== currentSearch) {
      if (debouncedSearch) params.set("search", debouncedSearch);
      else params.delete("search");
      hasChanges = true;
    }

    const currentAccountType = params.get("accountType") || "all";
    if (accountType !== currentAccountType) {
      if (accountType !== "all") params.set("accountType", accountType);
      else params.delete("accountType");
      hasChanges = true;
    }

    const currentStatus = params.get("status") || "all";
    if (status !== currentStatus) {
      if (status !== "all") params.set("status", status);
      else params.delete("status");
      hasChanges = true;
    }

    const currentIsRenter = params.get("isRenter") || "all";
    if (isRenter !== currentIsRenter) {
      if (isRenter !== "all") params.set("isRenter", isRenter);
      else params.delete("isRenter");
      hasChanges = true;
    }

    const currentHasApprovedProduct = params.get("hasApprovedProduct") || "all";
    if (hasApprovedProduct !== currentHasApprovedProduct) {
      if (hasApprovedProduct !== "all")
        params.set("hasApprovedProduct", hasApprovedProduct);
      else params.delete("hasApprovedProduct");
      hasChanges = true;
    }

    if (hasChanges) {
      if (params.get("page")) params.set("page", "1");
      router.push(`?${params.toString()}`);
    }
  }, [debouncedSearch, accountType, status, isRenter, hasApprovedProduct]);

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

    if (params.get("page")) params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const accountTypeOptions = [
    { key: "all", label: trans("admin.users.allAccountTypes") },
    { key: "personal", label: trans("admin.users.personal") },
    { key: "freelance", label: trans("admin.users.freelance") },
    { key: "company", label: trans("admin.users.company") },
    { key: "admin", label: trans("admin.users.admin") },
  ];

  const statusOptions = [
    { key: "all", label: trans("admin.users.allStatuses") },
    { key: "verified", label: trans("admin.users.verified") },
    { key: "pending", label: trans("admin.users.pending") },
    { key: "banned", label: trans("admin.users.banned") },
    { key: "review_requested", label: "Review Requested" },
  ];

  const renterOptions = [
    { key: "all", label: trans("admin.users.allRenterTypes") },
    { key: "true", label: trans("admin.users.renter") },
    { key: "false", label: trans("admin.users.lessor") },
  ];

  const productFilterOptions = [
    { key: "all", label: trans("admin.users.allProductsStatus") },
    { key: "true", label: trans("admin.users.withApprovedProducts") },
  ];

  return (
    <div className="bg-white md:rounded-2xl rounded-xl shadow-sm border border-black/5 md:p-6 p-4 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6 gap-3 items-end">
        {/* Search Input - Spans 2 columns on larger screens */}
        <div className="xl:col-span-2 space-y-2">
          <span className="text-darkNavy font-NotoSansArabic text-xs md:text-sm font-semibold px-1">
            {trans("admin.users.searchUsersLabel")}
          </span>
          <div className="relative flex items-center bg-[#FDF5EE] rounded-xl border border-[#f48a42]/20 focus-within:border-[#f48a42] focus-within:ring-2 focus-within:ring-[#f48a42]/10 transition-all md:h-12 h-10">
            <div className="absolute start-4 text-[#f48a42]">
              <Search className="md:w-5 md:h-5 w-4 h-4" />
            </div>
            <input
              type="text"
              className="bg-transparent rounded-xl md:py-3 py-2 md:ps-12 ps-10 md:pe-4 pe-3 flex-1 w-full border-none outline-none focus:outline-none placeholder:font-NotoSansArabic placeholder:text-xs md:placeholder:text-sm placeholder:text-gray-400 text-darkNavy text-xs md:text-sm"
              placeholder={trans("admin.users.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label={trans("admin.users.searchPlaceholder")}
            />
          </div>
        </div>

        {/* Date Range Selection */}
        <div className="space-y-2">
          <span className="text-darkNavy font-NotoSansArabic text-xs md:text-sm font-semibold px-1">
            {trans("admin.filterOptions.date")}
          </span>
          <div className="md:h-12 h-10">
            <DateRangePicker
              orange
              lang={lang === "" ? "ar" : lang}
              onSelect={handleRangeSelect}
              translate={trans}
              selectedRange={selectedRange}
            />
          </div>
        </div>

        {/* Export Button - Align right on large screens */}
        <div className="flex items-end">
          <Button
            className="bg-darkNavy rounded-xl md:h-12 h-10 px-6 shadow-[#F48A4233] shadow-lg flex items-center justify-center gap-2 w-full"
            onPress={onPrint}
            isDisabled={isPrintLoading}
          >
            {isPrintLoading ? (
              <svg
                className="animate-spin md:h-5 md:w-5 h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : (
              <Print className="md:w-5 md:h-5 w-4 h-4" />
            )}
            <span className="font-semibold text-xs md:text-sm font-IBMPlex text-white">
              {isPrintLoading
                ? trans("admin.filterOptions.exporting")
                : trans("admin.filterOptions.print")}
            </span>
          </Button>
        </div>

        {/* Filters Group */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 md:gap-6 gap-3 md:col-span-2 lg:col-span-3 xl:col-span-4 pt-4 border-t border-black/5 w-full">
          {/* Account Type Filter */}
          <div className="space-y-2">
            <span className="text-darkNavy font-NotoSansArabic text-xs md:text-sm font-semibold px-1">
              {trans("admin.users.accountTypeLabel")}
            </span>
            <Select
              className="w-full"
              size="sm"
              aria-label={trans("admin.users.accountTypeLabel")}
              selectedKeys={[accountType]}
              onChange={(e) => setAccountType(e.target.value)}
              disallowEmptySelection
              classNames={{
                trigger:
                  "md:h-12 h-10 bg-[#FDF5EE] border border-[#f48a42]/20 hover:border-[#f48a42]/50 rounded-xl shadow-none",
                value: "text-darkNavy text-xs md:text-sm font-medium",
              }}
            >
              {accountTypeOptions.map((opt) => (
                <SelectItem key={opt.key} value={opt.key}>
                  {opt.label}
                </SelectItem>
              ))}
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <span className="text-darkNavy font-NotoSansArabic text-xs md:text-sm font-semibold px-1">
              {trans("admin.users.statusLabel")}
            </span>
            <Select
              className="w-full"
              size="sm"
              aria-label={trans("admin.users.statusLabel")}
              selectedKeys={[status]}
              onChange={(e) => setStatus(e.target.value)}
              disallowEmptySelection
              classNames={{
                trigger:
                  "md:h-12 h-10 bg-[#FDF5EE] border border-[#f48a42]/20 hover:border-[#f48a42]/50 rounded-xl shadow-none",
                value: "text-darkNavy text-xs md:text-sm font-medium",
              }}
            >
              {statusOptions.map((opt) => (
                <SelectItem key={opt.key} value={opt.key}>
                  {opt.label}
                </SelectItem>
              ))}
            </Select>
          </div>

          {/* Role Filter */}
          <div className="space-y-2">
            <span className="text-darkNavy font-NotoSansArabic text-xs md:text-sm font-semibold px-1">
              {trans("admin.users.renterTypeLabel")}
            </span>
            <Select
              className="w-full"
              size="sm"
              aria-label={trans("admin.users.renterTypeLabel")}
              selectedKeys={[isRenter]}
              onChange={(e) => setIsRenter(e.target.value)}
              disallowEmptySelection
              classNames={{
                trigger:
                  "md:h-12 h-10 bg-[#FDF5EE] border border-[#f48a42]/20 hover:border-[#f48a42]/50 rounded-xl shadow-none",
                value: "text-darkNavy text-xs md:text-sm font-medium",
              }}
            >
              {renterOptions.map((opt) => (
                <SelectItem key={opt.key} value={opt.key}>
                  {opt.label}
                </SelectItem>
              ))}
            </Select>
          </div>

          {/* Product Filter */}
          <div className="space-y-2">
            <span className="text-darkNavy font-NotoSansArabic text-xs md:text-sm font-semibold px-1">
              {trans("admin.users.approvedProductsLabel")}
            </span>
            <Select
              className="w-full"
              size="sm"
              aria-label={trans("admin.users.approvedProductsLabel")}
              selectedKeys={[hasApprovedProduct]}
              onChange={(e) => setHasApprovedProduct(e.target.value)}
              disallowEmptySelection
              classNames={{
                trigger:
                  "md:h-12 h-10 bg-[#FDF5EE] border border-[#f48a42]/20 hover:border-[#f48a42]/50 rounded-xl shadow-none",
                value: "text-darkNavy text-xs md:text-sm font-medium",
              }}
            >
              {productFilterOptions.map((opt) => (
                <SelectItem key={opt.key} value={opt.key}>
                  {opt.label}
                </SelectItem>
              ))}
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserFilters;
