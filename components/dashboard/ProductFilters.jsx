"use client";
import {
  Select,
  SelectItem,
  Input,
  Autocomplete,
  AutocompleteItem,
} from "@heroui/react";
import { useTranslations } from "@/hooks/useTranslations";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import DateRangePicker from "@/components/admin/DateRangePicker";
import { useSearchParams } from "next/navigation";

import { Print } from "@/components/ui/svgs/icons/PrintSvg";
import ButtonComponent from "@/components/ui/Button";

export default function ProductFilters({
  lang,
  categories,
  subCategories,
  translate,
  queryName,
  queryStatus,
  queryCategory,
  querySubCategory,
  querySortBy,
  queryUserId,
  initialProducts,
  queryParams,
  admin,
  onPrint,
  nana,
  isPrintLoading = false,
  onFilterChange,
  isShop = false,
}) {
  const langPrefix = lang === "ar" ? "" : "en/";
  const trans = useTranslations(translate);
  const t = (text) => trans(`dashboard.filters.${text}`);
  const f = (text) => trans(`admin.filterOptions.${text}`);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [firstRender, setFirstRender] = useState(true);
  const [name, setName] = useState(queryName || "");
  const [status, setStatus] = useState(nana ? "nana" : queryStatus || "all");
  const [category, setCategory] = useState(queryCategory || "all");
  const [subCategory, setSubCategory] = useState(querySubCategory || "all");
  const [sortBy, setSortBy] = useState(querySortBy || "");
  const [selectedUser, setSelectedUser] = useState(queryUserId || "");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [autocompleteOpen, setAutocompleteOpen] = useState(false);

  const [debouncedName] = useDebounce(name, 700);
  const [debouncedUserSearch] = useDebounce(userSearchTerm, 700);

  useEffect(() => {
    setName(queryName || "");
    setStatus(nana ? "nana" : queryStatus || "all");
    setCategory(queryCategory || "all");
    setSubCategory(querySubCategory || "all");
    setSortBy(querySortBy || "");
    setSelectedUser(queryUserId || "");
    if (!queryUserId) setUserSearchTerm("");
  }, [initialProducts, queryUserId]);

  const changePrams = ({ value, key, reset }) => {
    const params = new URLSearchParams(queryParams);
    if (reset) params.set(key, value);
    else params.delete(key);
    if (key === "category") params.delete("subCategory");
    if (key === "nana") params.delete("status");
    if (key === "status") params.delete("nana");

    if (onFilterChange) {
      onFilterChange({
        key,
        value,
        reset,
        allParams: Object.fromEntries(params.entries()),
      });
    }

    if (!isShop) {
      router.replace(
        `/${langPrefix}${admin ? "admin" : "dashboard"}/products${
          admin ? "/all" : ""
        }?${params.toString()}`,
        { scroll: false },
      );
    }
  };

  const handleRangeSelect = (range) => {
    const params = new URLSearchParams(queryParams || searchParams.toString());
    if (range?.from) {
      params.set(
        "startDate",
        range.from.toLocaleDateString("en").replaceAll("/", "-"),
      );
    } else {
      params.delete("startDate");
    }

    if (range?.to) {
      params.set(
        "endDate",
        range.to.toLocaleDateString("en").replaceAll("/", "-"),
      );
    } else {
      params.delete("endDate");
    }

    if (params.get("page")) params.delete("page");

    if (onFilterChange) {
      onFilterChange({ allParams: Object.fromEntries(params.entries()) });
    }

    if (!isShop) {
      router.replace(
        `/${langPrefix}${admin ? "admin" : "dashboard"}/products${
          admin ? "/all" : ""
        }?${params.toString()}`,
        { scroll: false },
      );
    }
  };
  useEffect(() => {
    if (firstRender) return setFirstRender(false);
    changePrams({ value: debouncedName, key: "name", reset: debouncedName });
  }, [debouncedName]);

  // Load selected user data if userId is provided in URL
  useEffect(() => {
    if (!admin || !queryUserId || userSearchTerm) return;
    const loadSelectedUser = async () => {
      if (loadingUsers) return;
      setLoadingUsers(true);
      try {
        const response = await fetch(`/api/users/${queryUserId}`);
        const data = await response.json();
        if (data.success && data.data) {
          setUserSearchTerm(data.data.fullName);
        }
      } catch (error) {
        console.error("Error loading selected user:", error);
      } finally {
        setLoadingUsers(false);
      }
    };
    loadSelectedUser();
  }, [admin, queryUserId, userSearchTerm]);

  // Search users when admin and search term changes
  useEffect(() => {
    if (!admin || !autocompleteOpen) return;
    if (!debouncedUserSearch) return setUsers([]);

    const searchUsers = async () => {
      setLoadingUsers(true);
      try {
        const response = await fetch(
          `/api/users?search=${encodeURIComponent(
            debouncedUserSearch,
          )}&limit=10&client=true`,
        );
        const data = await response.json();
        if (data.success) setUsers(data.data);
      } catch (error) {
        console.error("Error searching users:", error);
        setUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };

    searchUsers();
  }, [debouncedUserSearch, admin, autocompleteOpen]);

  const handleUserSelect = (userId) => {
    if (userId) {
      const selectedUserData = users.find((user) => user._id === userId);
      if (selectedUserData) {
        setSelectedUser(userId);
        setUserSearchTerm(selectedUserData.fullName);
        changePrams({ value: userId, key: "userId", reset: userId });
      }
    } else {
      setSelectedUser("");
      setUserSearchTerm("");
      setUsers([]);
      changePrams({ value: "", key: "userId", reset: false });
    }
  };

  const statusOptions = [
    { key: "all", label: t("all") },
    { key: "approved", label: t("approved") },
    { key: "rejected", label: t("rejected") },
    { key: "pending", label: t("pending") },
    ...(admin ? [{ key: "main", label: t("main") }] : []),
    { key: "hidden", label: t("hidden") },
    { key: "deleted", label: t("deleted") },
    ...(admin ? [{ key: "nana", label: t("nana") }] : []),
  ];

  const sortOptions = [
    { key: "date-desc", label: t("sortBy.newest") },
    { key: "date-asc", label: t("sortBy.oldest") },
  ];

  return (
    <div
      className={
        isShop
          ? "flex flex-col md:gap-3 gap-1.5 animate-in fade-in slide-in-from-top-2 duration-300"
          : `${
              admin ? "lg:grid-cols-4" : "lg:grid-cols-3"
            } grid md:grid-cols-2 md:gap-4 gap-2 mb-4 p-2 md:p-4 rounded-lg shadow-sm bg-white dark:bg-gray-800 items-end`
      }
    >
      <Input
        label={t("productName")}
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t("productNamePlaceholder")}
        variant={isShop ? "bordered" : "flat"}
        className={isShop ? "bg-white rounded-xl" : ""}
        size="sm"
      />
      {admin && !isShop && (
        <div className="relative">
          <Autocomplete
            label="اختيار المستخدم"
            placeholder="ابحث عن مستخدم بالاسم أو الإيميل أو الهاتف"
            inputValue={userSearchTerm}
            onInputChange={setUserSearchTerm}
            selectedKey={selectedUser}
            onSelectionChange={handleUserSelect}
            onOpenChange={setAutocompleteOpen}
            isLoading={loadingUsers}
            allowsCustomValue={false}
            menuTrigger="input"
            items={users}
            size="sm"
            clearButtonProps={{
              onPress: () => {
                handleUserSelect(null);
              },
            }}
          >
            {(user) => (
              <AutocompleteItem
                textValue={user.fullName}
                key={user._id}
                value={user._id}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{user.fullName}</span>
                  <span className="text-sm text-gray-500">{user.email}</span>
                  {user.phone && (
                    <span className="text-xs text-gray-400">{user.phone}</span>
                  )}
                </div>
              </AutocompleteItem>
            )}
          </Autocomplete>
        </div>
      )}

      {!isShop && (
        <>
          <Select
            label={t("status")}
            selectedKeys={[status]}
            variant={isShop ? "bordered" : "flat"}
            className={isShop ? "bg-white rounded-xl" : ""}
            size="sm"
            onChange={({ target: { value } }) => {
              setStatus(value);
              changePrams({
                value: value === "nana" ? true : value,
                key: value === "nana" ? "nana" : "status",
                reset: value !== "all",
              });
            }}
          >
            {statusOptions.map((status) => (
              <SelectItem key={status.key} value={status.key}>
                {status.label}
              </SelectItem>
            ))}
          </Select>

          <Select
            label={t("sortBy.title")}
            selectedKeys={[sortBy]}
            variant={isShop ? "bordered" : "flat"}
            className={isShop ? "bg-white rounded-xl" : ""}
            size="sm"
            onChange={({ target: { value } }) => {
              setSortBy(value);
              changePrams({ value: value, key: "sortBy", reset: value });
            }}
          >
            {sortOptions.map((option) => (
              <SelectItem key={option.key} value={option.key}>
                {option.label}
              </SelectItem>
            ))}
          </Select>
        </>
      )}
      <div className={isShop ? "grid grid-cols-2 gap-2" : "contents"}>
        <Select
          label={t("category")}
          selectedKeys={[category]}
          variant={isShop ? "bordered" : "flat"}
          className={isShop ? "bg-white rounded-xl" : ""}
          size="sm"
          onChange={({ target: { value } }) => {
            setCategory(value);
            setSubCategory("all");
            changePrams({ value, key: "category", reset: value !== "all" });
          }}
        >
          <SelectItem key="all">{t("all")}</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat.key} value={cat.key}>
              {cat.label}
            </SelectItem>
          ))}
        </Select>

        <Select
          label={t("subcategory")}
          selectedKeys={[subCategory]}
          variant={isShop ? "bordered" : "flat"}
          className={isShop ? "bg-white rounded-xl" : ""}
          size="sm"
          onChange={({ target: { value } }) => {
            setSubCategory(value);
            changePrams({ value, key: "subCategory", reset: value !== "all" });
          }}
          disabled={!category || category === "all" || !subCategories[category]}
        >
          <SelectItem key="all">{t("all")}</SelectItem>
          {category &&
            subCategories[category] &&
            subCategories[category].map((sub) => (
              <SelectItem key={sub.key} value={sub.key}>
                {sub.label}
              </SelectItem>
            ))}
        </Select>
      </div>

      {!isShop && (
        <>
          <DateRangePicker
            lang={lang === "" ? "ar" : lang}
            onSelect={handleRangeSelect}
            translate={trans}
            selectedRange={{
              from: searchParams.get("startDate")
                ? new Date(searchParams.get("startDate"))
                : undefined,
              to: searchParams.get("endDate")
                ? new Date(searchParams.get("endDate"))
                : undefined,
            }}
            admin={true}
          />

          {admin && (
            <ButtonComponent
              className="bg-darkNavy py-1 md:py-2 px-3 md:px-6 shadow-[#F48A4233] shadow-lg flex items-center justify-center gap-1 md:gap-2 min-w-fit h-10 md:h-14"
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
                <Print className="w-5 h-5" />
              )}
              <span className="font-semibold text-sm font-IBMPlex text-white">
                {isPrintLoading ? f("exporting") : f("print")}
              </span>
            </ButtonComponent>
          )}
        </>
      )}
    </div>
  );
}
