import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import User from "@/models/User";
import { handleApiError } from "@/lib/errorHandler";
import ExcelJS from "exceljs";
import { authenticateUser } from "@/middleware/auth";
import mongoose from "mongoose";

const statusTextMap = {
  approved: "مقبول",
  rejected: "مرفوض",
  pending: "قيد الانتظار",
  hidden: "مخفي",
  deleted: "محذوف",
};

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name") || "";
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const subCategory = searchParams.get("subCategory");
    const userId = searchParams.get("userId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const user = await authenticateUser();
    if (user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 },
      );
    }

    // Build query (mirroring /api/products/route.js logic)
    let query = { deleted: { $ne: true } };

    if (name) {
      query.$or = [
        { nameAr: { $regex: name, $options: "i" } },
        { nameEn: { $regex: name, $options: "i" } },
      ];
    }

    if (status) {
      if (status === "approved") {
        query = {
          approved: true,
          rejected: false,
          hidden: false,
          deleted: { $ne: true },
        };
      } else if (status === "rejected") {
        query = { rejected: true, deleted: { $ne: true } };
      } else if (status === "pending") {
        query = { approved: false, rejected: false, deleted: { $ne: true } };
      } else if (status === "hidden") {
        query = { hidden: true, deleted: { $ne: true } };
      } else if (status === "deleted") {
        query = { deleted: true };
      } else if (status === "all") {
        query = { deleted: { $ne: true } };
      }
    }

    if (userId) {
      query.owner = new mongoose.Types.ObjectId(userId);
    }

    if (category && category !== "all") query.category = category;
    if (subCategory && subCategory !== "all") query.subCategory = subCategory;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        query.createdAt.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const sort = {
      [sortBy === "date-desc"
        ? "createdAt"
        : sortBy === "date-asc"
          ? "createdAt"
          : sortBy]: sortOrder === "desc" || sortBy === "date-desc" ? -1 : 1,
    };

    // Fetch products and populate owner
    const products = await Product.find(query)
      .populate("owner", "fullName phone email")
      .sort(sort)
      .lean();

    // ── Build Excel Workbook ──
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "استأجر - Estajer";
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet("المنتجات", {
      properties: { defaultColWidth: 20 },
      views: [{ rightToLeft: true }],
    });

    // ── Title Row ──
    const titleRow = worksheet.addRow(["تقرير المنتجات - استأجر"]);
    worksheet.mergeCells("A1:M1");
    titleRow.height = 45;
    titleRow.getCell(1).font = {
      name: "Arial",
      size: 18,
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    titleRow.getCell(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0D092B" },
    };
    titleRow.getCell(1).alignment = {
      horizontal: "center",
      vertical: "middle",
    };

    // ── Date Row ──
    const dateStr = new Date().toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const dateRow = worksheet.addRow([`تاريخ التصدير: ${dateStr}`]);
    worksheet.mergeCells("A2:M2");
    dateRow.height = 28;
    dateRow.getCell(1).font = {
      name: "Arial",
      size: 11,
      color: { argb: "FF555555" },
    };
    dateRow.getCell(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFEAEEF3" },
    };
    dateRow.getCell(1).alignment = { horizontal: "center", vertical: "middle" };

    // ── Filter Info Row ──
    const filterParts = [];
    if (name) filterParts.push(`البحث: ${name}`);
    if (status && status !== "all")
      filterParts.push(`الحالة: ${statusTextMap[status] || status}`);
    if (category && category !== "all") filterParts.push(`القسم: ${category}`);
    if (subCategory && subCategory !== "all")
      filterParts.push(`القسم الفرعي: ${subCategory}`);
    if (startDate) filterParts.push(`من: ${startDate}`);
    if (endDate) filterParts.push(`إلى: ${endDate}`);

    if (filterParts.length > 0) {
      const filterRow = worksheet.addRow([
        `الفلاتر: ${filterParts.join(" | ")}`,
      ]);
      worksheet.mergeCells("A3:M3");
      filterRow.height = 25;
      filterRow.getCell(1).font = {
        name: "Arial",
        size: 10,
        italic: true,
        color: { argb: "FF777777" },
      };
      filterRow.getCell(1).alignment = {
        horizontal: "center",
        vertical: "middle",
      };
    }

    worksheet.addRow([]); // empty separator

    // ── Header Row ──
    const headers = [
      "اسم المنتج (عربي)",
      "اسم المنتج (إنجليزي)",
      "المالك",
      "ايميل المالك",
      "القسم",
      "القسم الفرعي",
      "نوع التسعير",
      "السعر",
      "الكمية",
      "المدينة",
      "حالة المنتج",
      "التقييم",
      "تاريخ الإضافة",
    ];

    const headerRow = worksheet.addRow(headers);
    headerRow.height = 35;
    headerRow.eachCell((cell) => {
      cell.font = {
        name: "Arial",
        size: 11,
        bold: true,
        color: { argb: "FFFFFFFF" },
      };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF48A42" },
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        top: { style: "thin", color: { argb: "FFD97B36" } },
        bottom: { style: "thin", color: { argb: "FFD97B36" } },
        left: { style: "thin", color: { argb: "FFD97B36" } },
        right: { style: "thin", color: { argb: "FFD97B36" } },
      };
    });

    // ── Data Rows ──
    products.forEach((p, index) => {
      let currentStatus = "قيد الانتظار";
      if (p.deleted) currentStatus = "محذوف";
      else if (p.rejected) currentStatus = "مرفوض";
      else if (p.hidden) currentStatus = "مخفي";
      else if (p.approved) currentStatus = "مقبول";

      const row = worksheet.addRow([
        p.nameAr || "—",
        p.nameEn || "—",
        p.owner?.fullName || "—",
        p.owner?.email || "—",
        p.category || "—",
        p.subCategory || "—",
        p.pricingModel === "packages" ? "باقات" : "يومي",
        p.rental?.value || 0,
        p.quantity || 0,
        p.addressAr?.city || "—",
        currentStatus,
        p.rating?.average || 0,
        new Date(p.createdAt).toLocaleDateString("ar-SA"),
      ]);

      const bgColor = index % 2 === 0 ? "FFF9FAFC" : "FFFFFFFF";
      row.height = 28;
      row.eachCell((cell, colNumber) => {
        cell.font = { name: "Arial", size: 10 };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: bgColor },
        };
        cell.border = {
          bottom: { style: "thin", color: { argb: "FFEAEEF3" } },
          left: { style: "hair", color: { argb: "FFEAEEF3" } },
          right: { style: "hair", color: { argb: "FFEAEEF3" } },
        };

        if (colNumber === 11) {
          // Status
          if (currentStatus === "مقبول")
            cell.font = { color: { argb: "FF008000" }, bold: true };
          if (currentStatus === "مرفوض")
            cell.font = { color: { argb: "FFFF0000" }, bold: true };
          if (currentStatus === "محذوف")
            cell.font = { color: { argb: "FF888888" }, italic: true };
        }
      });
    });

    // ── Summary Row ──
    if (products.length > 0) {
      worksheet.addRow([]);
      const summaryRow = worksheet.addRow([
        `إجمالي المنتجات: ${products.length}`,
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
      ]);
      worksheet.mergeCells(`A${summaryRow.number}:M${summaryRow.number}`);
      summaryRow.height = 30;
      summaryRow.getCell(1).font = {
        name: "Arial",
        size: 12,
        bold: true,
        color: { argb: "FF0D092B" },
      };
      summaryRow.getCell(1).alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      summaryRow.getCell(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFEAEEF3" },
      };
    }

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="products-${Date.now()}.xlsx"`,
      },
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/products/export",
      method: "GET",
      req,
    });
  }
}
