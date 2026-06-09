import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Ticket from "@/models/Ticket";
import { handleApiError } from "@/lib/errorHandler";
import ExcelJS from "exceljs";
import { authenticateUser } from "@/middleware/auth";
import mongoose from "mongoose";

const statusTextMap = {
  new: "جديد",
  inprogress: "قيد الحل",
  solved: "تم الحل",
  cancelled: "تم الالغاء",
};

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const dateAdded = searchParams.get("dateAdded") || "all";

    const user = await authenticateUser();
    if (user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 },
      );
    }

    // Build query matches GET /api/tickets logic
    let query = {};

    if (status && status !== "all") {
      query.status = status;
    }

    if (dateAdded && dateAdded !== "all") {
      const now = new Date();
      if (dateAdded === "today") {
        query.createdAt = {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lte: new Date(new Date().setHours(23, 59, 59, 999)),
        };
      } else if (dateAdded === "week") {
        const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        query.createdAt = { $gte: lastWeek };
      } else if (dateAdded === "month") {
        const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        query.createdAt = { $gte: lastMonth };
      }
    }

    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.$or = [
        { name: { $regex: escapedSearch, $options: "i" } },
        { email: { $regex: escapedSearch, $options: "i" } },
        { subject: { $regex: escapedSearch, $options: "i" } },
      ];
      if (mongoose.Types.ObjectId.isValid(search)) {
        query.$or.push({ _id: search });
      }
    }

    // Fetch matching tickets
    const tickets = await Ticket.find(query)
      .populate("user", "fullName email")
      .sort({ createdAt: -1 })
      .lean();

    // ── Build Excel Workbook ──
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "استأجر - Estajer";
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet("التذاكر", {
      properties: { defaultColWidth: 20 },
      views: [{ rightToLeft: true }],
    });

    // ── Title Row ──
    const titleRow = worksheet.addRow(["تقرير تذاكر الدعم الفني - استأجر"]);
    worksheet.mergeCells("A1:G1");
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
    worksheet.mergeCells("A2:G2");
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
    dateRow.getCell(1).alignment = {
      horizontal: "center",
      vertical: "middle",
    };

    // ── Filter Info Row ──
    const filterParts = [];
    if (search) filterParts.push(`البحث: ${search}`);
    if (status && status !== "all")
      filterParts.push(`الحالة: ${statusTextMap[status] || status}`);
    if (dateAdded && dateAdded !== "all")
      filterParts.push(`تاريخ الإضافة: ${dateAdded}`);

    if (filterParts.length > 0) {
      const filterRow = worksheet.addRow([
        `الفلاتر: ${filterParts.join(" | ")}`,
      ]);
      worksheet.mergeCells("A3:G3");
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
      "رقم التذكرة",
      "الاسم",
      "البريد الإلكتروني",
      "رقم الهاتف",
      "الموضوع",
      "الحالة",
      "تاريخ الإنشاء",
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
      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      cell.border = {
        top: { style: "thin", color: { argb: "FFD97B36" } },
        bottom: { style: "thin", color: { argb: "FFD97B36" } },
        left: { style: "thin", color: { argb: "FFD97B36" } },
        right: { style: "thin", color: { argb: "FFD97B36" } },
      };
    });

    // ── Data Rows ──
    tickets.forEach((t, index) => {
      const row = worksheet.addRow([
        t._id?.toString() || "—",
        t.name || t.user?.fullName || "—",
        t.email || t.user?.email || "—",
        t.phone || "—",
        t.subject || "—",
        statusTextMap[t.status] || t.status,
        new Date(t.createdAt).toLocaleDateString("ar-SA"),
      ]);

      const bgColor = index % 2 === 0 ? "FFF9FAFC" : "FFFFFFFF";
      row.height = 28;
      row.eachCell((cell) => {
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
      });
    });

    // ── Summary Row ──
    if (tickets.length > 0) {
      worksheet.addRow([]);
      const summaryRow = worksheet.addRow([
        `إجمالي التذاكر: ${tickets.length}`,
        "",
        "",
        "",
        "",
        "",
        "",
      ]);
      worksheet.mergeCells(`A${summaryRow.number}:G${summaryRow.number}`);
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
        "Content-Disposition": `attachment; filename="tickets-${Date.now()}.xlsx"`,
      },
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/tickets/export",
      method: "GET",
      req,
    });
  }
}
