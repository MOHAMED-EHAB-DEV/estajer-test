"use client";
import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Tooltip,
} from "@heroui/react";
import { Edit } from "@/components/ui/svgs/icons/EditSvg";
import { Delete } from "@/components/ui/svgs/icons/DeleteSvg";
import { Eye } from "@/components/ui/svgs/icons/EyeSvg";
import { anyImgUrl } from "@/utils/ImageUrl";
import Image from "next/image";

const TableBanners = ({ banners, loading, onEdit, onDelete, translate }) => {
  const t = (key) => translate(`admin.banners.${key}`);

  const renderCell = (banner, columnKey) => {
    switch (columnKey) {
      case "image":
        return (
          <div className="flex gap-2 items-center">
            <div className="relative w-20 h-12 rounded-lg overflow-hidden border border-gray-100 group">
              <Image
                unoptimized
                fill
                src={anyImgUrl({
                  src: banner.image,
                  size: 100,
                })}
                alt={banner.altAr}
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-[10px] font-bold">AR</span>
              </div>
            </div>
            {banner.imageEn && (
              <div className="relative w-20 h-12 rounded-lg overflow-hidden border border-gray-100 group">
                <Image
                  src={anyImgUrl({
                    src: banner.imageEn,
                    size: 100,
                  })}
                  alt={banner.altEn}
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-[10px] font-bold">EN</span>
                </div>
              </div>
            )}
          </div>
        );
      case "alt":
        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium">{banner.altAr}</span>
            <span className="text-xs text-gray-400">{banner.altEn}</span>
          </div>
        );
      case "link":
        return (
          <a
            href={banner.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline text-sm truncate max-w-[200px] block"
          >
            {banner.link}
          </a>
        );
      case "status":
        return (
          <div className="flex flex-col gap-1">
            <Chip
              color={banner.active ? "success" : "danger"}
              variant="flat"
              size="sm"
            >
              {banner.active ? "نشط" : "غير نشط"}
            </Chip>
            {banner.nana && (
              <Chip color="success" variant="flat" size="sm">
                nana
              </Chip>
            )}
          </div>
        );
      case "place":
        return (
          <div className="flex flex-col gap-1">
            <Chip
              color="secondary"
              variant="dot"
              size="sm"
              className="capitalize"
            >
              {banner.place === "home"
                ? t("home")
                : banner.place === "category"
                  ? t("category")
                  : t("profile")}
            </Chip>
            {banner.place === "category" && banner.categoryId && (
              <span className="text-[10px] text-gray-500">
                {translate === "ar"
                  ? banner.categoryId.nameAr
                  : banner.categoryId.nameEn}
              </span>
            )}
            {banner.place === "profile" && banner.userId && (
              <span className="text-[10px] text-gray-500">
                {banner.userId.fullName}
              </span>
            )}
          </div>
        );
      case "actions":
        return (
          <div className="flex items-center gap-4">
            <Tooltip content="Edit">
              <span
                className="text-lg text-default-400 cursor-pointer active:opacity-50"
                onClick={() => onEdit(banner)}
              >
                <Edit />
              </span>
            </Tooltip>
            <Tooltip color="danger" content="Delete">
              <span
                className="text-lg text-danger cursor-pointer active:opacity-50"
                onClick={() => onDelete([banner._id])}
              >
                <Delete />
              </span>
            </Tooltip>
          </div>
        );
      default:
        return banner[columnKey];
    }
  };

  const columns = [
    { name: "الصورة", uid: "image" },
    { name: "النص البديل", uid: "alt" },
    { name: "الرابط", uid: "link" },
    { name: "المكان", uid: "place" },
    { name: "الترتيب", uid: "order" },
    { name: "الحالة", uid: "status" },
    { name: "الإجراءات", uid: "actions" },
  ];

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
      <Table
        aria-label="Banners table"
        classNames={{
          wrapper: "min-h-[400px] p-0 shadow-none rounded-none",
          th: "bg-gray-50 text-darkNavy font-semibold text-medium py-6 h-auto",
          td: "py-4 text-darkNavy font-medium",
        }}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={column.uid === "actions" ? "center" : "start"}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          items={banners}
          emptyContent={loading ? "جاري التحميل..." : "لا توجد بانرات"}
        >
          {(item) => (
            <TableRow key={item._id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TableBanners;
