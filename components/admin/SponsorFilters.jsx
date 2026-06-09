"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardBody,
  Input,
  Select,
  SelectItem,
  Button,
  Chip,
} from "@heroui/react";
import { useTranslations } from "@/hooks/useTranslations";
// Using simple SVG icons instead of Heroicons
const MagnifyingGlassIcon = ({ className }) => (
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

const XMarkIcon = ({ className }) => (
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
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const SponsorFilters = ({ queryParams, translate, categories }) => {
  const t = useTranslations(translate);
  const router = useRouter();

  const [filters, setFilters] = useState({
    search: queryParams?.search || "",
    category: queryParams?.category || "",
    isActive: queryParams?.isActive || "",
    sortBy: queryParams?.sortBy || "createdAt",
    sortOrder: queryParams?.sortOrder || "desc",
  });

  // Use categories from props (passed from static/categories.js)
  const categoryOptions = categories.map((category) => ({
    key: category.key,
    label: category.name,
  }));

  const statusOptions = [
    { key: "true", label: t("admin.sponsors.status.active") },
    { key: "false", label: t("admin.sponsors.status.inactive") },
  ];

  const sortOptions = [
    {
      key: "createdAt",
      label: t("admin.sponsors.sort.createdAt"),
    },
    { key: "priority", label: t("admin.sponsors.sort.priority") },
    { key: "category", label: t("admin.sponsors.sort.category") },
    {
      key: "user.name",
      label: t("admin.sponsors.sort.userName"),
    },
  ];

  const updateURL = (newFilters) => {
    const params = new URLSearchParams();

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== "") {
        params.set(key, value);
      }
    });

    // Always include page 1 when filters change
    params.set("page", "1");

    const queryString = params.toString();
    const newURL = queryString ? `?${queryString}` : window.location.pathname;

    router.push(newURL);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: "",
      category: "",
      isActive: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    };
    setFilters(clearedFilters);
    updateURL(clearedFilters);
  };

  const hasActiveFilters =
    filters.search || filters.category || filters.isActive;

  return (
    <Card className="shadow-lg border border-gray-200">
      <CardBody className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <Input
              placeholder={t("admin.sponsors.search.placeholder")}
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              startContent={
                <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
              }
              classNames={{
                input: "text-sm",
                inputWrapper:
                  "border border-gray-300 hover:border-gray-400 focus-within:border-blue-500",
              }}
            />
          </div>

          {/* Category Filter */}
          <div className="w-full lg:w-48">
            <Select
              placeholder={t("admin.sponsors.category.placeholder")}
              selectedKeys={filters.category ? [filters.category] : []}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              classNames={{
                trigger:
                  "border border-gray-300 hover:border-gray-400 data-[focus=true]:border-blue-500",
              }}
            >
              {categoryOptions.map((category) => (
                <SelectItem key={category.key} value={category.key}>
                  {category.label}
                </SelectItem>
              ))}
            </Select>
          </div>

          {/* Status Filter */}
          <div className="w-full lg:w-40">
            <Select
              placeholder={t("admin.sponsors.status.placeholder")}
              selectedKeys={filters.isActive ? [filters.isActive] : []}
              onChange={(e) => handleFilterChange("isActive", e.target.value)}
              classNames={{
                trigger:
                  "border border-gray-300 hover:border-gray-400 data-[focus=true]:border-blue-500",
              }}
            >
              {statusOptions.map((status) => (
                <SelectItem key={status.key} value={status.key}>
                  {status.label}
                </SelectItem>
              ))}
            </Select>
          </div>

          {/* Sort By */}
          <div className="w-full lg:w-44">
            <Select
              placeholder={t("admin.sponsors.sort.placeholder")}
              selectedKeys={[filters.sortBy]}
              onChange={(e) => handleFilterChange("sortBy", e.target.value)}
              classNames={{
                trigger:
                  "border border-gray-300 hover:border-gray-400 data-[focus=true]:border-blue-500",
              }}
            >
              {sortOptions.map((option) => (
                <SelectItem key={option.key} value={option.key}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>
          </div>

          {/* Sort Order */}
          <div className="w-full lg:w-32">
            <Select
              selectedKeys={[filters.sortOrder]}
              onChange={(e) => handleFilterChange("sortOrder", e.target.value)}
              classNames={{
                trigger:
                  "border border-gray-300 hover:border-gray-400 data-[focus=true]:border-blue-500",
              }}
            >
              <SelectItem key="asc" value="asc">
                {t("admin.sponsors.sort.asc")}
              </SelectItem>
              <SelectItem key="desc" value="desc">
                {t("admin.sponsors.sort.desc")}
              </SelectItem>
            </Select>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button
              variant="flat"
              color="danger"
              onPress={clearFilters}
              startContent={<XMarkIcon className="w-4 h-4" />}
              className="w-full lg:w-auto"
            >
              {t("admin.sponsors.clearFilters")}
            </Button>
          )}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-600 font-medium">
              {t("admin.sponsors.activeFilters")}:
            </span>
            {filters.search && (
              <Chip
                size="sm"
                variant="flat"
                color="primary"
                onClose={() => handleFilterChange("search", "")}
              >
                {t("admin.sponsors.search.label")}: {filters.search}
              </Chip>
            )}
            {filters.category && (
              <Chip
                size="sm"
                variant="flat"
                color="secondary"
                onClose={() => handleFilterChange("category", "")}
              >
                {t("admin.sponsors.category.label")}:{" "}
                {categoryOptions.find((c) => c.key === filters.category)?.label}
              </Chip>
            )}
            {filters.isActive && (
              <Chip
                size="sm"
                variant="flat"
                color={filters.isActive === "true" ? "success" : "danger"}
                onClose={() => handleFilterChange("isActive", "")}
              >
                {t("admin.sponsors.status.label")}:{" "}
                {statusOptions.find((s) => s.key === filters.isActive)?.label}
              </Chip>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default SponsorFilters;
