import { transporter } from "../email";

export async function sendDeliveryConfirmationEmail({
  email,
  items,
  orderId,
  isOwner,
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

  const renterConfirmationBaseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://estajer.com";
  const renterConfirmationUrl = `${renterConfirmationBaseUrl}/documentation/${orderId}`;

  // Language-specific email subject and header
  let emailSubject, headerTitle;
  if (userLang === "en") {
    emailSubject = `${
      isOwner ? "Product delivery reminder" : "Please confirm product receipt"
    } - ${companyName}`;
    headerTitle = isOwner
      ? "Delivery Reminder"
      : "Did you receive your products?";
  } else {
    emailSubject = `${
      isOwner ? "تذكير بموعد تسليم منتج" : "الرجاء تأكيد استلام المنتج"
    } - ${companyName}`;
    headerTitle = isOwner ? "تذكير بموعد التسليم" : "هل استلمت منتجاتك؟";
  }

  // Language-specific body content
  let bodyIntro, closingText, ctaButtonHtml;

  if (userLang === "en") {
    bodyIntro = `<p style="margin: 0 0 20px 0; font-family: sans-serif;">Hello,</p>`;

    if (isOwner) {
      bodyIntro += `<p style="margin: 0 0 20px 0; font-family: sans-serif;">We would like to remind you about the delivery of the following products to the renter today:</p>`;
      closingText = `<p style="margin-top: 25px; margin-bottom: 15px; font-family: sans-serif;">Please ensure the product is delivered on time and coordinate with the renter. You can track the delivery status through your dashboard.</p>
      <p style="margin-top: 15px; margin-bottom: 15px; font-family: sans-serif;"><strong>Important:</strong> Please ensure you obtain the 4-digit "Delivery Code" from the renter upon handover. You must enter this code on the documentation page to confirm the delivery. This is required to receive your earnings after the rental period concludes.</p>
      <p style="margin-top: 15px; margin-bottom: 15px; font-family: sans-serif;">The customer has received an email with a link to the confirmation page. They can also confirm receipt directly from their dashboard under 'My Orders'.</p>`;
      ctaButtonHtml = `
        <div class="cta-button-container" style="text-align: center; margin: 30px 0 15px 0;">
            <a href="${renterConfirmationUrl}" target="_blank" class="cta-button" style="background-color: #F48A42; color: #ffffff !important; padding: 14px 28px; text-decoration: none !important; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 18px; font-family: sans-serif;">
                Confirm Product Receipt
            </a>
        </div>`;
    } else {
      // For Renter
      bodyIntro += `<p style="margin: 0 0 20px 0; font-family: sans-serif;">We hope your rental experience is wonderful! Please confirm receipt of the following products from the owner:</p>`;
      closingText = `<p style="margin-top: 25px; margin-bottom: 15px; font-family: sans-serif;">Upon receiving the product, please provide the 4-digit "Delivery Code" you received via WhatsApp to the owner so they can confirm the delivery. Additionally, if the products are in good condition, please click the button below to confirm receipt and upload photos of the items. This helps complete the rental process smoothly and ensures a safe experience for everyone.</p>`;
      ctaButtonHtml = `
        <div class="cta-button-container" style="text-align: center; margin: 30px 0 15px 0;">
            <a href="${renterConfirmationUrl}" target="_blank" class="cta-button" style="background-color: #F48A42; color: #ffffff !important; padding: 14px 28px; text-decoration: none !important; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 18px; font-family: sans-serif;">
                Confirm Product Delivery
            </a>
        </div>`;
    }
  } else {
    bodyIntro = `<p style="margin: 0 0 20px 0; font-family: sans-serif;">مرحبًا،</p>`;

    if (isOwner) {
      bodyIntro += `<p style="margin: 0 0 20px 0; font-family: sans-serif;">نود تذكيرك بموعد تسليم المنتجات التالية اليوم للمستأجر:</p>`;
      closingText = `<p style="margin-top: 25px; margin-bottom: 15px; font-family: sans-serif;">يرجى التأكد من تسليم المنتج في الوقت المحدد والتنسيق مع المستأجر. يمكنك متابعة حالة التسليم من خلال لوحة التحكم الخاصة بك.</p>
      <p style="margin-top: 15px; margin-bottom: 15px; font-family: sans-serif;"><strong>هام:</strong> يرجى الحرص على استلام "رمز التسليم" المكون من 4 أرقام من المستأجر عند تسليمه المنتج، حيث يتعين عليك إدخاله في صفحة التوثيق لتأكيد عملية التسليم. إتمام هذه الخطوة ضروري لضمان استلام مستحقاتك المالية بعد انتهاء فترة التأجير.</p>
      <p style="margin-top: 15px; margin-bottom: 15px; font-family: sans-serif;">لقد تم إرسال بريد إلكتروني للعميل يحتوي على رابط صفحة التأكيد، كما يمكنه إتمام العملية من خلال لوحة التحكم في قسم "طلباتي".</p>`;
      ctaButtonHtml = `
        <div class="cta-button-container" style="text-align: center; margin: 30px 0 15px 0;">
            <a href="${renterConfirmationUrl}" target="_blank" class="cta-button" style="background-color: #F48A42; color: #ffffff !important; padding: 14px 28px; text-decoration: none !important; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 18px; font-family: sans-serif;">
                تأكيد تسليم المنتج
            </a>
        </div>`;
    } else {
      // For Renter
      bodyIntro += `<p style="margin: 0 0 20px 0; font-family: sans-serif;">نأمل أن تكون تجربة استئجارك رائعة! يرجى تأكيد استلامك للمنتجات التالية من المالك:</p>`;
      closingText = `<p style="margin-top: 25px; margin-bottom: 15px; font-family: sans-serif;">عند استلامك للمنتج، يرجى تزويد المؤجر بـ "رمز التسليم" المكون من 4 أرقام والذي وصلك عبر الواتساب ليتمكن من تأكيد عملية التسليم. كما نرجو منك الضغط على الزر أدناه لتأكيد الاستلام ورفع صور حالة المنتج، مما يضمن إتمام عملية الإيجار بسلاسة وحماية حقوق الجميع.</p>`;
      ctaButtonHtml = `
        <div class="cta-button-container" style="text-align: center; margin: 30px 0 15px 0;">
            <a href="${renterConfirmationUrl}" target="_blank" class="cta-button" style="background-color: #F48A42; color: #ffffff !important; padding: 14px 28px; text-decoration: none !important; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 18px; font-family: sans-serif;">
                تأكيد استلام المنتج
            </a>
        </div>`;
    }
  }

  const itemsHtml = items
    .map(
      (item) => `
    <div style="padding: 12px 15px; margin-bottom: 10px; background-color: #f9f9f9; border-radius: 8px; border: 1px solid #eeeeee; font-family: sans-serif;">
        <p style="margin: 0; font-size: 18px; font-weight: bold; color: #333333; font-family: sans-serif;">${
          item.name ||
          (userLang === "en"
            ? "Product name not available"
            : "اسم المنتج غير متوفر")
        }</p>
        ${
          item.deliveryDate
            ? `<p style="margin: 5px 0 0 0; color: #555555; font-size: 16px; font-family: sans-serif;">${
                userLang === "en"
                  ? "Delivery/Receipt Date:"
                  : "تاريخ التسليم/الاستلام:"
              } ${item.deliveryDate}</p>`
            : ""
        }
    </div>
  `,
    )
    .join("");

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
            
            .cta-button-container {
                text-align: center;
                margin: 30px 0 15px 0;
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
                ? isOwner
                  ? "Important reminder about your product delivery"
                  : "Important step: Confirm receipt of rented product"
                : isOwner
                  ? "تذكير مهم بخصوص تسليم منتجك"
                  : "خطوة مهمة: تأكيد استلام المنتج المستأجر"
            }.
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
                            <td class="email-body" style="background-color: #ffffff; padding: 35px 30px; text-align: right; font-family: sans-serif;">
                                ${bodyIntro}
                                
                                <h3 style="margin-top: 25px; margin-bottom: 15px; font-size: 20px; color: #333333; border-bottom: 2px solid #F48A42; padding-bottom: 8px; font-family: sans-serif;">${
                                  userLang === "en"
                                    ? "Products Involved:"
                                    : "المنتجات المعنية:"
                                }</h3>
                                <div class="items-list-container" style="font-family: sans-serif; margin-bottom: 20px;">
                                    ${itemsHtml}
                                </div>
                                
                                ${closingText}
                                ${ctaButtonHtml}
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
                                        ? `This is a service message related to your bookings. To manage notification preferences, please visit your account settings or <a href="${unsubscribeUrl}" target="_blank" style="color: #F48A42; text-decoration: none; font-weight: bold; font-family: sans-serif;">unsubscribe</a> from some messages.`
                                        : `هذه رسالة خدمية تتعلق بحجوزاتك. لإدارة تفضيلات الإشعارات، يرجى زيارة إعدادات حسابك أو <a href="${unsubscribeUrl}" target="_blank" style="color: #F48A42; text-decoration: none; font-weight: bold; font-family: sans-serif;">إلغاء الاشتراك</a> من بعض الرسائل.`
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

export async function sendReturnReminderEmail({
  email,
  items,
  orderId,
  isOwner,
  userLang = "ar",
}) {
  const unsubscribeUrl =
    process.env.UNSUBSCRIBE_URL || "https://estajer.com/api/auth/unsubscribe";
  const companyName = process.env.COMPANY_NAME || "Estajer | استأجر";
  const companyAddress = process.env.COMPANY_ADDRESS || "123 Main Street";
  const companyCityCountry =
    process.env.COMPANY_CITY_COUNTRY || "Riyadh, Saudi Arabia";
  const logoUrl =
    "https://res.cloudinary.com/dhfzkadm2/image/upload/v1768056757/logoWhite_l0rabo_wc3lbb.webp";

  const ownerDashboardUrl = `${
    process.env.NEXT_PUBLIC_APP_URL || "https://estajer.com"
  }/dashboard/requests?id=${orderId}`;

  const renterDashboardUrl = `${
    process.env.NEXT_PUBLIC_APP_URL || "https://estajer.com"
  }/dashboard/my-orders`;

  // Language-specific email subject and header
  let emailSubject, headerTitle;
  if (userLang === "en") {
    emailSubject = `${
      isOwner ? "Product Return Reminder" : "Product Return Reminder"
    } - ${companyName}`;
    headerTitle = isOwner
      ? "Product Return Reminder"
      : "Product Return Reminder";
  } else {
    emailSubject = `${
      isOwner ? "تذكير باسترجاع المنتج" : "تذكير بإرجاع المنتج"
    } - ${companyName}`;
    headerTitle = isOwner ? "تذكير باسترجاع المنتج" : "تذكير بإرجاع المنتج";
  }

  // Language-specific body content
  let bodyIntro, closingText, ctaButtonHtml;

  if (userLang === "en") {
    bodyIntro = `<p style="margin: 0 0 20px 0; font-family: sans-serif;">Hello,</p>`;

    if (isOwner) {
      bodyIntro += `<p style="margin: 0 0 20px 0; font-family: sans-serif;">We would like to remind you that today marks the scheduled return date for the following products from your rental agreement:</p>`;
      closingText = `<p style="margin-top: 25px; margin-bottom: 15px; font-family: sans-serif;">Please coordinate with the renter to arrange the product return. We recommend inspecting the condition of all items carefully upon receipt to ensure they match the original state documented at the time of delivery.</p>
      <p style="margin-top: 15px; margin-bottom: 15px; font-family: sans-serif;">Should you have any questions or concerns, please don't hesitate to contact our support team.</p>`;
      ctaButtonHtml = `
        <div class="cta-button-container" style="text-align: center; margin: 30px 0 15px 0;">
            <a href="${ownerDashboardUrl}" target="_blank" class="cta-button" style="background-color: #F48A42; color: #ffffff !important; padding: 14px 28px; text-decoration: none !important; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 18px; font-family: sans-serif;">
                Go to Dashboard
            </a>
        </div>`;
    } else {
      // For Renter
      bodyIntro += `<p style="margin: 0 0 20px 0; font-family: sans-serif;">We would like to remind you that today is the scheduled return date for the following products from your rental agreement:</p>`;
      closingText = `<p style="margin-top: 25px; margin-bottom: 15px; font-family: sans-serif;">Please ensure that all products are returned to the owner today in accordance with your rental agreement. Kindly verify that the items are in the same condition as when received.</p>
      <p style="margin-top: 15px; margin-bottom: 15px; font-family: sans-serif;"><strong>Important:</strong> Late returns may result in additional charges as outlined in the rental terms and conditions.</p>`;
      ctaButtonHtml = `
        <div class="cta-button-container" style="text-align: center; margin: 30px 0 15px 0;">
            <a href="${renterDashboardUrl}" target="_blank" class="cta-button" style="background-color: #F48A42; color: #ffffff !important; padding: 14px 28px; text-decoration: none !important; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 18px; font-family: sans-serif;">
                View My Orders
            </a>
        </div>`;
    }
  } else {
    bodyIntro = `<p style="margin: 0 0 20px 0; font-family: sans-serif;">مرحبًا،</p>`;

    if (isOwner) {
      bodyIntro += `<p style="margin: 0 0 20px 0; font-family: sans-serif;">نود تذكيركم بأن اليوم هو الموعد المحدد لاسترجاع المنتجات التالية من عقد الإيجار الخاص بكم:</p>`;
      closingText = `<p style="margin-top: 25px; margin-bottom: 15px; font-family: sans-serif;">يرجى التنسيق مع المستأجر لترتيب موعد استرجاع المنتجات. نوصي بفحص حالة جميع العناصر بعناية عند الاستلام للتأكد من مطابقتها للحالة الأصلية الموثقة وقت التسليم.</p>
      <p style="margin-top: 15px; margin-bottom: 15px; font-family: sans-serif;">في حال وجود أي استفسارات أو مخاوف، يرجى عدم التردد في التواصل مع فريق الدعم الخاص بنا.</p>`;
      ctaButtonHtml = `
        <div class="cta-button-container" style="text-align: center; margin: 30px 0 15px 0;">
            <a href="${ownerDashboardUrl}" target="_blank" class="cta-button" style="background-color: #F48A42; color: #ffffff !important; padding: 14px 28px; text-decoration: none !important; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 18px; font-family: sans-serif;">
                الذهاب إلى لوحة التحكم
            </a>
        </div>`;
    } else {
      // For Renter
      bodyIntro += `<p style="margin: 0 0 20px 0; font-family: sans-serif;">نود تذكيركم بأن اليوم هو الموعد المحدد لإرجاع المنتجات التالية من عقد الإيجار الخاص بكم:</p>`;
      closingText = `<p style="margin-top: 25px; margin-bottom: 15px; font-family: sans-serif;">يرجى التأكد من إرجاع جميع المنتجات إلى المالك اليوم وفقاً لعقد الإيجار الخاص بكم. نرجو التحقق من أن العناصر بنفس الحالة التي تم استلامها بها.</p>
      <p style="margin-top: 15px; margin-bottom: 15px; font-family: sans-serif;"><strong>هام:</strong> قد يترتب على التأخير في الإرجاع رسوم إضافية وفقاً للشروط والأحكام المنصوص عليها في عقد الإيجار.</p>`;
      ctaButtonHtml = `
        <div class="cta-button-container" style="text-align: center; margin: 30px 0 15px 0;">
            <a href="${renterDashboardUrl}" target="_blank" class="cta-button" style="background-color: #F48A42; color: #ffffff !important; padding: 14px 28px; text-decoration: none !important; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 18px; font-family: sans-serif;">
                عرض طلباتي
            </a>
        </div>`;
    }
  }

  const itemsHtml = items
    .map(
      (item) => `
    <div style="padding: 12px 15px; margin-bottom: 10px; background-color: #f9f9f9; border-radius: 8px; border: 1px solid #eeeeee; font-family: sans-serif;">
        <p style="margin: 0; font-size: 18px; font-weight: bold; color: #333333; font-family: sans-serif;">${
          item.name ||
          (userLang === "en"
            ? "Product name not available"
            : "اسم المنتج غير متوفر")
        }</p>
    </div>
  `,
    )
    .join("");

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
            
            .cta-button-container {
                text-align: center;
                margin: 30px 0 15px 0;
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
                ? isOwner
                  ? "Today is the product retrieval day"
                  : "Today is the product return day"
                : isOwner
                  ? "اليوم هو يوم استلام المنتج"
                  : "اليوم هو يوم إرجاع المنتج"
            }.
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
                            <td class="email-body" style="background-color: #ffffff; padding: 35px 30px; text-align: right; font-family: sans-serif;">
                                ${bodyIntro}
                                
                                <h3 style="margin-top: 25px; margin-bottom: 15px; font-size: 20px; color: #333333; border-bottom: 2px solid #F48A42; padding-bottom: 8px; font-family: sans-serif;">${
                                  userLang === "en"
                                    ? "Products Involved:"
                                    : "المنتجات المعنية:"
                                }</h3>
                                <div class="items-list-container" style="font-family: sans-serif; margin-bottom: 20px;">
                                    ${itemsHtml}
                                </div>
                                
                                ${closingText}
                                ${ctaButtonHtml}
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
                                        ? `This is a service message related to your bookings. To manage notification preferences, please visit your account settings or <a href="${unsubscribeUrl}" target="_blank" style="color: #F48A42; text-decoration: none; font-weight: bold; font-family: sans-serif;">unsubscribe</a> from some messages.`
                                        : `هذه رسالة خدمية تتعلق بحجوزاتك. لإدارة تفضيلات الإشعارات، يرجى زيارة إعدادات حسابك أو <a href="${unsubscribeUrl}" target="_blank" style="color: #F48A42; text-decoration: none; font-weight: bold; font-family: sans-serif;">إلغاء الاشتراك</a> من بعض الرسائل.`
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
