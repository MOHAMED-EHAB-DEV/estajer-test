import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import SearchQuery from "@/models/SearchQuery";
import { handleApiError } from "@/lib/errorHandler";
import ExcelJS from "exceljs";
import { authenticateUser } from "@/middleware/auth";

export async function GET(req) {
  try {
    await connectDB();
    const user = await authenticateUser();

    if (user.accountType !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(req.url);
    const sortBy = searchParams.get("sortBy") || "count";
    const order = searchParams.get("order") || "desc";
    const search = searchParams.get("search") || "";
    const source = searchParams.get("source") || "";
    const language = searchParams.get("language") || "";
    const hasResults = searchParams.get("hasResults");
    const period = searchParams.get("period") || "all";

    const matchQuery = {};

    if (search) {
      matchQuery.term = { $regex: search, $options: "i" };
    }
    if (source) {
      matchQuery[`sources.${source}`] = { $gt: 0 };
    }
    if (language) {
      matchQuery.language = language;
    }
    if (hasResults === "true") {
      matchQuery.hasResults = true;
    } else if (hasResults === "false") {
      matchQuery.hasResults = false;
    }

    if (period !== "all") {
      const now = new Date();
      let startDate;
      if (period === "today") {
        startDate = new Date(now);
        startDate.setUTCHours(0, 0, 0, 0);
      } else if (period === "week") {
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
      } else if (period === "month") {
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 1);
      }
      if (startDate) {
        matchQuery.lastSearchedAt = { $gte: startDate };
      }
    }

    const sortMap = {
      count: { count: order === "desc" ? -1 : 1 },
      recent: { lastSearchedAt: order === "desc" ? -1 : 1 },
      term: { term: order === "desc" ? -1 : 1 },
    };
    const sort = sortMap[sortBy] || sortMap.count;

    // Fetch ALL matching searches
    const raw = await SearchQuery.find(matchQuery).sort(sort).lean();

    // Transform for easier handling
    const searches = raw.map((doc) => ({
      ...doc,
      sourcesArray: Object.entries(doc.sources || {})
        .filter(([, c]) => c > 0)
        .sort((a, b) => b[1] - a[1]),
    }));

    // ── Build Excel Workbook ──
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "استأجر - Estajer";
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet("تحليلات البحث", {
      properties: { defaultColWidth: 20 },
      views: [{ rightToLeft: true }],
    });

    // Title Row
    const titleRow = worksheet.addRow(["تقرير تحليلات البحث - استأجر"]);
    worksheet.mergeCells("A1:G1");
    titleRow.height = 45;
    titleRow.getCell(1).font = { name: "Arial", size: 18, bold: true, color: { argb: "FFFFFFFF" } };
    titleRow.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0D092B" } };
    titleRow.getCell(1).alignment = { horizontal: "center", vertical: "middle" };

    // Date/Period Row
    const dateStr = new Date().toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" });
    const periodStr = period === "all" ? "كل الوقت" : period === "today" ? "اليوم" : period === "week" ? "آخر 7 أيام" : "آخر 30 يوم";
    const infoRow = worksheet.addRow([`تاريخ التصدير: ${dateStr} | الفترة: ${periodStr}`]);
    worksheet.mergeCells("A2:G2");
    infoRow.height = 28;
    infoRow.getCell(1).font = { name: "Arial", size: 11, color: { argb: "FF555555" } };
    infoRow.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEAEEF3" } };
    infoRow.getCell(1).alignment = { horizontal: "center", vertical: "middle" };

    worksheet.addRow([]); // empty separator

    // Header Row
    const headers = [
      "كلمة البحث",
      "العدد الإجمالي",
      "المصادر",
      "الإملاءات (التباينات)",
      "اللغة",
      "نتائج؟",
      "آخر بحث",
    ];

    const headerRow = worksheet.addRow(headers);
    headerRow.height = 35;
    headerRow.eachCell((cell) => {
      cell.font = { name: "Arial", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF48A42" } };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        top: { style: "thin", color: { argb: "FFD97B36" } },
        bottom: { style: "thin", color: { argb: "FFD97B36" } },
        left: { style: "thin", color: { argb: "FFD97B36" } },
        right: { style: "thin", color: { argb: "FFD97B36" } },
      };
    });

    // Data Rows
    searches.forEach((item, index) => {
      const sourceStr = item.sourcesArray.map(([s, c]) => `${s}: ${c}`).join(" | ");
      const variantStr = (item.variants || []).sort((a, b) => b.count - a.count).map(v => `${v.spelling} (x${v.count})`).join(" | ");

      const row = worksheet.addRow([
        item.originalTerm,
        item.count,
        sourceStr,
        variantStr,
        item.language === "ar" ? "عربي" : "إنجليزي",
        item.hasResults ? "نعم" : "لا",
        new Date(item.lastSearchedAt).toLocaleDateString("ar-SA"),
      ]);

      const bgColor = index % 2 === 0 ? "FFF9FAFC" : "FFFFFFFF";
      row.height = 28;
      row.eachCell((cell) => {
        cell.font = { name: "Arial", size: 10 };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
        cell.border = {
          bottom: { style: "thin", color: { argb: "FFEAEEF3" } },
        };
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="search-analytics-${Date.now()}.xlsx"`,
      },
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/admin/search-analytics/export",
      method: "GET",
      req,
    });
  }
}
