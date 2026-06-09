"use client";

import React, { useMemo } from "react";
import {
  FaEdit,
  FaTrash,
  FaExternalLink,
  FaGripVertical,
} from "@/components/ui/svgs/AdminIcons";
import { useTranslations } from "@/hooks/useTranslations";
import Link from "next/link";
import { anyImgUrl } from "@/utils/ImageUrl";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  User,
  Switch,
  Tooltip,
  Skeleton,
  Chip,
} from "@heroui/react";

export default function PartnerTable({
  partners,
  isLoading,
  onEdit,
  onDelete,
  onToggleStatus,
  onReorder,
  lang,
  translate,
}) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`admin.partners.${key}`);

  const columns = useMemo(() => [
    { name: t("logo"), uid: "logo" },
    { name: t("name"), uid: "name" },
    { name: t("slug"), uid: "slug" },
    { name: t("status"), uid: "status" },
    { name: t("actions"), uid: "actions" },
  ], [t]);

  const renderCell = React.useCallback((partner, columnKey) => {
    const cellValue = partner[columnKey];

    switch (columnKey) {
      case "logo":
        return (
          <User
            avatarProps={{
              radius: "lg",
              src: anyImgUrl({
                src: partner.logo,
                size: 40,
                quality: 90,
              }),
            }}
            name=""
          />
        );
      case "name":
        return (
          <div className="flex flex-col">
            <span className="font-bold text-darkNavy">
              {lang === "ar" ? partner.nameAr : partner.nameEn}
            </span>
            <span className="text-xs text-neutral-400">
              {lang === "ar" ? partner.nameEn : partner.nameAr}
            </span>
          </div>
        );
      case "slug":
        return (
          <Chip
            size="sm"
            variant="flat"
            color="primary"
            className="font-mono text-xs"
          >
            {partner.slug}
          </Chip>
        );
      case "status":
        return (
          <div className="flex items-center gap-2">
            <Switch
              size="sm"
              color="primary"
              isSelected={partner.isActive}
              onValueChange={() => onToggleStatus(partner)}
            />
            <span className={`text-xs font-bold uppercase tracking-wider ${partner.isActive ? "text-primary" : "text-neutral-500"}`}>
              {partner.isActive ? t("active") : t("inactive")}
            </span>
          </div>
        );
      case "actions":
        return (
          <div className="flex items-center justify-end gap-1">
            <Tooltip content={t("reorder")}>
              <button
                onClick={() => onReorder(partner)}
                className="p-2 text-neutral-400 hover:text-primary transition-colors"
              >
                <FaGripVertical className="w-5 h-5" />
              </button>
            </Tooltip>
            <Tooltip content={t("view")}>
              <Link
                href={`/${lang}/partners/${partner.slug}`}
                target="_blank"
                className="p-2 text-neutral-400 hover:text-primary transition-colors"
              >
                <FaExternalLink className="w-5 h-5" />
              </Link>
            </Tooltip>
            <Tooltip content={t("edit")}>
              <button
                onClick={() => onEdit(partner)}
                className="p-2 text-neutral-400 hover:text-blue-500 transition-colors"
              >
                <FaEdit className="w-5 h-5" />
              </button>
            </Tooltip>
            <Tooltip content={t("delete")} color="danger">
              <button
                onClick={() => onDelete(partner._id)}
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
  }, [lang, t, onEdit, onDelete, onToggleStatus, onReorder]);

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <Table 
      aria-label="Partners table"
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
      <TableBody 
        items={partners}
        emptyContent={t("noPartners")}
      >
        {(item) => (
          <TableRow key={item._id} className="hover:bg-neutral-50/30 transition-colors">
            {(columnKey) => (
              <TableCell>{renderCell(item, columnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
