import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Product from "@/models/Product";
import { handleApiError } from "@/lib/errorHandler";
import ExcelJS from "exceljs";
import { authenticateUser } from "@/middleware/auth";

const accountTypeTextMap = {
  personal: "شخصي",
  freelance: "عمل حر",
  company: "شركة",
  admin: "مسؤول",
};

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const accountType = searchParams.get("accountType") || "";
    const isVerified = searchParams.get("isVerified");
    const isBanned = searchParams.get("isBanned");
    const isRenter = searchParams.get("isRenter");
    const hasApprovedProduct = searchParams.get("hasApprovedProduct");
    const reviewRequested = searchParams.get("reviewRequested");
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const user = await authenticateUser();
    if (user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 },
      );
    }

    // Build query (same logic as /api/users)
    let query = {};

    const escapeRegex = (str) => {
      return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    };

    if (search) {
      const escapedSearch = escapeRegex(search);
      query.$or = [
        { fullName: { $regex: escapedSearch, $options: "i" } },
        { email: { $regex: escapedSearch, $options: "i" } },
        { phone: { $regex: escapedSearch, $options: "i" } },
        { pathName: { $regex: escapedSearch, $options: "i" } },
        {
          "companyDetails.companyName": {
            $regex: escapedSearch,
            $options: "i",
          },
        },
      ];
    }

    if (accountType && accountType !== "all") {
      if (accountType === "freelance") {
        query.accountType = "personal";
        query.documentCode = { $exists: true, $ne: "" };
      } else {
        query.accountType = accountType;
      }
    }

    if (isVerified && isVerified !== "all") {
      query.isVerified = isVerified === "true";
    }

    if (isBanned && isBanned !== "all") {
      query.isBanned = isBanned === "true";
    }

    if (isRenter && isRenter !== "all") {
      query.isRenter = isRenter === "true";
    }

    if (hasApprovedProduct === "true") {
      const owners = await Product.distinct("owner", {
        approved: true,
        deleted: { $ne: true },
      });
      query._id = { $in: owners };
    }

    if (startDateParam || endDateParam) {
      query.createdAt = {};
      if (startDateParam) {
        const start = new Date(startDateParam);
        start.setHours(0, 0, 0, 0);
        query.createdAt.$gte = start;
      }
      if (endDateParam) {
        const end = new Date(endDateParam);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Fetch ALL matching users
    const users = await User.find(query)
      .select("-password -verificationCode")
      .sort(sort)
      .lean();

    // ── Build Excel Workbook ──
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "استأجر - Estajer";
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet("المستخدمين", {
      properties: { defaultColWidth: 20 },
      views: [{ rightToLeft: true }],
    });

    // ── Title Row ──
    const titleRow = worksheet.addRow(["تقرير المستخدمين - استأجر"]);
    worksheet.mergeCells("A1:N1");
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
    worksheet.mergeCells("A2:N2");
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
    if (accountType && accountType !== "all")
      filterParts.push(
        `نوع الحساب: ${accountTypeTextMap[accountType] || accountType}`,
      );
    if (isVerified && isVerified !== "all")
      filterParts.push(
        `التوثيق: ${isVerified === "true" ? "موثق" : "غير موثق"}`,
      );
    if (isBanned && isBanned !== "all")
      filterParts.push(`حالة الحظر: ${isBanned === "true" ? "محظور" : "نشط"}`);
    if (isRenter && isRenter !== "all")
      filterParts.push(`الدور: ${isRenter === "true" ? "مستأجر" : "مؤجر"}`);
    if (startDateParam) filterParts.push(`من: ${startDateParam}`);
    if (endDateParam) filterParts.push(`إلى: ${endDateParam}`);

    if (filterParts.length > 0) {
      const filterRow = worksheet.addRow([
        `الفلاتر: ${filterParts.join(" | ")}`,
      ]);
      worksheet.mergeCells("A3:N3");
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
      "الاسم الكامل",
      "البريد الإلكتروني",
      "رقم الهاتف",
      "نوع الحساب",
      "حالة التوثيق",
      "حالة الحظر",
      "العمولة (%)",
      "بريميوم",
      "الدور",
      "تاريخ الإنشاء",
      "عدد المنتجات",
      "العنوان",
      "اسم الشركة",
      "المعرف الفريد (Path)",
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
    users.forEach((u, index) => {
      const row = worksheet.addRow([
        u.fullName || "—",
        u.email || "—",
        u.phone || "—",
        u.accountType === "personal" && u.documentCode
          ? accountTypeTextMap.freelance
          : accountTypeTextMap[u.accountType] || u.accountType,
        u.isVerified ? "موثق" : "غير موثق",
        u.isBanned ? "محظور" : "نشط",
        u.commission || 15,
        u.premium ? "نعم" : "لا",
        u.isRenter ? "مستأجر" : "مؤجر",
        new Date(u.createdAt).toLocaleDateString("ar-SA"),
        u.productsCount || 0,
        u.address || "—",
        u.companyDetails?.companyName || "—",
        u.pathName || "—",
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

        // Styling for verification status
        if (colNumber === 5) {
          if (u.isVerified) {
            cell.font = { color: { argb: "FF008000" }, bold: true };
          } else {
            cell.font = { color: { argb: "FF888888" } };
          }
        }

        // Styling for ban status
        if (colNumber === 6) {
          if (u.isBanned) {
            cell.font = { color: { argb: "FFFF0000" }, bold: true };
          } else {
            cell.font = { color: { argb: "FF008000" } };
          }
        }
      });
    });

    // ── Summary Row ──
    if (users.length > 0) {
      worksheet.addRow([]);
      const summaryRow = worksheet.addRow([
        `إجمالي المستخدمين: ${users.length}`,
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
        "",
        "",
      ]);
      worksheet.mergeCells(`A${summaryRow.number}:N${summaryRow.number}`);
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
        "Content-Disposition": `attachment; filename="users-${Date.now()}.xlsx"`,
      },
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/users/export",
      method: "GET",
      req,
    });
  }
}
