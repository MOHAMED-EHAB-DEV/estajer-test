import { transporter } from "../email";

export async function sendCashoutRequirementsEmail(
  email,
  ownerName,
  userLang = "ar",
) {
  const unsubscribeUrl =
    process.env.UNSUBSCRIBE_URL || "https://estajer.com/unsubscribe";
  const companyName = process.env.COMPANY_NAME || "Estajer | استأجر";
  const companyAddress = process.env.COMPANY_ADDRESS || "123 Main Street";
  const companyCityCountry =
    process.env.COMPANY_CITY_COUNTRY || "Riyadh, Saudi Arabia";
  const logoUrl =
    "https://res.cloudinary.com/dhfzkadm2/image/upload/v1768056757/logoWhite_l0rabo_wc3lbb.webp";
  const settingsUrl =
    process.env.DASHBOARD_URL ||
    "https://estajer.com/dashboard/renter-settings";

  const emailSubject =
    userLang === "en"
      ? `Action Required: Complete Your Profile for Cash-Out - ${companyName}`
      : `مطلوب إجراء: أكمل ملفك الشخصي لسحب الأموال - ${companyName}`;

  const headerTitle =
    userLang === "en"
      ? "🔔 Action Required for Cash-Out"
      : "🔔 مطلوب إجراء لسحب الأموال";

  const bodyIntro =
    userLang === "en"
      ? `<p style="margin: 0 0 18px 0; font-family: sans-serif;">Hello ${ownerName},</p>
       <p style="margin: 0 0 18px 0; font-family: sans-serif;">We're ready to process your cash-out request, but we need some additional information from you to complete the transaction.</p>`
      : `<p style="margin: 0 0 18px 0; font-family: sans-serif;">مرحبًا ${ownerName}،</p>
       <p style="margin: 0 0 18px 0; font-family: sans-serif;">نحن مستعدون لمعالجة طلب سحب الأموال الخاص بك، ولكننا نحتاج إلى بعض المعلومات الإضافية منك لإكمال المعاملة.</p>`;

  const requirementsTitle =
    userLang === "en" ? "Required Information:" : "المعلومات المطلوبة:";

  const requirementsList =
    userLang === "en"
      ? `<ul style="margin: 0 0 18px 0; padding-left: 20px; font-family: sans-serif;">
         <li style="margin-bottom: 8px; font-family: sans-serif;">📍 <strong>Location Coordinates:</strong> We need your precise location to process payments correctly.</li>
         <li style="margin-bottom: 8px; font-family: sans-serif;">🏦 <strong>IBAN Number:</strong> Your International Bank Account Number is required for direct bank transfers.</li>
       </ul>`
      : `<ul style="margin: 0 0 18px 0; padding-right: 20px; font-family: sans-serif;">
         <li style="margin-bottom: 8px; font-family: sans-serif;">📍 <strong>إحداثيات الموقع:</strong> نحتاج إلى موقعك الدقيق لمعالجة المدفوعات بشكل صحيح.</li>
         <li style="margin-bottom: 8px; font-family: sans-serif;">🏦 <strong>رقم الآيبان:</strong> رقم حسابك المصرفي الدولي مطلوب للتحويلات المصرفية المباشرة.</li>
       </ul>`;

  const actionText =
    userLang === "en"
      ? `<p style="margin: 0 0 18px 0; font-family: sans-serif;">Please update your profile with this information to proceed with your cash-out request. Once you've added the required details, we'll automatically process your payment.</p>`
      : `<p style="margin: 0 0 18px 0; font-family: sans-serif;">يرجى تحديث ملفك الشخصي بهذه المعلومات للمتابعة مع طلب سحب الأموال. بمجرد إضافة التفاصيل المطلوبة، سنقوم بمعالجة دفعتك تلقائيًا.</p>`;

  const buttonText =
    userLang === "en"
      ? "Update Profile Settings"
      : "تحديث إعدادات الملف الشخصي";

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
    <html dir="${userLang === "en" ? "ltr" : "rtl"}" lang="${userLang === "en" ? "en" : "ar"}">
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
            
            .requirements-section {
                background-color: #fff8f0;
                border: 2px solid #F48A42;
                border-radius: 8px;
                padding: 20px;
                margin: 25px 0;
            }
            
            .requirements-title {
                margin: 0 0 15px 0;
                font-size: 20px;
                color: #F48A42;
                font-weight: bold;
                border-bottom: 1px solid #F48A42;
                padding-bottom: 8px;
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
            ${userLang === "en" ? `Complete your profile to receive your cash-out from ${companyName}.` : `أكمل ملفك الشخصي لاستلام أموالك من ${companyName}.`}
        </div>

        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8f6f2; font-family: sans-serif;">
            <tr>
                <td align="center" style="padding: 20px 0;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" class="email-container" style="font-family: sans-serif; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                        <!-- Header -->
                        <tr>
                            <td class="email-header" style="background-color: #F48A42; padding: 30px 20px; text-align: center; border-top-left-radius: 12px; border-top-right-radius: 12px;">
                                <img src="${logoUrl}" alt="${userLang === "en" ? `${companyName} Logo` : `شعار ${companyName}`}" width="170" style="max-width: 170px; margin-bottom: 15px;">
                                <h1 style="margin: 0; font-size: 30px; color: #ffffff; font-weight: bold; font-family: sans-serif;">${headerTitle}</h1>
                            </td>
                        </tr>

                        <!-- Body -->
                        <tr>
                            <td class="email-body" style="background-color: #ffffff; padding: 35px 30px; text-align: start; font-family: sans-serif;">
                                ${bodyIntro}
                                
                                <div class="requirements-section" style="background-color: #fff8f0; border: 2px solid #F48A42; border-radius: 8px; padding: 20px; margin: 25px 0;">
                                    <h3 class="requirements-title" style="margin: 0 0 15px 0; font-size: 20px; color: #F48A42; font-weight: bold; border-bottom: 1px solid #F48A42; padding-bottom: 8px; font-family: sans-serif;">${requirementsTitle}</h3>
                                    ${requirementsList}
                                </div>
                                
                                ${actionText}

                                <div class="cta-button-container" style="text-align: center; margin: 30px 0 10px 0;">
                                    <a href="${settingsUrl}" target="_blank" class="cta-button" style="background-color: #F48A42; color: #ffffff !important; padding: 14px 28px; text-decoration: none !important; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 18px; font-family: sans-serif;">
                                        ${buttonText}
                                    </a>
                                </div>
                                
                                <p style="margin: 0 0 18px 0; font-family: sans-serif;">${userLang === "en" ? "If you have any questions, please don't hesitate to contact our support team." : "إذا كانت لديك أي أسئلة، يرجى عدم التردد في التواصل مع فريق الدعم."}</p>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td class="email-footer" style="background-color: #f0f0f0; padding: 30px; text-align: center; font-size: 14px; color: #777777; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px; font-family: sans-serif;">
                                <p style="margin: 0 0 10px 0; font-family: sans-serif;">${userLang === "en" ? `All rights reserved © ${new Date().getFullYear()} ${companyName}.` : `جميع الحقوق محفوظة © ${new Date().getFullYear()} ${companyName}.`}</p>
                                <p style="margin: 0 0 10px 0; font-family: sans-serif;">${companyAddress} | ${companyCityCountry}</p>
                                <p style="display: block; margin-top:12px; font-family: sans-serif;">
                                    ${userLang === "en" ? `You are receiving this message regarding your cash-out request. To manage notification preferences, please visit your account settings or <a href="${unsubscribeUrl}" target="_blank" style="color: #F48A42; text-decoration: none; font-weight: bold; font-family: sans-serif;">unsubscribe</a> from some messages.` : `تستقبل هذه الرسالة بخصوص طلب سحب الأموال. لإدارة تفضيلات الإشعارات، يرجى زيارة إعدادات حسابك أو <a href="${unsubscribeUrl}" target="_blank" style="color: #F48A42; text-decoration: none; font-weight: bold; font-family: sans-serif;">إلغاء الاشتراك</a> من بعض الرسائل.`}
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
