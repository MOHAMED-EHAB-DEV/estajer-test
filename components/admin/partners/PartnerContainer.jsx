"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { FaPlus, FaSearch } from "@/components/ui/svgs/AdminIcons";
import { useTranslations } from "@/hooks/useTranslations";
import { toast } from "@/utils/toast";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import PartnerTable from "./PartnerTable";
import { revalidateWithTag } from "@/actions/revalidateTag";
import SectionOrderModal from "./modal/SectionOrderModal";
import Button from "@/components/ui/Button";
import { Input, Select, SelectItem, Pagination } from "@heroui/react";
import { useDebounce } from "use-debounce";

export default function PartnerContainer({ lang, translate }) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`admin.partners.${key}`);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [partners, setPartners] = useState([]);
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
  const [reorderPartner, setReorderPartner] = useState(null);

  const fetchPartners = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams(searchParams);
      params.set("all", "true"); // Admin wants all

      const res = await fetch(`/api/partners?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setPartners(data.data);
        setPagination(data.pagination);
      } else {
        toast.error(data.error || "Failed to fetch partners");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while fetching partners");
    } finally {
      setIsLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

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

  const handleAddPartner = () => {
    router.push(`${pathname}/add`);
  };

  const handleEditPartner = (partner) => {
    router.push(`${pathname}/${partner._id}`);
  };

  const handleDeletePartner = async (id) => {
    if (!confirm(t("confirmDelete"))) return;

    try {
      const res = await fetch(`/api/partners/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        toast.success(t("deleteSuccess"));
        fetchPartners();
      } else {
        toast.error(data.error || "Failed to delete partner");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    }
  };

  const handleToggleStatus = async (partner) => {
    try {
      const newStatus = !partner.isActive;
      const res = await fetch(`/api/partners/${partner._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newStatus }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(t("updateSuccess"));
        await revalidateWithTag(`partner-${partner.slug}`);
        fetchPartners();
      } else {
        toast.error(data.error || "Failed to update status");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    }
  };

  const handleReorder = (partner) => {
    setReorderPartner(partner);
    setIsReorderModalOpen(true);
  };

  const handleSaveOrder = async (updatedPartner) => {
    try {
      const res = await fetch(`/api/partners/${updatedPartner._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aboutUsOrder: updatedPartner.aboutUsOrder,
          howItWorksOrder: updatedPartner.howItWorksOrder,
          offerBanners: updatedPartner.offerBanners,
          sliders: updatedPartner.sliders,
        }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(t("updateSuccess"));
        await revalidateWithTag(`partner-${updatedPartner.slug}`);
        setIsReorderModalOpen(false);
        fetchPartners();
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
          onPress={handleAddPartner}
          color="primary"
          startContent={<FaPlus className="w-4 h-4" />}
          className="font-bold px-8 h-12 rounded-xl shadow-lg shadow-primary/20"
        >
          {t("addPartner")}
        </Button>
      </div>

      <div className="bg-white rounded-[21px] shadow-sm border border-neutral-100 overflow-hidden">
        <PartnerTable
          partners={partners}
          isLoading={isLoading}
          onEdit={handleEditPartner}
          onDelete={handleDeletePartner}
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
        partner={reorderPartner}
        lang={lang}
        translate={translate}
      />
    </div>
  );
}
