import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import AiChat from "@/models/AiChat";
import ExcelJS from "exceljs";
import { authenticateUser } from "@/middleware/auth";
import { handleApiError } from "@/lib/errorHandler";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    
    const sortField = searchParams.get("sortBy") || "lastMessageAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;
    const search = searchParams.get("search") || "";

    const user = await authenticateUser();
    if (user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 },
      );
    }

    let pipeline = [];
    if (search) {
      pipeline.push({
        $search: {
          index: "default",
          text: {
            query: search,
            path: ["visitorName", "visitorContact"],
            fuzzy: { maxEdits: 1 }
          }
        }
      });
      pipeline.push({
        $addFields: {
          score: { $meta: "searchScore" }
        }
      });
    }

    // Only get the necessary fields, compute messagesCount
    pipeline.push({
      $project: {
        _id: 1,
        sessionId: 1,
        user: 1,
        visitor: 1,
        visitorName: 1,
        visitorContact: 1,
        lastMessageAt: 1,
        spamCount: 1,
        createdAt: 1,
        updatedAt: 1,
        messagesCount: { $size: { $ifNull: ["$messages", []] } },
        score: { $ifNull: ["$score", 0] }
      }
    });

    if (search) {
      pipeline.push({ $sort: { score: -1, [sortField]: sortOrder } });
    } else {
      pipeline.push({ $sort: { [sortField]: sortOrder } });
    }

    // Lookup user to get email
    pipeline.push({
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user"
      }
    });
    pipeline.push({
      $unwind: {
        path: "$user",
        preserveNullAndEmptyArrays: true
      }
    });
    
    // Project only user email and phone
    pipeline.push({
      $project: {
        _id: 1,
        sessionId: 1,
        user: { email: "$user.email", phone: "$user.phone" },
        visitor: 1,
        visitorName: 1,
        visitorContact: 1,
        lastMessageAt: 1,
        spamCount: 1,
        createdAt: 1,
        updatedAt: 1,
        messagesCount: 1,
        score: 1
      }
    });

    const chats = await AiChat.aggregate(pipeline);

    // ── Build Excel Workbook ──
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "استأجر - Estajer";
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet("محادثات الذكاء الاصطناعي", {
      properties: { defaultColWidth: 20 },
      views: [{ rightToLeft: true }],
    });

    // ── Title Row ──
    const titleRow = worksheet.addRow(["تقرير محادثات الذكاء الاصطناعي - استأجر"]);
    worksheet.mergeCells("A1:H1");
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
    worksheet.mergeCells("A2:H2");
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

    if (filterParts.length > 0) {
      const filterRow = worksheet.addRow([
        `الفلاتر: ${filterParts.join(" | ")}`,
      ]);
      worksheet.mergeCells("A3:H3");
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
      "اسم الزائر",
      "بيانات التواصل",
      "البريد الإلكتروني للمستخدم",
      "رقم هاتف المستخدم",
      "عدد الرسائل",
      "السبام",
      "تاريخ آخر رسالة",
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
    chats.forEach((chat, index) => {
      const row = worksheet.addRow([
        chat.visitorName || "زائر مجهول",
        chat.visitorContact || "—",
        chat.user?.email || "—",
        chat.user?.phone || "—",
        chat.messagesCount || 0,
        chat.spamCount || 0,
        chat.lastMessageAt ? new Date(chat.lastMessageAt).toLocaleString("ar-SA") : "—",
        chat.createdAt ? new Date(chat.createdAt).toLocaleDateString("ar-SA") : "—",
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

        // Styling for spam status
        if (colNumber === 5) {
          if (chat.spamCount > 0) {
            cell.font = { color: { argb: "FFFF0000" }, bold: true };
          } else {
            cell.font = { color: { argb: "FF008000" } };
          }
        }
      });
    });

    // ── Summary Row ──
    if (chats.length > 0) {
      worksheet.addRow([]);
      const summaryRow = worksheet.addRow([
        `إجمالي المحادثات: ${chats.length}`,
        "",
        "",
        "",
        "",
        "",
        "",
        "",
      ]);
      worksheet.mergeCells(`A${summaryRow.number}:H${summaryRow.number}`);
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
        "Content-Disposition": `attachment; filename="ai-chats-${Date.now()}.xlsx"`,
      },
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/admin/messages/ai/export",
      method: "GET",
      req,
    });
  }
}
