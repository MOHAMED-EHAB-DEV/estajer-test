import { transporter } from "../email";

export async function sendTaxInvoiceUploadedEmail({
  email,
  orderId,
  invoiceUrl,
  userLang = "ar",
  checkoutOrigin,
}) {
  const unsubscribeUrl =
    process.env.UNSUBSCRIBE_URL || "https://estajer.com/api/auth/unsubscribe";
  const companyName = process.env.COMPANY_NAME || "Estajer | استأجر";
  const companyAddress = process.env.COMPANY_ADDRESS || "123 Main Street";
  const companyCityCountry =
    process.env.COMPANY_CITY_COUNTRY || "Riyadh, Saudi Arabia";
  const logoUrl =
    "https://res.cloudinary.com/dhfzkadm2/image/upload/v1768056757/logoWhite_l0rabo_wc3lbb.webp";

  const baseUrl =
    checkoutOrigin || process.env.NEXT_PUBLIC_APP_URL || "https://estajer.com";
  const orderUrl = `${baseUrl}/dashboard/my-orders`;

  let emailSubject, headerTitle, bodyIntro, closingText, ctaButtonHtml, orderLinkHtml;

  if (userLang === "en") {
    emailSubject = `Tax Invoice Uploaded for Order #${orderId} - ${companyName}`;
    headerTitle = "Tax Invoice Uploaded";
    bodyIntro = `<p style="margin: 0 0 20px 0; font-family: sans-serif;">Hello,</p>
                 <p style="margin: 0 0 20px 0; font-family: sans-serif;">The tax invoice for your order #${orderId} has been successfully uploaded by the landlord.</p>`;
    closingText = `<p style="margin-top: 25px; margin-bottom: 15px; font-family: sans-serif;">You can download the tax invoice using the button below or view your order details from your dashboard.</p>`;
    ctaButtonHtml = `
      <div class="cta-button-container" style="text-align: center; margin: 30px 0 15px 0;">
          <a href="${invoiceUrl}" target="_blank" class="cta-button" style="background-color: #F48A42; color: #ffffff !important; padding: 14px 28px; text-decoration: none !important; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 18px; font-family: sans-serif;">
              Download Tax Invoice
          </a>
      </div>`;
    orderLinkHtml = `
      <div style="text-align: center; margin-top: 20px;">
          <a href="${orderUrl}" style="color: #F48A42; font-weight: bold; text-decoration: none; font-family: sans-serif;">View Order in Dashboard</a>
      </div>`;
  } else {
    emailSubject = `تم رفع الفاتورة الضريبية للطلب #${orderId} - ${companyName}`;
    headerTitle = "تم رفع الفاتورة الضريبية";
    bodyIntro = `<p style="margin: 0 0 20px 0; font-family: sans-serif;">مرحبًا،</p>
                 <p style="margin: 0 0 20px 0; font-family: sans-serif;">قام المالك برفع الفاتورة الضريبية الخاصة بطلبك رقم #${orderId}.</p>`;
    closingText = `<p style="margin-top: 25px; margin-bottom: 15px; font-family: sans-serif;">يمكنك تحميل الفاتورة الضريبية من خلال الزر أدناه أو عرض تفاصيل طلبك من خلال لوحة التحكم الخاصة بك.</p>`;
    ctaButtonHtml = `
      <div class="cta-button-container" style="text-align: center; margin: 30px 0 15px 0;">
          <a href="${invoiceUrl}" target="_blank" class="cta-button" style="background-color: #F48A42; color: #ffffff !important; padding: 14px 28px; text-decoration: none !important; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 18px; font-family: sans-serif;">
              تحميل الفاتورة الضريبية
          </a>
      </div>`;
    orderLinkHtml = `
      <div style="text-align: center; margin-top: 20px;">
          <a href="${orderUrl}" style="color: #F48A42; font-weight: bold; text-decoration: none; font-family: sans-serif;">عرض الطلب في لوحة التحكم</a>
      </div>`;
  }

  await transporter.sendMail({
    from: `"${process.env.EMAIL_FROM_NAME || companyName}" <${
      process.env.EMAIL_FROM_ADDRESS
    }>`,
    to: email,
    subject: emailSubject,
    headers: {
      "List-Unsubscribe": `<${unsubscribeUrl}>, <mailto:${process.env.EMAIL_FROM_ADDRESS}?subject=unsubscribe>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
    html: `
    <!DOCTYPE html>
    <html dir="${userLang === "en" ? "ltr" : "rtl"}" lang="${userLang}">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>${emailSubject}</title>
        <style type="text/css">
            body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
            table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
            img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
            body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f8f6f2; font-family: sans-serif; }
            .email-container { max-width: 600px; margin: 0 auto; direction: ${userLang === "en" ? "ltr" : "rtl"}; }
            .email-header { background-color: #F48A42; padding: 30px 20px; text-align: center; border-top-left-radius: 12px; border-top-right-radius: 12px; }
            .email-body { background-color: #ffffff; padding: 35px 30px; text-align: start; }
            .email-footer { background-color: #f0f0f0; padding: 30px; text-align: center; font-size: 14px; color: #777777; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px; }
        </style>
    </head>
    <body dir="${userLang === "en" ? "ltr" : "rtl"}">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8f6f2; font-family: sans-serif;">
            <tr>
                <td align="center" style="padding: 20px 0;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" class="email-container" style="box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                        <tr>
                            <td class="email-header">
                                <img src="${logoUrl}" alt="${companyName}" width="170" style="max-width: 170px; margin-bottom: 15px;">
                                <h1 style="margin: 0; font-size: 30px; color: #ffffff; font-weight: bold; font-family: sans-serif;">${headerTitle}</h1>
                            </td>
                        </tr>
                        <tr>
                            <td class="email-body">
                                ${bodyIntro}
                                ${closingText}
                                ${ctaButtonHtml}
                                ${orderLinkHtml}
                            </td>
                        </tr>
                        <tr>
                            <td class="email-footer">
                                <p style="margin: 0 0 10px 0; font-family: sans-serif;">${userLang === "en" ? `All rights reserved © ${new Date().getFullYear()} ${companyName}.` : `جميع الحقوق محفوظة © ${new Date().getFullYear()} ${companyName}.`}</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `
  });
}

export async function sendTaxInvoiceRequestEmail({
  email,
  orderId,
  userLang = "ar",
  checkoutOrigin,
}) {
  const unsubscribeUrl =
    process.env.UNSUBSCRIBE_URL || "https://estajer.com/api/auth/unsubscribe";
  const companyName = process.env.COMPANY_NAME || "Estajer | استأجر";
  const companyAddress = process.env.COMPANY_ADDRESS || "123 Main Street";
  const companyCityCountry =
    process.env.COMPANY_CITY_COUNTRY || "Riyadh, Saudi Arabia";
  const logoUrl =
    "https://res.cloudinary.com/dhfzkadm2/image/upload/v1768056757/logoWhite_l0rabo_wc3lbb.webp";

  const baseUrl =
    checkoutOrigin || process.env.NEXT_PUBLIC_APP_URL || "https://estajer.com";
  const ownerDashboardUrl = `${baseUrl}/dashboard/requests?id=${orderId}`;

  let emailSubject, headerTitle, bodyIntro, closingText, ctaButtonHtml;

  if (userLang === "en") {
    emailSubject = `Tax Invoice Request for Order #${orderId} - ${companyName}`;
    headerTitle = "Tax Invoice Requested";
    bodyIntro = `<p style="margin: 0 0 20px 0; font-family: sans-serif;">Hello,</p>
                 <p style="margin: 0 0 20px 0; font-family: sans-serif;">The renter has requested a tax invoice for the completed order #${orderId}.</p>`;
    closingText = `<p style="margin-top: 25px; margin-bottom: 15px; font-family: sans-serif;">Please log in to your dashboard to upload the tax invoice for this order. You can upload a PDF or an Image file.</p>`;
    ctaButtonHtml = `
      <div class="cta-button-container" style="text-align: center; margin: 30px 0 15px 0;">
          <a href="${ownerDashboardUrl}" target="_blank" class="cta-button" style="background-color: #F48A42; color: #ffffff !important; padding: 14px 28px; text-decoration: none !important; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 18px; font-family: sans-serif;">
              Go to Dashboard
          </a>
      </div>`;
  } else {
    emailSubject = `طلب فاتورة ضريبية للطلب #${orderId} - ${companyName}`;
    headerTitle = "طلب فاتورة ضريبية";
    bodyIntro = `<p style="margin: 0 0 20px 0; font-family: sans-serif;">مرحبًا،</p>
                 <p style="margin: 0 0 20px 0; font-family: sans-serif;">لقد طلب المستأجر فاتورة ضريبية للطلب المكتمل #${orderId}.</p>`;
    closingText = `<p style="margin-top: 25px; margin-bottom: 15px; font-family: sans-serif;">يرجى تسجيل الدخول إلى لوحة التحكم لرفع الفاتورة الضريبية الخاصة بهذا الطلب. يمكنك رفع ملف PDF أو صورة.</p>`;
    ctaButtonHtml = `
      <div class="cta-button-container" style="text-align: center; margin: 30px 0 15px 0;">
          <a href="${ownerDashboardUrl}" target="_blank" class="cta-button" style="background-color: #F48A42; color: #ffffff !important; padding: 14px 28px; text-decoration: none !important; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 18px; font-family: sans-serif;">
              الذهاب إلى لوحة التحكم
          </a>
      </div>`;
  }

  await transporter.sendMail({
    from: `"${process.env.EMAIL_FROM_NAME || companyName}" <${
      process.env.EMAIL_FROM_ADDRESS
    }>`,
    to: email,
    subject: emailSubject,
    headers: {
      "List-Unsubscribe": `<${unsubscribeUrl}>, <mailto:${process.env.EMAIL_FROM_ADDRESS}?subject=unsubscribe>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
    html: `
    <!DOCTYPE html>
    <html dir="${userLang === "en" ? "ltr" : "rtl"}" lang="${userLang}">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>${emailSubject}</title>
        <style type="text/css">
            body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
            table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
            img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
            body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f8f6f2; font-family: sans-serif; }
            .email-container { max-width: 600px; margin: 0 auto; direction: ${userLang === "en" ? "ltr" : "rtl"}; }
            .email-header { background-color: #F48A42; padding: 30px 20px; text-align: center; border-top-left-radius: 12px; border-top-right-radius: 12px; }
            .email-body { background-color: #ffffff; padding: 35px 30px; text-align: start; }
            .email-footer { background-color: #f0f0f0; padding: 30px; text-align: center; font-size: 14px; color: #777777; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px; }
        </style>
    </head>
    <body dir="${userLang === "en" ? "ltr" : "rtl"}">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8f6f2; font-family: sans-serif;">
            <tr>
                <td align="center" style="padding: 20px 0;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" class="email-container" style="box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                        <tr>
                            <td class="email-header">
                                <img src="${logoUrl}" alt="${companyName}" width="170" style="max-width: 170px; margin-bottom: 15px;">
                                <h1 style="margin: 0; font-size: 30px; color: #ffffff; font-weight: bold; font-family: sans-serif;">${headerTitle}</h1>
                            </td>
                        </tr>
                        <tr>
                            <td class="email-body">
                                ${bodyIntro}
                                ${closingText}
                                ${ctaButtonHtml}
                            </td>
                        </tr>
                        <tr>
                            <td class="email-footer">
                                <p style="margin: 0 0 10px 0; font-family: sans-serif;">${userLang === "en" ? `All rights reserved © ${new Date().getFullYear()} ${companyName}.` : `جميع الحقوق محفوظة © ${new Date().getFullYear()} ${companyName}.`}</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `
  });
}
