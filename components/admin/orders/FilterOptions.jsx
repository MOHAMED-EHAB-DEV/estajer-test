"use client";
import { useTranslations } from "@/hooks/useTranslations";
import { Select, SelectItem } from "@heroui/react";
import { Print } from "@/components/ui/svgs/icons/PrintSvg";
import { Search } from "@/components/ui/svgs/icons/SearchSvg";
import { Add } from "@/components/ui/svgs/icons/AddSvg";
import Button from "@/components/ui/Button";
import DateRangePicker from "@/components/admin/DateRangePicker";

const FilterOptions = ({
  translate,
  status,
  setStatus,
  selectedRange,
  onRangeSelect,
  dateAdded,
  setDateAdded,
  search,
  setSearch,
  isShowPrintButton = true,
  isShowAddButton = false,
  showStatus = true,
  showDate = true,
  showDateAdded = false,
  statusOptions = [
    { key: "all" },
    { key: "not-paid" },
    { key: "pending" },
    { key: "confirmed" },
    { key: "received" },
    { key: "completed" },
    { key: "not-returned" },
    { key: "rejecting" },
    { key: "rejectionConfirmed" },
    { key: "cancelled" },
  ],
  showSearch = true,
  ownerSearch,
  setOwnerSearch,
  customerSearch,
  setCustomerSearch,
  lang,
  children,
  onPrint,
  isPrintLoading = false,
  selectedPartner,
  setSelectedPartner,
  partners,
  dateAddedOptions=[
    { key: "all" }
  ],
}) => {
  const trans = useTranslations(translate);
  const t = (text) => trans(`admin.filterOptions.${text}`);
  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-black/5 md:p-5 p-4 w-full flex flex-wrap md:gap-4 gap-2 items-center">
        {showStatus && (
          <div className="flex gap-2 md:gap-5 items-center min-w-fit">
            <span className="text-darkNavy font-NotoSansArabic md:text-sm text-xs font-semibold whitespace-nowrap">
              {t("status")}
            </span>
            <Select
              className="w-[120px]"
              size="sm"
              aria-label={t("status")}
              selectedKeys={[status]}
              onChange={(e) => setStatus(e.target.value)}
              disallowEmptySelection
              classNames={{
                trigger:
                  "md:h-12 h-9 bg-white border border-[#f48a42]/20 hover:border-[#f48a42]/50 rounded-xl shadow-none",
                value: "text-darkNavy md:text-sm text-xs font-medium",
              }}
            >
              {statusOptions.map(({ key }) => (
                <SelectItem key={key} value={key}>
                  {t(key)}
                </SelectItem>
              ))}
            </Select>
          </div>
        )}

        {showDateAdded && (
          <div className="flex gap-2 md:gap-3 items-center min-w-fit">
            <span className="text-darkNavy font-NotoSansArabic text-xs md:text-sm font-semibold whitespace-nowrap">
              {t("dateAdded")}
            </span>
            <Select
              className="w-[120px]"
              size="sm"
              aria-label={t("dateAdded")}
              selectedKeys={[dateAdded]}
              onChange={(e) => setDateAdded(e.target.value)}
              disallowEmptySelection
              classNames={{
                trigger:
                  "md:h-12 h-9 bg-white border border-[#f48a42]/20 hover:border-[#f48a42]/50 rounded-xl shadow-none",
                value: "text-darkNavy md:text-sm text-xs font-medium",
              }}
            >
              {dateAddedOptions.map(({ key }) => (
                <SelectItem key={key} value={key}>
                  {t(key)}
                </SelectItem>
              ))}
            </Select>
          </div>
        )}

        {selectedPartner !== undefined && setSelectedPartner !== undefined && (
          <div className="flex gap-2 md:gap-3 items-center min-w-fit">
            <span className="text-darkNavy font-NotoSansArabic text-xs md:text-sm font-semibold whitespace-nowrap">
              {t("provider")}
            </span>
            <Select
              className="w-[120px]"
              size="sm"
              aria-label="Provider filter"
              selectedKeys={[selectedPartner]}
              onChange={(e) => setSelectedPartner(e.target.value)}
              disallowEmptySelection
              classNames={{
                trigger:
                  "md:h-12 h-9 bg-white border border-[#f48a42]/20 hover:border-[#f48a42]/50 rounded-xl shadow-none",
                value: "text-darkNavy md:text-sm text-xs font-medium",
              }}
            >
              <SelectItem key="all" value="all">
                {t("all")}
              </SelectItem>
              <SelectItem key="estajer" value="estajer">
                {t("estajer")}
              </SelectItem>
              <SelectItem key="nana" value="nana">
                {t("nana")}
              </SelectItem>
              {(partners || []).map((partner) => (
                <SelectItem key={partner._id} value={partner._id}>
                  {lang === "ar" ? partner.nameAr : partner.nameEn}
                </SelectItem>
              ))}
            </Select>
          </div>
        )}

        {showDate && (
          <div className="min-w-fit">
            <DateRangePicker
              lang={lang === "" ? "ar" : lang}
              onSelect={onRangeSelect}
              translate={trans}
              selectedRange={selectedRange}
            />
          </div>
        )}

        {/* Divider */}
        <div className="hidden lg:block h-9 w-px bg-black/10" />

        {showSearch && (
          <>
            <div className="relative flex-1 min-w-[200px] flex items-center bg-white rounded-xl border border-[#f48a42]/20 focus-within:border-[#f48a42] focus-within:ring-2 focus-within:ring-[#f48a42]/10 transition-all">
              <div className="absolute start-4 top-1/2 -translate-y-1/2 text-[#f48a42]">
                <Search className="md:w-5 md:h-5 w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                className="bg-transparent rounded-xl md:py-3 py-2 ps-10 pe-3 flex-1 w-full border-none outline-none focus:outline-none placeholder:font-NotoSansArabic md:placeholder:text-sm placeholder:text-xs placeholder:text-gray-400 text-darkNavy md:text-sm text-xs"
                placeholder={t("searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label={t("searchPlaceholder")}
              />
            </div>

            {setOwnerSearch !== undefined && (
              <div className="relative flex-1 min-w-[200px] flex items-center bg-white rounded-xl border border-[#f48a42]/20 focus-within:border-[#f48a42] focus-within:ring-2 focus-within:ring-[#f48a42]/10 transition-all">
                <div className="absolute start-4 top-1/2 -translate-y-1/2 text-[#f48a42]">
                  <Search className="md:w-5 md:h-5 w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  className="bg-transparent rounded-xl md:py-3 py-2 ps-10 pe-3 flex-1 w-full border-none outline-none focus:outline-none placeholder:font-NotoSansArabic md:placeholder:text-sm placeholder:text-xs placeholder:text-gray-400 text-darkNavy md:text-sm text-xs"
                  placeholder={t("ownerSearch")}
                  value={ownerSearch}
                  onChange={(e) => setOwnerSearch(e.target.value)}
                  aria-label="Owner search"
                />
              </div>
            )}

            {setCustomerSearch !== undefined && (
              <div className="relative flex-1 min-w-[150px] flex items-center bg-white rounded-xl border border-[#f48a42]/20 focus-within:border-[#f48a42] focus-within:ring-2 focus-within:ring-[#f48a42]/10 transition-all">
                <div className="absolute start-4 top-1/2 -translate-y-1/2 text-[#f48a42]">
                  <Search className="md:w-5 md:h-5 w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  className="bg-transparent rounded-xl md:py-3 py-2 ps-10 pe-3 flex-1 w-full border-none outline-none focus:outline-none placeholder:font-NotoSansArabic md:placeholder:text-sm placeholder:text-xs placeholder:text-gray-400 text-darkNavy md:text-sm text-xs"
                  placeholder={t("customerSearch")}
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  aria-label="Customer search"
                />
              </div>
            )}
          </>
        )}

        {isShowPrintButton && (
          <Button
            className="bg-darkNavy md:py-4 py-2 md:px-6 px-4 h-auto shadow-[#F48A4233] shadow-lg rounded-xl flex items-center justify-center gap-2 min-w-fit"
            onPress={onPrint}
            isDisabled={isPrintLoading}
          >
            {isPrintLoading ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
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
              <Print className="md:w-5 md:h-5 w-3.5 h-3.5" />
            )}
            <span className="font-semibold text-xs md:text-sm font-IBMPlex text-white">
              {isPrintLoading ? t("exporting") : t("print")}
            </span>
          </Button>
        )}
        {isShowAddButton && (
          <Button className="bg-[#f48a42] md:py-2 py-1.5 md:px-6 px-4 text-white font-semibold text-xs md:text-sm rounded-xl flex items-center justify-center gap-2">
            <Add className="md:w-4 md:h-4 w-3 h-3" />
            {t("addNewProduct")}
          </Button>
        )}
        {children}
      </div>
    </>
  );
};

export default FilterOptions;
