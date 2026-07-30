import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import { drive as googleDrive, auth } from "@googleapis/drive";
import { Readable } from "stream";
import { authenticateUser } from "@/middleware/auth";
import { handleApiError } from "@/lib/errorHandler";
import { sendTaxInvoiceUploadedEmail } from "@/lib/emails/tax-invoice";

export async function POST(req, { params }) {
  try {
    await connectDB();
    const user = await authenticateUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id: orderId } = await params;
    const order = await Order.findById(orderId).populate(
      "userData.id",
      "email lang",
    );

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 },
      );
    }

    // Verify user is owner
    if (
      order.ownerData.toString() !== user._id.toString() &&
      user.accountType !== "admin"
    ) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 },
      );
    }

    if (!file.type?.startsWith("image/") && file.type !== "application/pdf") {
      return NextResponse.json(
        { success: false, message: "Only PDFs and images are allowed" },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Setup OAuth2 Client for Google Drive
    const oauth2Client = new auth.OAuth2(
      process.env.GDRIVE_CLIENT_ID,
      process.env.GDRIVE_CLIENT_SECRET,
    );
    oauth2Client.setCredentials({
      refresh_token: process.env.GDRIVE_REFRESH_TOKEN,
    });

    const drive = googleDrive({ version: "v3", auth: oauth2Client });
    const extension = file.name
      ? file.name?.split(".")?.pop()
      : file.type === "application/pdf"
        ? "pdf"
        : "jpg";
    const fileName = `Tax_Invoice_Order_${order._id}.${extension}`;

    // Upload to Google Drive
    const driveResponse = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [process.env.GDRIVE_INVOICES_FOLDER_ID],
      },
      media: {
        mimeType: file.type,
        body: Readable.from(buffer),
      },
      fields: "id, webViewLink",
    });

    const fileId = driveResponse.data.id;
    const webViewLink = driveResponse.data.webViewLink;

    order.taxInvoice = fileId;
    await order.save();

    // Send email to renter
    if (order.userData && order.userData.email) {
      await sendTaxInvoiceUploadedEmail({
        email: order.userData.email,
        orderId: order._id,
        invoiceUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://estajer.com"}/api/orders/${order._id}/tax-invoice/${fileId}`,
        userLang: order.userData.id?.lang || "ar",
        checkoutOrigin: order.checkoutOrigin,
      });
    }

    return NextResponse.json({ success: true, url: webViewLink });
  } catch (error) {
    return handleApiError(error, {
      endpoint: `/api/orders/${params.id}/tax-invoice`,
      method: "POST",
      req,
    });
  }
}
