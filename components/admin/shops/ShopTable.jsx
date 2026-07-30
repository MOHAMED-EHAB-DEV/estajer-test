"use client";

import React, { useMemo, useState } from "react";
import { format } from "date-fns";
import {
  FaEdit,
  FaTrash,
  FaExternalLink,
  FaGripVertical,
  FaCheck,
  FaTimes,
} from "@/components/ui/svgs/AdminIcons";
import { useTranslations } from "@/hooks/useTranslations";
import Link from "next/link";
import Image from "next/image";
import { anyImgUrl } from "@/utils/ImageUrl";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/Table";
import { Switch } from "@/components/ui/Switch";
import { Tooltip } from "@/components/ui/Tooltip";

const ShopCommissionCell = ({ shop, onUpdateCommission }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [val, setVal] = useState(shop.shopCommission ?? 5);

  const handleSave = async () => {
    const parsedVal = parseFloat(val);
    if (!isNaN(parsedVal) && parsedVal !== shop.shopCommission) {
      await onUpdateCommission(shop, parsedVal);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setVal(shop.shopCommission ?? 5);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <input
          type="number"
          min="0"
          max="100"
          step="0.5"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          className="w-10 px-1.5 py-0.5 text-center rounded-lg border border-primary focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-all text-xs font-medium"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") handleCancel();
          }}
        />
        <span className="text-xs text-neutral-400 font-semibold">%</span>
        <button
          onClick={handleCancel}
          className="p-1 text-danger hover:bg-danger/10 rounded-md transition-colors"
        >
          <FaTimes size={14} />
        </button>
        <button
          onClick={handleSave}
          className="p-1 text-success hover:bg-success/10 rounded-md transition-colors"
        >
          <FaCheck size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 ">
      <span className="font-semibold text-darkNavy">
        {shop.shopCommission ?? 5}%
      </span>
      <button
        onClick={() => setIsEditing(true)}
        className="p-1 text-neutral-400 hover:text-primary hover:bg-primary/10 rounded-md"
      >
        <FaEdit size={16} />
      </button>
    </div>
  );
};

