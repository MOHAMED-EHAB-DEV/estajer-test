import { transporter } from "../email"; // Assuming this is correctly set up

export async function sendProductNotificationEmail(
  email,
  productName,
  status,
  reason = "",
  userLang = "ar",
  unsubscribed = false,
) {
  if (unsubscribed) return;
  const unsubscribeUrl =
    process.env.UNSUBSCRIBE_URL || "https://estajer.com/unsubscribe";
  const companyName = process.env.COMPANY_NAME || "Estajer | استأجر";
  const companyAddress = process.env.COMPANY_ADDRESS || "123 Main Street";
  const companyCityCountry =
    process.env.COMPANY_CITY_COUNTRY || "Riyadh, Saudi Arabia";
  const logoUrl =
    "https://res.cloudinary.com/dhfzkadm2/image/upload/v1768056757/logoWhite_l0rabo_wc3lbb.webp";
  const dashboardUrl = "https://estajer.com/dashboard/products";
  const productGuidelinesUrl =
    process.env.PRODUCT_GUIDELINES_URL || "https://estajer.com/privacy";
  const isApproved = status === "approved";

  // Language-specific email subject
  let emailSubject;
  if (userLang === "en") {
    const subjectStatus = isApproved ? "approved" : "rejected";
    emailSubject = `Update about your product "${productName}" - ${subjectStatus}`;
  } else {
    const subjectStatus = isApproved ? "قبول" : "رفض";
    emailSubject = `تحديث بخصوص منتجك "${productName}" - تم ${subjectStatus}`;
  }

  // Language-specific header title
  const headerTitle =
    userLang === "en"
      ? isApproved
        ? "🎉 Your Product Approved!"
        : "Update About Your Product"
      : isApproved
        ? "🎉 تم قبول منتجك!"
        : "تحديث بخصوص منتجك";

  // Language-specific body message
  let bodyMessage;
  if (userLang === "en") {
    bodyMessage = `<p style="margin: 0 0 18px 0; font-family: sans-serif;">Hello,</p>`;
    if (isApproved) {
      bodyMessage += `<p style="margin: 0 0 18px 0; font-family: sans-serif;">Great news! We're pleased to inform you that your product <strong>"${productName}"</strong> has been approved and is now ready to be displayed on the ${companyName} platform.</p>
                      <p style="margin: 0 0 18px 0; font-family: sans-serif;">You can now manage your product and view its details through your dashboard.</p>`;
    } else {
      bodyMessage += `<p style="margin: 0 0 18px 0; font-family: sans-serif;">We would like to inform you that after reviewing your product <strong>"${productName}"</strong>, it was decided not to approve it at this time.</p>`;
      if (reason) {
        bodyMessage += `<div style="margin: 0 0 18px 0; padding: 12px 18px; background-color: #fff5f5; border: 1px solid #e0b4b4; border-radius: 8px; color: #721c24; font-family: sans-serif;">
                          <p style="margin: 0 0 8px 0; font-weight: bold; font-family: sans-serif;">Reason for rejection:</p>
                          <p style="margin: 0; font-family: sans-serif;">${reason}</p>
                        </div>`;
      }
      bodyMessage += `<p style="margin: 0 0 18px 0; font-family: sans-serif;">We encourage you to review the <a href="${productGuidelinesUrl}" target="_blank" style="color: #F48A42; text-decoration: underline; font-family: sans-serif;">product posting guidelines</a> and make the necessary adjustments before resubmitting if possible.</p>
                      <p style="margin: 0 0 18px 0; font-family: sans-serif;">If you have any questions, please don't hesitate to visit your dashboard or contact our support team.</p>`;
    }
  } else {
    bodyMessage = `<p style="margin: 0 0 18px 0; font-family: sans-serif;">مرحبًا،</p>`;
    if (isApproved) {
      bodyMessage += `<p style="margin: 0 0 18px 0; font-family: sans-serif;">خبر رائع! يسعدنا إعلامك بأنه تم قبول منتجك <strong>"${productName}"</strong> وهو الآن جاهز للعرض على منصة ${companyName}.</p>
                      <p style="margin: 0 0 18px 0; font-family: sans-serif;">يمكنك الآن إدارة منتجك والاطلاع على تفاصيله من خلال لوحة التحكم الخاصة بك.</p>`;
    } else {
      bodyMessage += `<p style="margin: 0 0 18px 0; font-family: sans-serif;">نود إعلامك بأنه بعد مراجعة منتجك <strong>"${productName}"</strong>، تقرر عدم قبوله في الوقت الحالي.</p>`;
      if (reason) {
        bodyMessage += `<div style="margin: 0 0 18px 0; padding: 12px 18px; background-color: #fff5f5; border: 1px solid #e0b4b4; border-radius: 8px; color: #721c24; font-family: sans-serif;">
                          <p style="margin: 0 0 8px 0; font-weight: bold; font-family: sans-serif;">سبب عدم القبول:</p>
                          <p style="margin: 0; font-family: sans-serif;">${reason}</p>
                        </div>`;
      }
      bodyMessage += `<p style="margin: 0 0 18px 0; font-family: sans-serif;">نشجعك على مراجعة <a href="${productGuidelinesUrl}" target="_blank" style="color: #F48A42; text-decoration: underline; font-family: sans-serif;">إرشادات نشر المنتجات</a> وإجراء التعديلات اللازمة وإعادة تقديمه إذا أمكن.</p>
                      <p style="margin: 0 0 18px 0; font-family: sans-serif;">إذا كانت لديك أي أسئلة، فلا تتردد في زيارة لوحة التحكم الخاصة بك أو التواصل مع فريق الدعم.</p>`;
    }
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
            .email-body strong {
                font-weight: bold;
            }
            
            .cta-button-container {
                text-align: center;
                margin: 25px 0 10px 0;
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
                ? `Important update about your product "${productName}" on ${companyName} platform.`
                : `تحديث مهم بخصوص منتجك "${productName}" على منصة ${companyName}.`
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
                                ${bodyMessage}
                                <div class="cta-button-container" style="text-align: center; margin: 25px 0 10px 0;">
                                    <a href="${dashboardUrl}" target="_blank" class="cta-button" style="background-color: #F48A42; color: #ffffff !important; padding: 14px 28px; text-decoration: none !important; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 18px; font-family: sans-serif;">
                                        ${
                                          userLang === "en"
                                            ? "Go to Dashboard"
                                            : "الذهاب إلى لوحة التحكم"
                                        }
                                    </a>
                                </div>
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
                                        ? `You are receiving this message as part of your account notifications. To manage notification preferences, please visit your account settings or <a href="${unsubscribeUrl}" target="_blank" style="color: #F48A42; text-decoration: none; font-weight: bold; font-family: sans-serif;">unsubscribe</a> from some messages.`
                                        : `تستقبل هذه الرسالة كجزء من إشعارات حسابك. لإدارة تفضيلات الإشعارات، يرجى زيارة إعدادات حسابك أو <a href="${unsubscribeUrl}" target="_blank" style="color: #F48A42; text-decoration: none; font-weight: bold; font-family: sans-serif;">إلغاء الاشتراك</a> من بعض الرسائل.`
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
