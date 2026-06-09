import { transporter } from "../email";

export async function sendPaymentNotificationEmail({
  email,
  customerName,
  items,
  totalAmount,
  orderId,
  paymentStatus, // 'success' or 'failed'
  userLang = "ar",
  invoiceUrl = null,
  dashboardUrl = null,
  paymentUrl = null,
}) {
  const unsubscribeUrl =
    process.env.UNSUBSCRIBE_URL || "https://estajer.com/unsubscribe";
  const companyName = process.env.COMPANY_NAME || "Estajer | استأجر";
  const companyAddress = process.env.COMPANY_ADDRESS || "123 Main Street";
  const companyCityCountry =
    process.env.COMPANY_CITY_COUNTRY || "Riyadh, Saudi Arabia";
  const logoUrl =
    "https://res.cloudinary.com/dhfzkadm2/image/upload/v1768056757/logoWhite_l0rabo_wc3lbb.webp";
  const currencySymbol = process.env.CURRENCY_SYMBOL || "ر.س";

  const isSuccess = paymentStatus === "success";
  const defaultDashboardUrl =
    dashboardUrl ||
    `${
      process.env.NEXT_PUBLIC_APP_URL || "https://estajer.com"
    }/dashboard/my-orders`;

  // Language-specific content
  const emailSubject = isSuccess
    ? userLang === "en"
      ? `✅ Payment Successful - Order #${orderId} - ${companyName}`
      : `✅ تم الدفع بنجاح - طلب رقم ${orderId} - ${companyName}`
    : userLang === "en"
      ? `❌ Payment Failed - Order #${orderId} - ${companyName}`
      : `❌ فشل في الدفع - طلب رقم ${orderId} - ${companyName}`;

  const headerTitle = isSuccess
    ? userLang === "en"
      ? "✅ Payment Successful!"
      : "✅ تم الدفع بنجاح!"
    : userLang === "en"
      ? "❌ Payment Failed"
      : "❌ فشل في الدفع";

  let bodyIntro =
    userLang === "en"
      ? `<p style="margin: 0 0 18px 0; font-family: sans-serif;">Hello ${
          customerName ? customerName.split(" ")[0] : ""
        },</p>`
      : `<p style="margin: 0 0 18px 0; font-family: sans-serif;">مرحباً ${
          customerName ? customerName.split(" ")[0] : ""
        }،</p>`;

  if (isSuccess) {
    bodyIntro +=
      userLang === "en"
        ? `<p style="margin: 0 0 18px 0; font-family: sans-serif;">Great news! Your payment has been processed successfully for order #${orderId}. Your rental request is now pending approval from the product owner.</p>
         <p style="margin: 0 0 18px 0; font-family: sans-serif;">You will receive another notification once the owner responds to your request.</p>`
        : `<p style="margin: 0 0 18px 0; font-family: sans-serif;">خبر رائع! تم معالجة دفعتك بنجاح للطلب رقم ${orderId}.<br/> طلب الإيجار الخاص بك الآن في انتظار موافقة مالك المنتج.</p>
         <p style="margin: 0 0 18px 0; font-family: sans-serif;">ستتلقى إشعاراً آخر بمجرد رد المالك على طلبك.</p>`;
  } else {
    bodyIntro +=
      userLang === "en"
        ? `<p style="margin: 0 0 18px 0; font-family: sans-serif;">Unfortunately, there was an issue processing your payment for order #${orderId}. Please try again or contact our support team for assistance.</p>
         <p style="margin: 0 0 18px 0; font-family: sans-serif;">You can retry the payment using the button below or contact our customer support.</p>`
        : `<p style="margin: 0 0 18px 0; font-family: sans-serif;">للأسف، حدثت مشكلة في معالجة دفعتك للطلب رقم ${orderId}. يرجى المحاولة مرة أخرى أو التواصل مع فريق الدعم للمساعدة.</p>
         <p style="margin: 0 0 18px 0; font-family: sans-serif;">يمكنك إعادة المحاولة باستخدام الزر أدناه أو التواصل مع دعم العملاء.</p>`;
  }

  const itemsHtml = items
    .map(
      (item) => `
       <div class="order-item-box" style="background-color: #f5f5f5; border-radius: 8px; padding: 15px; margin-bottom: 12px; font-family: sans-serif;">
        <p style="margin: 0 0 8px 0; color: #333333; font-size: 18px; font-family: sans-serif; font-weight: bold;">${
          item.name ||
          (userLang === "en"
            ? "Product name not available"
            : "اسم المنتج غير متوفر")
        }</p>
        <div style="display: flex; gap: 25px; flex-wrap: wrap;">
          ${
            item.startDate
              ? userLang === "en"
                ? `<p style="margin: 0 0 5px 0; color: #555555; font-size: 16px; font-family: sans-serif;">Start Date: ${item.startDate}</p>`
                : `<p style="margin: 0 0 5px 0; color: #555555; font-size: 16px; font-family: sans-serif;">تاريخ البدء: ${item.startDate}</p>`
              : ""
          }
          ${
            item.endDate
              ? userLang === "en"
                ? `<p style="margin: 0 0 8px 0; color: #555555; font-size: 16px; font-family: sans-serif;">End Date: ${item.endDate}</p>`
                : `<p style="margin: 0 0 8px 0; color: #555555; font-size: 16px; font-family: sans-serif;">تاريخ الانتهاء: ${item.endDate}</p>`
              : ""
          }
        </div>
    </div>
  `,
    )
    .join("");

  let totalHtml = "";
  if (totalAmount) {
    totalHtml = `
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 25px; font-family: sans-serif;">
      <tr style="font-family: sans-serif;">
        <td align="right" style="padding: 10px 0; font-family: sans-serif;">
          <p style="margin: 0; font-size: 18px; font-weight: bold; color: #333333; font-family: sans-serif;">${
            userLang === "en" ? "Total Amount:" : "المبلغ الإجمالي:"
          }</p>
        </td>
        <td align="left" style="padding: 10px 0; font-family: sans-serif;">
          <p style="margin: 0; font-size: 18px; font-weight: bold; color: #f48a42; direction: ltr; font-family: sans-serif;">${totalAmount} ${currencySymbol}</p>
        </td>
      </tr>
    </table>`;
  }

  // Action buttons based on payment status
  let actionButtonsHtml = "";
  if (isSuccess) {
    actionButtonsHtml = `
      <div class="cta-button-container" style="text-align: center; margin: 30px 0 10px 0;">
        <a href="${defaultDashboardUrl}" target="_blank" class="cta-button" style="background-color: #F48A42; color: #ffffff !important; padding: 14px 28px; text-decoration: none !important; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 18px; font-family: sans-serif; margin: 0 10px 10px 0;">
          ${userLang === "en" ? "View My Orders" : "عرض طلباتي"}
        </a>
        ${
          invoiceUrl
            ? `
        <a href="${invoiceUrl}" target="_blank" class="cta-button" style="background-color: #28a745; color: #ffffff !important; padding: 14px 28px; text-decoration: none !important; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 18px; font-family: sans-serif; margin: 0 10px 10px 0;">
          ${userLang === "en" ? "Download Invoice" : "تحميل الفاتورة"}
        </a>`
            : ""
        }
      </div>`;
  } else {
    actionButtonsHtml = `
      <div class="cta-button-container" style="text-align: center; margin: 30px 0 10px 0;">
        ${
          paymentUrl
            ? `
        <a href="${paymentUrl}" target="_blank" class="cta-button" style="background-color: #F48A42; color: #ffffff !important; padding: 14px 28px; text-decoration: none !important; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 18px; font-family: sans-serif; margin: 0 10px 10px 0;">
          ${userLang === "en" ? "Retry Payment" : "إعادة المحاولة"}
        </a>`
            : ""
        }
        <a href="${defaultDashboardUrl}" target="_blank" class="cta-button" style="background-color: #6c757d; color: #ffffff !important; padding: 14px 28px; text-decoration: none !important; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 18px; font-family: sans-serif; margin: 0 10px 10px 0;">
          ${userLang === "en" ? "View My Orders" : "عرض طلباتي"}
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
    <html dir="${userLang === "en" ? "ltr" : "rtl"}" lang="${
      userLang === "en" ? "en" : "ar"
    }">
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

            .email-container {
                font-family: sans-serif;
                font-size: 18px;
                line-height: 1.6;
                color: #333333;
                max-width: 600px;
                margin: 0 auto;
                direction: ${userLang === "en" ? "ltr" : "rtl"};
            }

            .email-header {
                background-color: ${isSuccess ? "#F48A42" : "#dc3545"};
                padding: 30px 20px;
                text-align: center;
                border-top-left-radius: 12px;
                border-top-right-radius: 12px;
            }
            .email-header img {
                max-width: 170px;
                margin-bottom: 15px;
            }
            .email-header h1 {
                margin: 0;
                font-size: 30px;
                color: #ffffff;
                font-weight: bold;
            }

            .email-body {
                background-color: #ffffff;
                padding: 35px 30px;
                text-align: start;
            }
            .email-body p {
                margin: 0 0 18px 0;
            }
            
            .order-details-heading {
                margin-top: 30px;
                margin-bottom: 20px;
                font-size: 20px;
                color: #333333;
                border-bottom: 1px solid #dddddd;
                padding-bottom: 10px; 
            }

            .cta-button-container {
                text-align: center;
                margin: 30px 0 10px 0;
            }
            .cta-button {
                background-color: #F48A42;
                color: #ffffff !important;
                padding: 14px 28px;
                text-decoration: none !important;
                border-radius: 8px;
                display: inline-block;
                font-weight: bold;
                font-size: 18px;
            }

            .email-footer {
                background-color: #f0f0f0;
                padding: 30px;
                text-align: center;
                font-size: 14px;
                color: #777777;
                border-bottom-left-radius: 12px;
                border-bottom-right-radius: 12px;
            }
            .email-footer p {
                margin: 0 0 10px 0;
            }
            .email-footer a {
                color: #F48A42;
                text-decoration: none;
                font-weight: bold;
            }
            .hidden-preheader {
              display: none;
              font-size: 1px;
              color: #f8f6f2;
              line-height: 1px;
              max-height: 0px;
              max-width: 0px;
              opacity: 0;
              overflow: hidden;
            }
        </style>
    </head>
    <body dir="${userLang === "en" ? "ltr" : "rtl"}">
        <div class="hidden-preheader">
            ${
              isSuccess
                ? userLang === "en"
                  ? `Payment successful for order #${orderId} on ${companyName}.`
                  : `تم الدفع بنجاح للطلب رقم ${orderId} على ${companyName}.`
                : userLang === "en"
                  ? `Payment failed for order #${orderId} on ${companyName}.`
                  : `فشل الدفع للطلب رقم ${orderId} على ${companyName}.`
            }
        </div>

        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8f6f2; font-family: sans-serif;">
            <tr>
                <td align="center" style="padding: 20px 0;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" class="email-container" style="font-family: sans-serif; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                        <!-- Header -->
                        <tr>
                            <td class="email-header" style="background-color: ${
                              isSuccess ? "#F48A42" : "#dc3545"
                            }; padding: 30px 20px; text-align: center; border-top-left-radius: 12px; border-top-right-radius: 12px;">
                                <img src="${logoUrl}" alt="${
                                  userLang === "en"
                                    ? `${companyName} Logo`
                                    : `شعار ${companyName}`
                                }" width="170" style="max-width: 170px; margin-bottom: 15px;">
                                <h1 style="margin: 0; font-size: 30px; color: #ffffff; font-weight: bold; font-family: sans-serif;">${headerTitle}</h1>
                            </td>
                        </tr>

                        <!-- Body -->
                        <tr>
                            <td class="email-body" style="background-color: #ffffff; padding: 35px 30px; text-align: start; font-family: sans-serif;">
                                ${bodyIntro}
                                
                                <h3 class="order-details-heading" style="margin-top: 30px; margin-bottom: 20px; font-size: 20px; color: #333333; border-bottom: 1px solid #dddddd; padding-bottom: 10px; font-family: sans-serif;">${
                                  userLang === "en"
                                    ? "Order Details:"
                                    : "تفاصيل الطلب:"
                                }</h3>
                                
                                ${itemsHtml} 
                                
                                ${totalHtml}

                                ${actionButtonsHtml}
                                
                                <p style="margin: 20px 0 0; font-family: sans-serif;">${
                                  userLang === "en"
                                    ? "If you have any questions, please don't hesitate to contact our customer support."
                                    : "إذا كانت لديك أي أسئلة، يرجى عدم التردد في التواصل مع دعم العملاء."
                                }</p>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td class="email-footer" style="background-color: #f0f0f0; padding: 30px; text-align: center; font-size: 14px; color: #777777; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px; font-family: sans-serif;">
                                <p style="margin: 0 0 10px 0; font-family: sans-serif;">${
                                  userLang === "en"
                                    ? `All rights reserved © ${new Date().getFullYear()} ${companyName}.`
                                    : `جميع الحقوق محفوظة © ${new Date().getFullYear()} ${companyName}.`
                                }</p>
                                <p style="margin: 0 0 10px 0; font-family: sans-serif;">${companyAddress} | ${companyCityCountry}</p>
                                <p style="display: block; margin-top:12px; font-family: sans-serif;">
                                    ${
                                      userLang === "en"
                                        ? `You are receiving this message as part of your payment notifications. To manage notification preferences, please visit your account settings or <a href="${unsubscribeUrl}" target="_blank" style="color: #F48A42; text-decoration: none; font-weight: bold; font-family: sans-serif;">unsubscribe</a> from some messages.`
                                        : `تستقبل هذه الرسالة كجزء من إشعارات الدفع. لإدارة تفضيلات الإشعارات، يرجى زيارة إعدادات حسابك أو <a href="${unsubscribeUrl}" target="_blank" style="color: #F48A42; text-decoration: none; font-weight: bold; font-family: sans-serif;">إلغاء الاشتراك</a> من بعض الرسائل.`
                                    }
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `,
  });
}