const ShopPlanCell = ({ shop, onUpdatePlan, lang }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [val, setVal] = useState(shop.plan ?? "starter");

  const handleSave = async (newPlan) => {
    if (newPlan !== shop.plan) {
      await onUpdatePlan(shop, newPlan);
    }
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const newPlan = e.target.value;
    setVal(newPlan);
    handleSave(newPlan);
  };

  const planLabels = {
    starter: lang === "ar" ? "Starter (مبتدئ)" : "Starter",
    growth: lang === "ar" ? "Growth (نمو)" : "Growth",
  };

  if (isEditing) {
    return (
      <select
        value={val}
        onChange={handleChange}
        onBlur={() => setIsEditing(false)}
        className="px-2 py-1 rounded-lg border border-primary focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-all text-xs font-semibold bg-white cursor-pointer"
        autoFocus
      >
        <option value="starter">{planLabels.starter}</option>
        <option value="growth">{planLabels.growth}</option>
      </select>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span
        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
          shop.plan === "growth"
            ? "bg-green-50 text-green-700 border border-green-200"
            : "bg-orange-50 text-orange-700 border border-orange-200"
        }`}
      >
        {shop.plan === "growth" ? "Growth" : "Starter"}
      </span>
      <button
        onClick={() => setIsEditing(true)}
        className="p-1 text-neutral-400 hover:text-primary hover:bg-primary/10 rounded-md"
      >
        <FaEdit size={16} />
      </button>
    </div>
  );
};

export default function ShopTable({
  shops,
  isLoading,
  onEdit,
  onDelete,
  onToggleStatus,
  onReorder,
  onUpdateCommission,
  onUpdatePlan,
  lang,
  translate,
}) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`admin.allShops.${key}`);

  const columns = useMemo(
    () => [
      { name: t("logo"), uid: "logo" },
      { name: t("name"), uid: "name" },
      { name: t("owner"), uid: "owner" },
      { name: t("shopCommission"), uid: "shopCommission" },
      { name: t("shopPlan"), uid: "shopPlan" },
      { name: t("createdDate"), uid: "createdDate" },
      { name: t("endDate"), uid: "endDate" },
      { name: t("status"), uid: "status" },
      { name: t("actions"), uid: "actions" },
    ],
    [t, lang],
  );

  const renderCell = React.useCallback(
    (shop, columnKey) => {
      const cellValue = shop[columnKey];

      switch (columnKey) {
        case "logo":
          return (
            <div className="inline-flex items-center gap-2">
              <div className="relative overflow-hidden shrink-0 bg-default-100 w-8 h-8 rounded-xl">
                <Image
                  src={anyImgUrl({
                    src: shop.logo,
                    size: 40,
                    quality: 90,
                  })}
                  alt=""
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </div>
          );
        case "name":
          return (
            <div className="flex flex-col">
              <span className="font-bold text-darkNavy">
                {lang === "ar" ? shop.nameAr : shop.nameEn}
              </span>
              <span className="text-xs text-neutral-400">
                {lang === "ar" ? shop.nameEn : shop.nameAr}
              </span>
            </div>
          );
        case "owner":
          return (
            <div className="flex flex-col">
              <span className="text-sm font-medium text-darkNavy">
                {shop.owner?.fullName || "N/A"}
              </span>
              <span className="text-xs text-neutral-400">
                {shop.owner?.email || ""}
              </span>
            </div>
          );
        case "shopCommission":
          return (
            <ShopCommissionCell
              shop={shop}
              onUpdateCommission={onUpdateCommission}
            />
          );
        case "shopPlan":
          return (
            <ShopPlanCell shop={shop} onUpdatePlan={onUpdatePlan} lang={lang} />
          );
        case "createdDate":
          return (
            <span className="text-sm font-medium text-darkNavy">
              {shop.createdAt
                ? format(new Date(shop.createdAt), "yyyy/MM/dd")
                : "—"}
            </span>
          );
        case "endDate":
          const expiresAt = shop.owner?.shopPlanExpiresAt;
          return (
            <div className="flex flex-col">
              <span
                className={`text-sm font-medium ${shop.isExpired ? "text-danger font-bold" : "text-darkNavy"}`}
              >
                {expiresAt ? format(new Date(expiresAt), "yyyy/MM/dd") : "—"}
              </span>
              {shop.isExpired && (
                <span className="text-[10px] text-danger font-bold bg-danger/10 border border-danger/20 rounded-md px-1.5 py-0.5 w-fit uppercase tracking-tight mt-0.5">
                  {t("expired")}
                </span>
              )}
            </div>
          );
        case "status":
          return (
            <div className="flex items-center gap-2">
              <Switch
                size="sm"
                color="primary"
                aria-label={shop.isActive ? t("active") : t("inactive")}
                isSelected={shop.isActive}
                onValueChange={() => onToggleStatus(shop)}
              />
              <span
                className={`text-xs font-bold uppercase tracking-wider ${shop.isActive ? "text-primary" : "text-neutral-500"}`}
              >
                {shop.isActive ? t("active") : t("inactive")}
              </span>
            </div>
          );
        case "actions":
          return (
            <div className="flex items-center justify-end gap-1">
              <Tooltip content={t("reorder")}>
                <button
                  onClick={() => onReorder(shop)}
                  className="p-2 text-neutral-400 hover:text-primary transition-colors"
                >
                  <FaGripVertical className="w-5 h-5" />
                </button>
              </Tooltip>
              <Tooltip content={t("view")}>
                <Link
                  href={`/${lang}/shops/${shop.slug}`}
                  target="_blank"
                  className="p-2 text-neutral-400 hover:text-primary transition-colors"
                >
                  <FaExternalLink className="w-5 h-5" />
                </Link>
              </Tooltip>
              <Tooltip content={t("edit")}>
                <button
                  onClick={() => onEdit(shop)}
                  className="p-2 text-neutral-400 hover:text-blue-500 transition-colors"
                >
                  <FaEdit className="w-5 h-5" />
                </button>
              </Tooltip>
              <Tooltip content={t("delete")} color="danger">
                <button
                  onClick={() => onDelete(shop._id)}
                  className="p-2 text-neutral-400 hover:text-danger transition-colors"
                >
                  <FaTrash className="w-5 h-5" />
                </button>
              </Tooltip>
            </div>
          );
        default:
          return cellValue;
      }
    },
    [
      lang,
      t,
      onEdit,
      onDelete,
      onToggleStatus,
      onReorder,
      onUpdateCommission,
      onUpdatePlan,
    ],
  );

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 w-full rounded-xl relative overflow-hidden bg-default-300 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent">
            <div className="opacity-0 pointer-events-none"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <Table
      aria-label="Shops table"
      removeWrapper
      classNames={{
        thead: "bg-neutral-50/50",
        th: "bg-transparent text-neutral-600 font-semibold text-sm px-6 py-4",
        td: "px-6 py-4 border-b border-neutral-100",
      }}
    >
      <TableHeader columns={columns}>
        {(column) => (
          <TableColumn
            key={column.uid}
            align={column.uid === "actions" ? "end" : "start"}
          >
            {column.name}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody items={shops} emptyContent={t("noShops")}>
        {(item) => (
          <TableRow
            key={item._id}
            className="hover:bg-neutral-50/30 transition-colors"
          >
            {(columnKey) => (
              <TableCell>{renderCell(item, columnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
