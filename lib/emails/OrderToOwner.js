import { transporter } from "../email";

export async function sendNewOrderToOwnerEmail({
  ownerEmail,
  customerName,
  items,
  totalEarnings,
  orderId,
  userLang = "ar",
}) {
  const unsubscribeUrl =
    process.env.UNSUBSCRIBE_URL || "https://estajer.com/unsubscribe";
  const companyName = process.env.COMPANY_NAME || "Estajer | استأجر";
  const companyAddress = process.env.COMPANY_ADDRESS || "123 Main Street";
  const companyCityCountry =
    process.env.COMPANY_CITY_COUNTRY || "Riyadh, Saudi Arabia";
  const logoUrl =
    "https://res.cloudinary.com/dhfzkadm2/image/upload/v1768056757/logoWhite_l0rabo_wc3lbb.webp";
  // Link to the owner's specific order or general dashboard for their listings/orders
  const ownerDashboardOrderUrl = `${
    process.env.NEXT_PUBLIC_APP_URL || "https://estajer.com"
  }/dashboard/requests?id=${orderId}`;
  const currencySymbol = process.env.CURRENCY_SYMBOL || "ر.س";

  // Language-specific content
  const emailSubject =
    userLang === "en"
      ? `🎉 New Order for Your Product on ${companyName}`
      : `🎉 طلب جديد لمنتجك على ${companyName}`;

  const headerTitle =
    userLang === "en"
      ? "🎉 New Order for Your Product!"
      : "🎉 طلب جديد لمنتجك!";

  let bodyIntro =
    userLang === "en"
      ? `<p style="margin: 0 0 18px 0; font-family: sans-serif;">Hello,</p>`
      : `<p style="margin: 0 0 18px 0; font-family: sans-serif;">مرحباً،</p>`;

  bodyIntro +=
    userLang === "en"
      ? `<p style="margin: 0 0 18px 0; font-family: sans-serif;">Congratulations! You have received a new order for your products on ${companyName} platform.`
      : `<p style="margin: 0 0 18px 0; font-family: sans-serif;">تهانينا! لقد تلقيت طلبًا جديدًا لمنتجاتك على منصة ${companyName}.`;

  if (customerName) {
    bodyIntro +=
      userLang === "en"
        ? ` The order is from customer: <strong>${customerName}</strong>.`
        : ` الطلب مقدم من العميل: <strong>${customerName}</strong>.`;
  }

  bodyIntro +=
    userLang === "en"
      ? `</p><p style="margin: 0 0 18px 0; font-family: sans-serif;">Please review the order details below and open the platform to accept or reject the order.</p>`
      : `</p><p style="margin: 0 0 18px 0; font-family: sans-serif;">يرجى مراجعة تفاصيل الطلب أدناه وفتح المنصة لقبول او رفض الطلب.</p>`;

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
        <div style="display: flex;gap: 25px;">
          ${
            userLang === "en"
              ? `<p style="margin: 0 0 5px 0; color: #555555; font-size: 16px; font-family: sans-serif;">Rental Start Date: ${new Date(
                  item.startDate,
                ).toLocaleDateString("en", {
                  weekday: "long",
                  year: "numeric",
                  month: "numeric",
                  day: "numeric",
                })}</p>`
              : `<p style="margin: 0 0 5px 0; color: #555555; font-size: 16px; font-family: sans-serif;">تاريخ بدء الإيجار: ${new Date(
                  item.startDate,
                ).toLocaleDateString("ar", {
                  weekday: "long",
                  year: "numeric",
                  month: "numeric",
                  day: "numeric",
                })}</p>`
          }
          ${
            userLang === "en"
              ? `<p style="margin: 0 0 8px 0; color: #555555; font-size: 16px; font-family: sans-serif;">Rental End Date: ${new Date(
                  item.endDate,
                ).toLocaleDateString("en", {
                  weekday: "long",
                  year: "numeric",
                  month: "numeric",
                  day: "numeric",
                })}</p>`
              : `<p style="margin: 0 0 8px 0; color: #555555; font-size: 16px; font-family: sans-serif;">تاريخ انتهاء الإيجار: ${new Date(
                  item.endDate,
                ).toLocaleDateString("ar", {
                  weekday: "long",
                  year: "numeric",
                  month: "numeric",
                  day: "numeric",
                })}</p>`
          }
        </div>
    </div>
  `,
    )
    .join("");

  let earningsHtml = "";
  if (typeof totalEarnings !== "undefined") {
    earningsHtml = `
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 25px; font-family: sans-serif;">
      <tr style="font-family: sans-serif;">
        <td align="right" style="padding: 10px 0; font-family: sans-serif;">
          <p style="margin: 0; font-size: 18px; font-weight: bold; color: #333333; font-family: sans-serif;">${
            userLang === "en"
              ? "Your expected earnings from this order:"
              : "إجمالي أرباحك المتوقعة من هذا الطلب:"
          }</p>
        </td>
        <td align="left" style="padding: 10px 0; font-family: sans-serif;">
          <p style="margin: 0; font-size: 18px; font-weight: bold; color: #f48a42; direction: ltr; font-family: sans-serif;">${totalEarnings} ${currencySymbol}</p>
        </td>
      </tr>
    </table>`;
  }

  await transporter.sendMail({
    from: `"${process.env.EMAIL_FROM_NAME || companyName}" <${
      process.env.EMAIL_FROM_ADDRESS
    }>`,
    to: ownerEmail,
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
                background-color: #F48A42;
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
            .email-body strong { /* For customer name highlight */
                font-weight: bold;
                color: #F48A42;
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
              userLang === "en"
                ? `New order for your product! Get ready to fulfill a new customer order on ${companyName}.`
                : `طلب جديد لمنتجك! استعد لتلبية طلب عميل جديد على ${companyName}.`
            }
        </div>

        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8f6f2; font-family: sans-serif;">
            <tr>
                <td align="center" style="padding: 20px 0;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" class="email-container" style="font-family: sans-serif; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                        <!-- Header -->
                        <tr>
                            <td class="email-header" style="background-color: #F48A42; padding: 30px 20px; text-align: center; border-top-left-radius: 12px; border-top-right-radius: 12px;">
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
                                
                                ${earningsHtml}

                                <div class="cta-button-container" style="text-align: center; margin: 30px 0 10px 0;">
                                    <a href="${ownerDashboardOrderUrl}" target="_blank" class="cta-button" style="background-color: #F48A42; color: #ffffff !important; padding: 14px 28px; text-decoration: none !important; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 18px; font-family: sans-serif;">
                                        ${
                                          userLang === "en"
                                            ? "View Order Details"
                                            : "عرض تفاصيل الطلب"
                                        }
                                    </a>
                                </div>
                                <p style="margin: 20px 0 0; font-family: sans-serif;">${
                                  userLang === "en"
                                    ? "Don't forget to contact the customer to coordinate the delivery process if necessary."
                                    : "لا تنسَ التواصل مع العميل لتنسيق عملية التسليم إذا لزم الأمر."
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
                                        ? "You are receiving this message as a notification of a new order for your products. To manage notification preferences, please visit your account settings."
                                        : "تستقبل هذه الرسالة كإشعار بطلب جديد على منتجاتك. لإدارة تفضيلات الإشعارات، يرجى زيارة إعدادات حسابك."
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
