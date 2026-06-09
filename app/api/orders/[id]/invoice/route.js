import { NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { readFile } from "fs/promises";
import path from "path";
import connectDB from "@/lib/db";
import Order from "@/models/Order";

// ─────────────────────────────────────────────────────────────────────────────
//  ZERO-DEPENDENCY ARABIC BIDI ENGINE
//
//  pdf-lib has no built-in Unicode Bidi Algorithm or OpenType shaping support.
//  Strategy:
//    1. Split every string into ordered "runs" by script direction.
//    2. For RTL paragraphs, REVERSE the run order so Arabic sits on the right
//       and Latin/numbers sit on the left in the physical draw stream.
//    3. Draw each run with the matching font:
//         · Arabic runs  →  IBMPlexArabic (fontkit applies GSUB shaping)
//         · LTR runs     →  Helvetica  (digits, Latin letters, punctuation)
//    4. Never pass a mixed Arabic+Latin string to a single drawText call —
//       that is what causes the "inverted characters" bug.
// ─────────────────────────────────────────────────────────────────────────────

/** Returns true for codepoints in the Arabic / Arabic-Extended Unicode blocks. */
function isArabicCp(cp) {
  return (
    (cp >= 0x0600 && cp <= 0x06ff) ||
    (cp >= 0x0750 && cp <= 0x077f) ||
    (cp >= 0x08a0 && cp <= 0x08ff) ||
    cp === 0x200c || // ZWNJ
    cp === 0x200d    // ZWJ
  );
}

/**
 * Regex covering every Unicode Bidi / direction-control character:
 *   U+200E  Left-to-Right Mark          U+200F  Right-to-Left Mark
 *   U+202A  LR Embedding                U+202B  RL Embedding
 *   U+202C  Pop Directional Formatting  U+202D  LR Override
 *   U+202E  RL Override                 U+2066  LR Isolate
 *   U+2067  RL Isolate                  U+2068  First Strong Isolate
 *   U+2069  Pop Directional Isolate     U+FEFF  BOM / Zero-Width NBSP
 *
 * These characters are invisible, have zero width, and WinAnsi-encoded
 * fonts (like Helvetica) cannot encode them — causing a hard crash.
 * Since we implement our own Bidi engine we strip them before processing.
 */
const BIDI_CONTROL_RE = /[\u200E\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g;

/**
 * Split `text` into an ordered array of directional runs.
 * Each run: { text: string, type: "arabic" | "neutral" | "ltr" }
 *   "arabic"  – Arabic-script characters (fontkit applies shaping/GSUB)
 *   "neutral" – whitespace that inherits the surrounding direction
 *   "ltr"     – digits, Latin letters, ASCII punctuation
 */
function getTextRuns(text) {
  // Strip invisible Bidi-control characters before any processing.
  const str = String(text ?? "").replace(BIDI_CONTROL_RE, "");
  if (!str) return [];

  const runs = [];
  let i = 0;

  while (i < str.length) {
    const cp = str.codePointAt(i);
    const step = cp > 0xffff ? 2 : 1;

    if (isArabicCp(cp)) {
      // ── Arabic run ────────────────────────────────────────────────────────
      let j = i + step;
      while (j < str.length) {
        const c = str.codePointAt(j);
        if (!isArabicCp(c)) break;
        j += c > 0xffff ? 2 : 1;
      }
      runs.push({ text: str.slice(i, j), type: "arabic" });
      i = j;
    } else if (cp === 0x20 || cp === 0x09 || cp === 0x0a || cp === 0x0d) {
      // ── Neutral: whitespace ───────────────────────────────────────────────
      let j = i + step;
      while (j < str.length) {
        const c = str.codePointAt(j);
        if (c !== 0x20 && c !== 0x09 && c !== 0x0a && c !== 0x0d) break;
        j += c > 0xffff ? 2 : 1;
      }
      runs.push({ text: str.slice(i, j), type: "neutral" });
      i = j;
    } else {
      // ── LTR run: digits, Latin, symbols ───────────────────────────────────
      let j = i + step;
      while (j < str.length) {
        const c = str.codePointAt(j);
        if (
          isArabicCp(c) ||
          c === 0x20 || c === 0x09 || c === 0x0a || c === 0x0d
        ) break;
        j += c > 0xffff ? 2 : 1;
      }
      runs.push({ text: str.slice(i, j), type: "ltr" });
      i = j;
    }
  }

  return runs;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Translations
// ─────────────────────────────────────────────────────────────────────────────

const translations = {
  en: {
    invoice: "Purchase Receipt",
    invoiceNumber: "Order Number",
    date: "Date",
    customerInfo: "Customer Information",
    name: "Name",
    email: "Email",
    phone: "Phone",
    address: "Address",
    orderDetails: "Order Details",
    product: "Product",
    quantity: "Qty",
    unitPrice: "Unit Price",
    total: "Total",
    startDate: "Start Date",
    endDate: "End Date",
    subtotal: "Subtotal",
    tax: "Tax (15%)",
    insurance: "Insurance",
    deliveryCost: "Delivery Cost",
    totalAmount: "Total Amount",
    sar: "SAR",
    thankYou: "Thank you for your business!",
    estajer: "Estajer",
    rentalPlatform: "Product Rental Platform",
  },
  ar: {
    invoice: "إيصال شراء",
    invoiceNumber: "رقم الطلب",
    date: "التاريخ",
    customerInfo: "معلومات العميل",
    name: "الاسم",
    email: "البريد الإلكتروني",
    phone: "الجوّال",
    address: "العنوان",
    orderDetails: "تفاصيل الطلب",
    product: "المنتج",
    quantity: "الكمية",
    unitPrice: "سعر الوحدة",
    total: "المجموع",
    startDate: "تاريخ البدء",
    endDate: "تاريخ الانتهاء",
    subtotal: "المجموع الفرعي",
    tax: "الضريبة (15%)",
    insurance: "التأمين",
    deliveryCost: "تكلفة التوصيل",
    totalAmount: "المبلغ الإجمالي",
    sar: "ر.س",
    thankYou: "شكراً لتعاملكم معنا!",
    estajer: "استأجر",
    rentalPlatform: "منصة تأجير المنتجات",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
//  GET Handler
// ─────────────────────────────────────────────────────────────────────────────

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const lang = searchParams.get("lang") || "en";
    const isAr = lang === "ar";
    const t = translations[lang] ?? translations.en;

    // ── Fetch order ──────────────────────────────────────────────────────────
    const order = await Order.findById(id)
      .populate({
        path: "items",
        populate: { path: "product", select: "nameAr nameEn images" },
      })
      .populate("ownerData", "fullName email phone companyDetails");

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // ── PDF setup ────────────────────────────────────────────────────────────
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    const fontsDir = path.join(process.cwd(), "fonts", "old");
    const [fontBytes, fontBoldBytes] = await Promise.all([
      readFile(path.join(fontsDir, "IBMPlexArabic.ttf")),
      readFile(path.join(fontsDir, "IBMPlexArabic-SemiBold.ttf")),
    ]);

    const arabicFont     = await pdfDoc.embedFont(fontBytes);
    const arabicFontBold = await pdfDoc.embedFont(fontBoldBytes);
    const helvetica      = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold  = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // A4 page
    const page = pdfDoc.addPage([595.28, 841.89]);
    const { width, height } = page.getSize();

    // ── Palette ──────────────────────────────────────────────────────────────
    const primaryColor   = rgb(244 / 255, 138 / 255,  66 / 255); // #F48A42
    const darkColor      = rgb( 13 / 255,   9 / 255,  43 / 255); // #0D092B
    const grayColor      = rgb( 91 / 255,  86 / 255,  86 / 255); // #5B5656
    const lightGrayColor = rgb(234 / 255, 238 / 255, 243 / 255); // #EAEEF3
    const whiteColor     = rgb(1, 1, 1);

    const margin       = 50;
    const contentWidth = width - 2 * margin;
    let   yPos         = height - 50;

    // ────────────────────────────────────────────────────────────────────────
    //  BIDI DRAWING HELPERS
    //  All functions below are closures over page / font variables.
    // ────────────────────────────────────────────────────────────────────────

    /**
     * Core Bidi text drawing.
     *
     * @param {string} text  Logical-order string (may mix Arabic + Latin freely)
     * @param {number} x     Anchor X.  RTL → right edge of text; LTR → left edge
     * @param {number} y     Baseline Y
     * @param {object} opts
     *   aFont  {PDFFont}  Arabic font  (default: arabicFont)
     *   lFont  {PDFFont}  LTR font     (default: helvetica)
     *   size   {number}   Font size    (default: 11)
     *   color  {Color}    Text color   (default: darkColor)
     *   rtl    {boolean}  RTL mode     (default: isAr)
     * @returns {number} Total drawn width in points
     */
    function drawBidi(
      text,
      x,
      y,
      { aFont = arabicFont, lFont = helvetica, size = 11, color = darkColor, rtl = isAr } = {}
    ) {
      const str = String(text ?? "");
      if (!str) return 0;

      const runs = getTextRuns(str);
      if (!runs.length) return 0;

      // RTL paragraph: reverse run order so Arabic ends up visually on the right
      const visualRuns = rtl ? [...runs].reverse() : runs;

      // Measure total width
      const totalWidth = visualRuns.reduce((sum, run) => {
        const font = run.type === "arabic" ? aFont : lFont;
        return sum + font.widthOfTextAtSize(run.text, size);
      }, 0);

      // Start X: for RTL the anchor is the right edge so shift left by totalWidth
      let curX = rtl ? x - totalWidth : x;

      for (const run of visualRuns) {
        const font = run.type === "arabic" ? aFont : lFont;
        const w = font.widthOfTextAtSize(run.text, size);
        page.drawText(run.text, { x: curX, y, size, font, color });
        curX += w;
      }

      return totalWidth;
    }

    /** Bold variant — swaps to bold fonts, all other options passthrough. */
    function drawBidiBold(text, x, y, opts = {}) {
      return drawBidi(text, x, y, {
        aFont: arabicFontBold,
        lFont: helveticaBold,
        ...opts,
      });
    }

    /**
     * Measure the pixel width of a mixed-script string.
     * Uses the same run-selection logic as drawBidi.
     */
    function measureBidi(text, size, { aFont = arabicFont, lFont = helvetica, bold = false } = {}) {
      const af = bold ? arabicFontBold : aFont;
      const lf = bold ? helveticaBold  : lFont;
      return getTextRuns(String(text ?? "")).reduce((sum, run) => {
        const font = run.type === "arabic" ? af : lf;
        return sum + font.widthOfTextAtSize(run.text, size);
      }, 0);
    }

    /**
     * Draw a monetary amount with the SAR/ر.س currency label.
     *
     * AR visual order (RTL reads right→left): "ر.س  500"
     *   → label on right, number on left, reading "500 ر.س"  ✓
     * EN visual order (LTR): "500 SAR"  ✓
     *
     * @param {number}  amount
     * @param {number}  x       Right-edge anchor (for RTL) or left-edge (for LTR)
     * @param {number}  y
     * @param {object}  opts
     *   size, color, bold
     */
    /**
     * @param {boolean} [opts.rtl]  Explicit override; defaults to isAr.
     *   Set rtl:true to right-anchor the amount regardless of language
     *   (used in the summary column where the value is always right-aligned).
     */
    function drawAmount(amount, x, y, { size = 11, color = darkColor, bold = false, rtl = isAr, reverse=false } = {}) {
      const numStr = Number(amount).toFixed(0);
      const text = !isAr && reverse ? `${t.sar} ${numStr}` : `${numStr} ${t.sar}`;
      return bold
        ? drawBidiBold(text, x, y, { size, color, rtl })
        : drawBidi(text, x, y, { size, color, rtl });
    }

    /**
     * Wrap `text` into lines whose Bidi-measured width fits within `maxWidth`.
     * Returns an array of line strings.
     */
    function wrapText(text, maxWidth, size, bold = false) {
      const words = String(text ?? "").split(" ").filter(Boolean);
      if (!words.length) return [""];

      const lines = [];
      let current = words[0];

      for (let i = 1; i < words.length; i++) {
        const candidate = `${current} ${words[i]}`;
        if (measureBidi(candidate, size, { bold }) <= maxWidth) {
          current = candidate;
        } else {
          lines.push(current);
          current = words[i];
        }
      }
      lines.push(current);
      return lines;
    }

    // ────────────────────────────────────────────────────────────────────────
    //  HEADER
    // ────────────────────────────────────────────────────────────────────────

    page.drawRectangle({ x: 0, y: height - 100, width, height: 100, color: primaryColor });

    // Logo / brand (left for EN, right for AR)
    const logoX = isAr ? width - margin : margin;
    drawBidiBold(t.estajer, logoX, height - 55, { size: 28, color: whiteColor, rtl: isAr });
    drawBidi(t.rentalPlatform, logoX, height - 80, { size: 11, color: whiteColor, rtl: isAr });

    // Invoice title (always on the opposite side — right-aligned in both modes)
    const titleX = isAr ? margin + 120 : width - margin;
    drawBidiBold(t.invoice, titleX, height - 55, { size: 24, color: whiteColor, rtl: true });

    yPos = height - 130;

    // ────────────────────────────────────────────────────────────────────────
    //  INVOICE META  (order number + date)
    // ────────────────────────────────────────────────────────────────────────

    // For AR the label block starts at the right margin;
    // for EN it starts at the left margin.
    const metaAnchorX = isAr ? width - margin : margin;

    // ── Order Number ────────────────────────────────────────────────────────
    {
      const labelText = `${t.invoiceNumber}:`;
      const labelW = measureBidi(labelText, 11, { bold: true });

      // Draw label
      drawBidiBold(labelText, metaAnchorX, yPos, { size: 11, rtl: isAr });

      // Draw value (always a plain LTR number)
      const numStr = String(order.contractId ?? "");
      const numW   = helvetica.widthOfTextAtSize(numStr, 11);
      let   numX;
      if (isAr) {
        // AR: value is to the LEFT of the right-anchored label
        numX = metaAnchorX - labelW - 8 - numW;
      } else {
        // EN: value is to the RIGHT of the left-anchored label
        numX = metaAnchorX + labelW + 8;
      }
      page.drawText(numStr, { x: numX, y: yPos, size: 11, font: helvetica, color: darkColor });
    }

    yPos -= 20;

    // ── Date ────────────────────────────────────────────────────────────────
    {
      const orderDate = new Date(order.createdAt).toLocaleDateString(
        // "ar-SA-u-nu-latn" gives Arabic month names with Western (Latin) numerals
        isAr ? "ar-SA-u-nu-latn" : "en-US",
        { year: "numeric", month: "long", day: "numeric" }
      );

      const labelText = `${t.date}:`;
      const labelW    = measureBidi(labelText, 11, { bold: true });

      drawBidiBold(labelText, metaAnchorX, yPos, { size: 11, rtl: isAr });

      const dateX = isAr
        ? metaAnchorX - labelW - 8
        : metaAnchorX + labelW + 8;
      drawBidi(orderDate, dateX, yPos, { size: 11, rtl: isAr });
    }

    yPos -= 40;

    // ────────────────────────────────────────────────────────────────────────
    //  CUSTOMER INFORMATION SECTION
    // ────────────────────────────────────────────────────────────────────────

    page.drawRectangle({
      x: margin,
      y: yPos - 5,
      width: contentWidth,
      height: 25,
      color: lightGrayColor,
    });

    drawBidiBold(
      t.customerInfo,
      isAr ? width - margin - 10 : margin + 10,
      yPos,
      { size: 13, color: primaryColor, rtl: isAr }
    );

    yPos -= 35;

    const customerRows = [
      { label: t.name,    value: order.userData?.fullName },
      { label: t.email,   value: order.userData?.email    },
      { label: t.phone,   value: order.userData?.phone    },
      { label: t.address, value: order.userData?.address  },
    ];

    const LABEL_COL_W = 80;       // Fixed label column width
    const valueFontSize = 10;
    const lineH = 14;

    for (const { label, value } of customerRows) {
      const labelText  = `${label}:`;
      const labelAncX  = isAr ? width - margin : margin;
      drawBidiBold(labelText, labelAncX, yPos, { size: 10, rtl: isAr });

      const valueStr  = String(value ?? "");
      const valueAncX = isAr ? width - margin - LABEL_COL_W : margin + LABEL_COL_W;
      const maxW      = isAr
        ? valueAncX - margin
        : width - margin - valueAncX;

      const lines = wrapText(valueStr, maxW, valueFontSize);
      lines.forEach((line, idx) => {
        drawBidi(line, valueAncX, yPos - idx * lineH, {
          size: valueFontSize,
          color: grayColor,
          rtl: isAr,
        });
      });

      yPos -= lines.length * lineH + 6;
    }

    yPos -= 20;

    // ────────────────────────────────────────────────────────────────────────
    //  ORDER DETAILS SECTION
    // ────────────────────────────────────────────────────────────────────────

    page.drawRectangle({
      x: margin,
      y: yPos - 8,
      width: contentWidth,
      height: 27,
      color: lightGrayColor,
    });

    drawBidiBold(
      t.orderDetails,
      isAr ? width - margin - 10 : margin + 10,
      yPos,
      { size: 13, color: primaryColor, rtl: isAr }
    );

    yPos -= 25;

    // ── Table header row ─────────────────────────────────────────────────────
    const tableHeaderY = yPos;
    page.drawRectangle({
      x: margin,
      y: tableHeaderY - 5,
      width: contentWidth,
      height: 22,
      color: darkColor,
    });

    // Column X anchors — adapt to RTL / LTR layout
    // AR: right-anchored  |  EN: left-anchored
    const col = isAr
      ? {
          product:   width - margin - 10,   // Far right
          quantity:  width - margin - 250,
          unitPrice: width - margin - 330,
          total:     margin + 60,            // Far left
        }
      : {
          product:   margin + 10,            // Far left
          quantity:  margin + 280,
          unitPrice: margin + 360,
          total:     width - margin - 60,    // Far right
        };

    const colRTL = isAr; // header cells use the same paragraph direction

    drawBidiBold(t.product,   col.product,   tableHeaderY, { size: 10, color: whiteColor, rtl: colRTL });
    drawBidiBold(t.quantity,  col.quantity,  tableHeaderY, { size: 10, color: whiteColor, rtl: colRTL });
    drawBidiBold(t.unitPrice, col.unitPrice, tableHeaderY, { size: 10, color: whiteColor, rtl: colRTL });
    drawBidiBold(t.total,     col.total,     tableHeaderY, { size: 10, color: whiteColor, rtl: isAr });

    yPos -= 30;

    // ── Table rows ────────────────────────────────────────────────────────────
    for (let idx = 0; idx < order.items.length; idx++) {
      const item = order.items[idx];

      // Alternating row background
      if (idx % 2 === 0) {
        page.drawRectangle({
          x: margin,
          y: yPos - 8,
          width: contentWidth,
          height: 25,
          color: rgb(0.98, 0.98, 0.98),
        });
      }

      // Product name (use the locale-appropriate field)
      const productName = String(
        (isAr ? item.product?.nameAr : item.product?.nameEn) ?? "N/A"
      );
      drawBidi(productName, col.product, yPos, { size: 10, rtl: colRTL });

      // Quantity — always a plain number in Helvetica
      const qtyStr = String(item.quantity ?? 1);
      const qtyW   = helvetica.widthOfTextAtSize(qtyStr, 10);
      page.drawText(qtyStr, {
        x: isAr ? col.quantity - qtyW : col.quantity,
        y: yPos,
        size: 10,
        font: helvetica,
        color: darkColor,
      });

      // Unit price
      const unitPrice = item.quantity > 0 ? item.price / item.quantity : item.price;
      drawAmount(unitPrice, col.unitPrice, yPos, { size: 10, });

      // Row total
      drawAmount(item.price, col.total, yPos, { size: 10, rtl: isAr });

      yPos -= 25;

      // ── Services for this item ─────────────────────────────────────────────
      if (item.services?.length) {
        for (const svc of item.services) {
          // Service name — may be Arabic, English, or mixed
          const svcNameX = isAr ? col.product - 20 : col.product + 20;
          const svcText  = `${svc.name} (x${svc.quantity})`;
          drawBidi(svcText, svcNameX, yPos, { size: 9, color: grayColor, rtl: colRTL });

          // Service price
          const svcPriceText = `${Number(svc.price).toFixed(0)} (x${svc.quantity}) ${t.sar}`;
          drawBidi(svcPriceText, col.total, yPos, { size: 9, color: grayColor, rtl: isAr });

          yPos -= 18;
        }
      }

      // ── Rental period ──────────────────────────────────────────────────────
      const dateLocale = isAr ? "ar-SA-u-nu-latn" : "en-GB";
      const startDate = new Date(item.startDate).toLocaleDateString(dateLocale);
      const endDate   = new Date(item.endDate).toLocaleDateString(dateLocale);

      // Build period text so each segment stays with its language:
      //  AR logical: "تاريخ البدء: 2026/1/1 - تاريخ الانتهاء: 2026/2/1"
      //  EN logical: "Start Date: 2026/1/1 - End Date: 2026/2/1"
      // drawBidi will handle the Bidi ordering automatically.
      const periodText = `${t.startDate}: ${startDate} - ${t.endDate}: ${endDate}`;
      drawBidi(periodText, col.product, yPos, {
        size: 8,
        color: grayColor,
        rtl: colRTL,
      });

      yPos -= 25;
    }

    yPos -= 10;

    // ────────────────────────────────────────────────────────────────────────
    //  SUMMARY SECTION
    // ────────────────────────────────────────────────────────────────────────

    // Divider spanning the right half of the page
    page.drawLine({
      start: { x: width / 2, y: yPos },
      end:   { x: width - margin, y: yPos },
      thickness: 1,
      color: lightGrayColor,
    });

    yPos -= 25;

    // Summary column positions (right half of page)
    // summaryLabelX: the anchor for labels (right-edge for AR, right-edge for EN)
    // summaryValueX: the anchor for values (always the far-right edge)
    const summaryLabelX = isAr ? width - margin : margin;
    const summaryValueX = isAr ? width - margin - 130 : margin + 140;

    /**
     * Draw one summary row.
     * Label: right-anchored at summaryLabelX using language direction (rtl:isAr).
     *        rtl:isAr preserves word order for EN labels; Arabic labels reverse naturally.
     * Value: ALWAYS right-anchored at summaryValueX (rtl:true) so it never overflows.
     */
    function drawSummaryRow(label, amount, { bold = false, color: rowColor = darkColor } = {}) {
      const labelText = `${label}:`;
      const fontSize = bold ? 13 : 11;
      // Label — use isAr so EN words are NOT reversed
      drawBidiBold(labelText, summaryLabelX, yPos, {
        size: fontSize,
        color: rowColor,
        rtl: isAr,
      });
      // Value — always right-anchored regardless of language
      drawAmount(amount, summaryValueX, yPos, {
        size: fontSize,
        color: rowColor,
        bold,
        rtl: true,
        reverse: true,
      });
      yPos -= 20;
    }

    drawSummaryRow(t.subtotal, order.price);

    if (order.tax > 0)          drawSummaryRow(t.tax,          order.tax);
    if (order.insurance > 0)    drawSummaryRow(t.insurance,    order.insurance);
    if (order.deliveryCost > 0) drawSummaryRow(t.deliveryCost, order.deliveryCost);

    yPos -= 5;

    // Total row — highlighted background
    page.drawRectangle({
      x: isAr ? width / 2 : margin - 8,
      y: yPos - 8,
      width: width / 2 - margin,
      height: 25,
      color: primaryColor,
    });
    drawSummaryRow(t.totalAmount, order.totalAmount, { bold: true, color: whiteColor });

    // ────────────────────────────────────────────────────────────────────────
    //  FOOTER
    // ────────────────────────────────────────────────────────────────────────

    const footerY = 50;

    page.drawLine({
      start: { x: margin,         y: footerY + 30 },
      end:   { x: width - margin, y: footerY + 30 },
      thickness: 1,
      color: lightGrayColor,
    });

    // Thank-you message — centred on the page, direction respects language.
    // For RTL (AR): anchor = right edge → place at  centre + halfWidth
    // For LTR (EN): anchor = left  edge → place at  centre - halfWidth
    const thankYouW = measureBidi(t.thankYou, 12, { bold: true });
    const thankYouX = isAr
      ? width / 2 + thankYouW / 2   // right-edge anchor for RTL
      : width / 2 - thankYouW / 2;  // left-edge anchor  for LTR
    drawBidiBold(t.thankYou, thankYouX, footerY, {
      size: 12,
      color: primaryColor,
      rtl: isAr,
    });

    // ────────────────────────────────────────────────────────────────────────
    //  Serialise & return
    // ────────────────────────────────────────────────────────────────────────

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="invoice-${order.contractId}.pdf"`,
      },
    });
  } catch (err) {
    console.error("Error generating invoice:", err);
    return NextResponse.json(
      { error: "Failed to generate invoice", details: err.message },
      { status: 500 }
    );
  }
}
