import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
import { handleApiError } from "@/lib/errorHandler";
import ExcelJS from "exceljs";
import { authenticateUser } from "@/middleware/auth";

const statusTextMap = {
  "not-paid": "غير مدفوع",
  pending: "طلب مدفوع",
  confirmed: "طلب مؤكد",
  received: "تم استلامه",
  completed: "مكتمل",
  "not-returned": "لم يتم ارجاعه",
  rejecting: "جاري الغاءه",
  cancelled: "ملغى",
};

const statusColorMap = {
  "not-paid": "8B726E",
  pending: "9747FF",
  confirmed: "4FD6B6",
  received: "F48A42",
  completed: "4FD658",
  "not-returned": "E74C3C",
  rejecting: "F44242",
  cancelled: "F44242",
};

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const ownerSearch = searchParams.get("ownerSearch");
    const customerSearch = searchParams.get("customerSearch");
    const id = searchParams.get("id");
    const provider = searchParams.get("provider");

    const user = await authenticateUser();
    if (user.accountType !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 },
      );
    }

    // Build query (same logic as /api/orders)
    let query = {};

    if (status && status !== "all") {
      if (status === "rejecting") {
        query.status = "rejecting";
        query.$or = [{ rejectionApproved: false }, { rejectionApproved: null }];
      } else if (status === "rejectionConfirmed") {
        query.status = "rejecting";
        query.rejectionApproved = true;
      } else {
        query.status = status;
      }
    } else {
      // Default behavior: exclude not-paid orders in export unless explicitly selected
      query.status = { $ne: "not-paid" };
    }

    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

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

    if (id) {
      query.$or = [
        { _id: id },
        { contractId: id },
        { milestoneId: id },
        { paymentId: id },
      ];
    }

    if (ownerSearch) {
      const ownerSearchQuery = {
        $or: [
          { fullName: { $regex: ownerSearch, $options: "i" } },
          { email: { $regex: ownerSearch, $options: "i" } },
          { phone: { $regex: ownerSearch, $options: "i" } },
        ],
      };
      if (mongoose.Types.ObjectId.isValid(ownerSearch)) {
        ownerSearchQuery.$or.push({ _id: ownerSearch });
      }
      const matchingOwners = await User.find(ownerSearchQuery).select("_id");
      const ownerIds = matchingOwners.map((o) => o._id);
      query.ownerData = { $in: ownerIds };
    }

    if (customerSearch) {
      query.$or = query.$or || [];
      query.$or.push(
        { "userData.fullName": { $regex: customerSearch, $options: "i" } },
        { "userData.email": { $regex: customerSearch, $options: "i" } },
        { "userData.phone": { $regex: customerSearch, $options: "i" } },
      );
      if (mongoose.Types.ObjectId.isValid(customerSearch)) {
        query.$or.push({ "userData.id": customerSearch });
      }
    }

    if (provider) {
      if (provider === "nana") {
        query.paymentGateway = "nana";
      } else if (provider === "estajer") {
        query.paymentGateway = { $ne: "nana" };
        query.providerId = {
          $ne: new mongoose.Types.ObjectId("699ccc057fa956a3b96d93d8"),
        };
      } else if (mongoose.Types.ObjectId.isValid(provider)) {
        query.providerId = provider;
      }
    }

    // Fetch ALL matching orders (no pagination for export)
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate("userData.id", "createdAt avatar fullName isOnline lastSeen")
      .populate(
        "ownerData",
        "createdAt avatar fullName phone email address location isOnline lastSeen branches",
      )
      .populate("providerId", "nameAr nameEn slug")
      .lean();

    // ── Build Excel Workbook ──
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "استأجر - Estajer";
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet("الطلبات", {
      properties: { defaultColWidth: 18 },
      views: [{ rightToLeft: true }],
    });

    // ── Title Row ──
    const titleRow = worksheet.addRow(["تقرير الطلبات - استأجر"]);
    worksheet.mergeCells("A1:R1");
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
    worksheet.mergeCells("A2:R2");
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
    if (status && status !== "all")
      filterParts.push(`الحالة: ${statusTextMap[status] || status}`);
    if (startDateParam) filterParts.push(`من: ${startDateParam}`);
    if (endDateParam) filterParts.push(`إلى: ${endDateParam}`);
    if (ownerSearch) filterParts.push(`المؤجر: ${ownerSearch}`);
    if (customerSearch) filterParts.push(`العميل: ${customerSearch}`);
    if (provider) {
      if (provider === "nana") filterParts.push(`المزود: نعناع`);
      else if (provider === "estajer") filterParts.push(`المزود: استأجر`);
      else filterParts.push(`المزود: ${provider}`);
    }
    if (id) filterParts.push(`البحث: ${id}`);

    if (filterParts.length > 0) {
      const filterRow = worksheet.addRow([
        `الفلاتر: ${filterParts.join(" | ")}`,
      ]);
      worksheet.mergeCells("A3:R3");
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

    // ── Empty separator row ──
    worksheet.addRow([]);

    // ── Header Row ──
    const headers = [
      "رقم العقد",
      "اسم المنتج",
      "اسم المؤجر",
      "هاتف المؤجر",
      "اسم المستأجر",
      "هاتف المستأجر",
      "تاريخ البدء",
      "تاريخ الانتهاء",
      "مدة الإيجار (أيام)",
      "السعر (ر.س)",
      "الضريبة (ر.س)",
      "التأمين (ر.س)",
      "التوصيل (ر.س)",
      "الإجمالي (ر.س)",
      "الحالة",
      "حالة وافي",
      "المزود",
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
        wrapText: true,
      };
      cell.border = {
        top: { style: "thin", color: { argb: "FFD97B36" } },
        bottom: { style: "thin", color: { argb: "FFD97B36" } },
        left: { style: "thin", color: { argb: "FFD97B36" } },
        right: { style: "thin", color: { argb: "FFD97B36" } },
      };
    });

    // ── Data Rows ──
    orders.forEach((order, index) => {
      const rentalDays =
        Math.ceil(
          (new Date(order.endDate).getTime() -
            new Date(order.startDate).getTime()) /
            (1000 * 60 * 60 * 24),
        ) + 1;

      const productName =
        order.items
          ?.map((item) => item.product?.nameAr || item.product?.nameEn || "—")
          .join(", ") || "—";

      const statusText =
        order.status === "rejecting" && order.rejectionApproved
          ? "تم تأكيد الإلغاء"
          : statusTextMap[order.status] || order.status;

      const row = worksheet.addRow([
        order.contractId || "—",
        productName,
        order.ownerData?.fullName || "—",
        order.ownerData?.phone || "—",
        order.userData?.fullName || "—",
        order.userData?.phone || "—",
        new Date(order.startDate).toLocaleDateString("ar-SA"),
        new Date(order.endDate).toLocaleDateString("ar-SA"),
        rentalDays,
        order.price || 0,
        order.tax || 0,
        order.insurance || 0,
        order.deliveryCost || 0,
        order.totalAmount || 0,
        statusText,
        order.waffyStatus || "—",
        order.paymentGateway === "nana"
          ? "نعناع"
          : order.providerId
            ? order.providerId.nameAr
            : "مباشر",
        new Date(order.createdAt).toLocaleDateString("ar-SA"),
      ]);

      // Alternate row background
      const bgColor = index % 2 === 0 ? "FFF9FAFC" : "FFFFFFFF";
      row.height = 28;
      row.eachCell((cell, colNumber) => {
        cell.font = { name: "Arial", size: 10 };
        cell.alignment = {
          horizontal: "center",
          vertical: "middle",
          wrapText: true,
        };
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

        // Color-code status cell
        if (colNumber === 15) {
          const sColor = statusColorMap[order.status] || "888888";
          cell.font = {
            name: "Arial",
            size: 10,
            bold: true,
            color: { argb: "FFFFFFFF" },
          };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: `FF${sColor}` },
          };
        }

        // Bold total amount
        if (colNumber === 14) {
          cell.font = {
            name: "Arial",
            size: 10,
            bold: true,
            color: { argb: "FFF48A42" },
          };
        }
      });
    });

    // ── Summary Row ──
    if (orders.length > 0) {
      worksheet.addRow([]); // separator
      const totalPrice = orders.reduce((sum, o) => sum + (o.price || 0), 0);
      const totalTax = orders.reduce((sum, o) => sum + (o.tax || 0), 0);
      const totalInsurance = orders.reduce(
        (sum, o) => sum + (o.insurance || 0),
        0,
      );
      const totalDelivery = orders.reduce(
        (sum, o) => sum + (o.deliveryCost || 0),
        0,
      );
      const grandTotal = orders.reduce(
        (sum, o) => sum + (o.totalAmount || 0),
        0,
      );

      const summaryRow = worksheet.addRow([
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        `إجمالي (${orders.length} طلب)`,
        totalPrice,
        totalTax,
        totalInsurance,
        totalDelivery,
        grandTotal,
        "",
        "",
        "",
        "",
      ]);

      summaryRow.height = 35;
      summaryRow.eachCell((cell, colNumber) => {
        cell.font = {
          name: "Arial",
          size: 11,
          bold: true,
          color: { argb: "FF0D092B" },
        };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFEAEEF3" },
        };
        cell.alignment = {
          horizontal: "center",
          vertical: "middle",
        };
        cell.border = {
          top: { style: "medium", color: { argb: "FF0D092B" } },
          bottom: { style: "medium", color: { argb: "FF0D092B" } },
        };

        if (colNumber === 14) {
          cell.font = {
            name: "Arial",
            size: 13,
            bold: true,
            color: { argb: "FFF48A42" },
          };
        }
      });
    }

    // ── Column Widths ──
    worksheet.columns = [
      { width: 18 }, // contractId
      { width: 28 }, // product name
      { width: 22 }, // owner name
      { width: 18 }, // owner phone
      { width: 22 }, // renter name
      { width: 18 }, // renter phone
      { width: 16 }, // start date
      { width: 16 }, // end date
      { width: 18 }, // rental days
      { width: 14 }, // price
      { width: 14 }, // tax
      { width: 14 }, // insurance
      { width: 14 }, // delivery
      { width: 16 }, // total
      { width: 18 }, // status
      { width: 16 }, // wafy status
      { width: 18 }, // provider
      { width: 18 }, // created date
    ];

    // ── Generate Buffer ──
    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="orders-${Date.now()}.xlsx"`,
      },
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/orders/export",
      method: "GET",
      req,
    });
  }
}
