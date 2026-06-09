"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FaPlus, FaSearch } from "@/components/ui/svgs/AdminIcons";
import { useTranslations } from "@/hooks/useTranslations";
import Button from "@/components/ui/Button";
import { toast } from "@/utils/toast";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ShopTable from "./ShopTable";
import { revalidateWithTag } from "@/actions/revalidateTag";
import SectionOrderModal from "../partners/modal/SectionOrderModal";
import { Input, Select, SelectItem, Pagination } from "@heroui/react";
import { useDebounce } from "use-debounce";

export default function ShopContainer({ lang, translate }) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`admin.shops.${key}`);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [shops, setShops] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || "",
  );
  const [debouncedSearch] = useDebounce(searchTerm, 500);

  const statusFilter = searchParams.get("isActive") || "all";
  const currentPage = Number(searchParams.get("page")) || 1;

  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
  const [reorderShop, setReorderShop] = useState(null);

  const fetchShops = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams(searchParams);
      params.set("all", "true");

      const res = await fetch(`/api/shops?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setShops(data.data);
        setPagination(data.pagination);
      } else {
        toast.error(data.error || "Failed to fetch shops");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while fetching shops");
    } finally {
      setIsLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  // Handle debounced search
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    } else {
      params.delete("search");
    }
    params.set("page", "1");

    // Only push if search term actually changed from URL
    if (debouncedSearch !== (searchParams.get("search") || "")) {
      router.push(`${pathname}?${params.toString()}`);
    }
  }, [debouncedSearch, pathname, router, searchParams]);

  const handleStatusChange = (e) => {
    const status = e.target.value;
    const params = new URLSearchParams(searchParams);
    if (status && status !== "all") params.set("isActive", status);
    else params.delete("isActive");
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleAddShop = () => {
    router.push(`${pathname}/add`);
  };

  const handleEditShop = (shop) => {
    router.push(`${pathname}/${shop._id}`);
  };

  const handleDeleteShop = async (id) => {
    if (!confirm(t("confirmDelete"))) return;

    try {
      const res = await fetch(`/api/shops/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        toast.success(t("deleteSuccess"));
        fetchShops();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    }
  };

  const handleToggleStatus = async (shop) => {
    try {
      const newStatus = !shop.isActive;
      const res = await fetch(`/api/shops/${shop._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newStatus }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(t("updateSuccess"));
        await revalidateWithTag(`shop-${shop.slug}`);
        fetchShops();
      } else {
        toast.error(data.error || "Failed to update status");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    }
  };

  const handleReorder = (shop) => {
    setReorderShop(shop);
    setIsReorderModalOpen(true);
  };

  const handleSaveOrder = async (updatedShop) => {
    try {
      const res = await fetch(`/api/shops/${updatedShop._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aboutUsOrder: updatedShop.aboutUsOrder,
          howItWorksOrder: updatedShop.howItWorksOrder,
          shopCategoriesOrder: updatedShop.shopCategoriesOrder,
          reviewsOrder: updatedShop.reviewsOrder,
          offerBanners: updatedShop.offerBanners,
          sliders: updatedShop.sliders,
        }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(t("updateSuccess"));
        await revalidateWithTag(`shop-${updatedShop.slug}`);
        setIsReorderModalOpen(false);
        fetchShops();
      } else {
        toast.error(data.error || "Failed to update order");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-[21px] shadow-sm border border-neutral-100 p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-4 min-w-[300px]">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder={t("name")}
            startContent={<FaSearch className="text-neutral-400 w-4 h-4" />}
            value={searchTerm}
            onClear={() => setSearchTerm("")}
            onValueChange={setSearchTerm}
            variant="bordered"
            radius="lg"
          />

          <Select
            className="max-w-xs"
            placeholder={t("status")}
            selectedKeys={[statusFilter]}
            onChange={handleStatusChange}
            variant="bordered"
            radius="lg"
            disallowEmptySelection
          >
            <SelectItem key="all" value="all">
              {t("status")}
            </SelectItem>
            <SelectItem key="true" value="true">
              {t("active")}
            </SelectItem>
            <SelectItem key="false" value="false">
              {t("inactive")}
            </SelectItem>
          </Select>
        </div>

        <Button
          onPress={handleAddShop}
          color="primary"
          startContent={<FaPlus className="w-4 h-4" />}
          className="font-bold px-8 h-12 rounded-xl shadow-lg shadow-primary/20"
        >
          {t("addShop")}
        </Button>
      </div>

      <div className="bg-white rounded-[21px] shadow-sm border border-neutral-100 overflow-hidden">
        <ShopTable
          shops={shops}
          isLoading={isLoading}
          onEdit={handleEditShop}
          onDelete={handleDeleteShop}
          onToggleStatus={handleToggleStatus}
          onReorder={handleReorder}
          lang={lang}
          translate={translate}
        />

        {pagination.pages > 1 && (
          <div className="p-6 border-t border-neutral-100 flex items-center justify-center">
            <Pagination
              isCompact
              showControls
              showShadow
              color="primary"
              page={currentPage}
              total={pagination.pages}
              onChange={handlePageChange}
              radius="lg"
            />
          </div>
        )}
      </div>

      <SectionOrderModal
        isOpen={isReorderModalOpen}
        onClose={() => setIsReorderModalOpen(false)}
        onSave={handleSaveOrder}
        partner={reorderShop}
        lang={lang}
        translate={translate}
        translatePath="admin.shops"
        shop={true}
      />
    </div>
  );
}
