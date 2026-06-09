"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Input,
  Select,
  SelectItem,
  Button,
  Card,
  CardBody,
} from "@heroui/react";
import { useDebounce } from "use-debounce";
import { useTranslations } from "@/hooks/useTranslations";

const taskTypes = [
  { key: "all", label: "All Types" },
  { key: "programming", label: "Programming" },
  { key: "bug", label: "Bug" },
  { key: "feature", label: "Feature" },
  { key: "seo", label: "SEO" },
  { key: "marketing", label: "Marketing" },
  { key: "ui", label: "UI" },
  { key: "ux", label: "UX" },
  { key: "design", label: "Design" },
  { key: "content", label: "Content" },
  { key: "testing", label: "Testing" },
  { key: "documentation", label: "Documentation" },
  { key: "other", label: "Other" },
];

const taskStatuses = [
  { key: "all", label: "All Statuses" },
  { key: "pending", label: "Pending" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

const sortOptions = [
  { key: "priority-desc", label: "Priority (High to Low)" },
  { key: "priority-asc", label: "Priority (Low to High)" },
  { key: "createdAt-desc", label: "Newest First" },
  { key: "createdAt-asc", label: "Oldest First" },
];

const SearchIcon = ({ className }) => (
  <svg
    className={className}
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
);

const FilterIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
    />
  </svg>
);

const TaskFilters = ({ queryParams, translate }) => {
  const t = useTranslations(translate);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(queryParams?.search || "");
  const [type, setType] = useState(queryParams?.type || "all");
  const [status, setStatus] = useState(queryParams?.status || "all");
  const [sort, setSort] = useState(
    `${queryParams?.sortBy || "priority"}-${queryParams?.sortOrder || "desc"}`
  );
  const [dateFrom, setDateFrom] = useState(queryParams?.dateFrom || "");
  const [dateTo, setDateTo] = useState(queryParams?.dateTo || "");
  const [showCompleted, setShowCompleted] = useState(
    queryParams?.showCompleted === "true"
  );

  const [debouncedSearch] = useDebounce(search, 500);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    let hasChanges = false;

    const currentSearch = params.get("search") || "";
    if (debouncedSearch !== currentSearch) {
      if (debouncedSearch) params.set("search", debouncedSearch);
      else params.delete("search");
      hasChanges = true;
    }

    const currentType = params.get("type") || "all";
    if (type !== currentType) {
      if (type && type !== "all") params.set("type", type);
      else params.delete("type");
      hasChanges = true;
    }

    const currentStatus = params.get("status") || "all";
    if (status !== currentStatus) {
      if (status && status !== "all") params.set("status", status);
      else params.delete("status");
      hasChanges = true;
    }

    const currentDateFrom = params.get("dateFrom") || "";
    if (dateFrom !== currentDateFrom) {
      if (dateFrom) params.set("dateFrom", dateFrom);
      else params.delete("dateFrom");
      hasChanges = true;
    }

    const currentDateTo = params.get("dateTo") || "";
    if (dateTo !== currentDateTo) {
      if (dateTo) params.set("dateTo", dateTo);
      else params.delete("dateTo");
      hasChanges = true;
    }

    const currentShowCompleted = params.get("showCompleted") === "true";
    if (showCompleted !== currentShowCompleted) {
      if (showCompleted) params.set("showCompleted", "true");
      else params.delete("showCompleted");
      hasChanges = true;
    }

    const [sortBy, sortOrder] = sort.split("-");
    const currentSortBy = params.get("sortBy") || "priority";
    const currentSortOrder = params.get("sortOrder") || "desc";

    if (sortBy !== currentSortBy || sortOrder !== currentSortOrder) {
      params.set("sortBy", sortBy);
      params.set("sortOrder", sortOrder);
      hasChanges = true;
    }

    if (hasChanges) {
      if (params.get("page")) params.set("page", "1");
      router.push(`?${params.toString()}`);
    }
  }, [debouncedSearch, type, status, sort, dateFrom, dateTo, showCompleted]);

  const handleReset = () => {
    setSearch("");
    setType("all");
    setStatus("all");
    setSort("priority-desc");
    setDateFrom("");
    setDateTo("");
    setShowCompleted(false);
    router.push("?");
  };

  return (
    <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-[#f48a42]/5">
      <CardBody className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-[#f48a42] to-[#f47242] rounded-xl flex items-center justify-center shadow-lg">
            <FilterIcon className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">
            {t("admin.tasks.filters")}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            placeholder={t("admin.tasks.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            startContent={<SearchIcon className="w-4 h-4 text-gray-400" />}
            className="lg:col-span-2"
            classNames={{
              inputWrapper:
                "border-2 border-transparent focus-within:border-[#f48a42] bg-white shadow-sm",
            }}
          />

          <Select
            label={t("admin.tasks.type")}
            selectedKeys={[type]}
            onChange={(e) => setType(e.target.value)}
            classNames={{ trigger: "bg-white shadow-sm" }}
          >
            {taskTypes.map((t) => (
              <SelectItem key={t.key} value={t.key}>
                {t.label}
              </SelectItem>
            ))}
          </Select>

          <Select
            label={t("admin.tasks.status")}
            selectedKeys={[status]}
            onChange={(e) => setStatus(e.target.value)}
            classNames={{ trigger: "bg-white shadow-sm" }}
          >
            {taskStatuses.map((s) => (
              <SelectItem key={s.key} value={s.key}>
                {s.label}
              </SelectItem>
            ))}
          </Select>

          <Input
            type="date"
            label={t("admin.tasks.dateFrom")}
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            classNames={{ inputWrapper: "bg-white shadow-sm" }}
          />

          <Input
            type="date"
            label={t("admin.tasks.dateTo")}
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            classNames={{ inputWrapper: "bg-white shadow-sm" }}
          />

          <Select
            label={t("admin.tasks.sortBy")}
            selectedKeys={[sort]}
            onChange={(e) => setSort(e.target.value)}
            classNames={{ trigger: "bg-white shadow-sm" }}
          >
            {sortOptions.map((o) => (
              <SelectItem key={o.key} value={o.key}>
                {o.label}
              </SelectItem>
            ))}
          </Select>

          <div className="flex items-end gap-2">
            <Button
              variant="flat"
              onPress={handleReset}
              className="flex-1 bg-gray-100 hover:bg-gray-200"
            >
              {t("admin.tasks.resetFilters")}
            </Button>
            <Button
              variant={showCompleted ? "solid" : "flat"}
              onPress={() => setShowCompleted(!showCompleted)}
              className={
                showCompleted
                  ? "bg-gradient-to-r from-[#f48a42] to-[#f47242] text-white"
                  : "bg-gray-100"
              }
            >
              {t("admin.tasks.showCompleted")}
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default TaskFilters;
