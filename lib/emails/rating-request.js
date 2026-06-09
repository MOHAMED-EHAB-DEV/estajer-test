import { transporter } from "../email";
import { getUrlName } from "../sitemap";

export async function sendRatingRequestEmail({
  email,
  customerName,
  items,
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
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://estajer.com";
  const langPrefix = userLang === "ar" ? "" : "en/";

  // Language-specific content
  const emailSubject =
    userLang === "en"
      ? `Rate your rental experience - Order #${orderId} - ${companyName}`
      : `قيّم تجربة الإيجار - طلب رقم ${orderId} - ${companyName}`;

  const headerTitle =
    userLang === "en"
      ? "How was your rental experience?"
      : "كيف كانت تجربة الإيجار؟";

  let bodyIntro =
    userLang === "en"
      ? `<p style="margin: 0 0 18px 0; font-family: sans-serif;">Hello ${
          customerName ? customerName.split(" ")[0] : ""
        },</p>`
      : `<p style="margin: 0 0 18px 0; font-family: sans-serif;">مرحباً ${
          customerName ? customerName.split(" ")[0] : ""
        }،</p>`;

  bodyIntro +=
    userLang === "en"
      ? `<p style="margin: 0 0 18px 0; font-family: sans-serif;">Thank you for choosing Estajer for your rental needs! We hope you had a wonderful experience with the products you rented.</p>
       <p style="margin: 0 0 18px 0; font-family: sans-serif;">Your feedback is incredibly valuable to us and helps other customers make informed decisions. Please take a moment to rate and review the products from your recent order:</p>`
      : `<p style="margin: 0 0 18px 0; font-family: sans-serif;">شكراً لاختيارك استأجر لاحتياجات الإيجار! نأمل أن تكون قد حصلت على تجربة رائعة مع المنتجات التي استأجرتها.</p>
       <p style="margin: 0 0 18px 0; font-family: sans-serif;">ملاحظاتك مهمة جداً بالنسبة لنا وتساعد العملاء الآخرين على اتخاذ قرارات مدروسة. يرجى تخصيص لحظة لتقييم ومراجعة المنتجات من طلبك الأخير:</p>`;

  const itemsHtml = items
    .map((item) => {
      const productUrl = `${baseUrl}/${langPrefix}products/${getUrlName(
        item.name
      )}_ref_${item.productId}#rating`;
      return `
        <div class="product-rating-box" style="background-color: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 16px; border: 1px solid #e9ecef; font-family: sans-serif;">
          <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
            ${
              item.image
                ? `<img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover;">`
                : ""
            }
            <div style="flex: 1;">
              <h4 style="margin: 0 0 5px 0; color: #333333; font-size: 18px; font-weight: bold; font-family: sans-serif;">${
                item.name
              }</h4>
              <p style="margin: 0; color: #666666; font-size: 14px; font-family: sans-serif;">${
                userLang === "en" ? "Rental Period:" : "فترة الإيجار:"
              } ${item.rentalPeriod}</p>
            </div>
          </div>
          <div style="text-align: center;">
            <a href="${productUrl}" target="_blank" class="rating-button" style="background-color: #F48A42; color: #ffffff !important; padding: 12px 24px; text-decoration: none !important; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px; font-family: sans-serif; transition: background-color 0.3s;">
              ${
                userLang === "en"
                  ? "⭐ Rate This Product"
                  : "⭐ قيّم هذا المنتج"
              }
            </a>
          </div>
        </div>
      `;
    })
    .join("");

  const closingMessage =
    userLang === "en"
      ? `<p style="margin: 25px 0 15px 0; font-family: sans-serif;">Your honest reviews help us maintain high quality standards and assist other customers in making the right choices. Thank you for being part of the Estajer community!</p>
       <p style="margin: 0 0 18px 0; font-family: sans-serif;">If you have any questions or need assistance, please don't hesitate to contact our customer support team.</p>`
      : `<p style="margin: 25px 0 15px 0; font-family: sans-serif;">تقييماتك الصادقة تساعدنا في الحفاظ على معايير الجودة العالية ومساعدة العملاء الآخرين في اتخاذ الخيارات الصحيحة. شكراً لكونك جزءاً من مجتمع استأجر!</p>
       <p style="margin: 0 0 18px 0; font-family: sans-serif;">إذا كانت لديك أي أسئلة أو تحتاج إلى مساعدة، يرجى عدم التردد في التواصل مع فريق دعم العملاء.</p>`;

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
                background: #f48a42;
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
                font-size: 28px;
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
            
            .products-heading {
                margin-top: 30px;
                margin-bottom: 20px;
                font-size: 20px;
                color: #333333;
                border-bottom: 2px solid #F48A42;
                padding-bottom: 10px; 
                text-align: center;
            }

            .rating-button:hover {
                background-color: #e67e22 !important;
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
                ? `Please rate your rental experience for order #${orderId} on ${companyName}.`
                : `يرجى تقييم تجربة الإيجار للطلب رقم ${orderId} على ${companyName}.`
            }
        </div>

        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8f6f2; font-family: sans-serif;">
            <tr>
                <td align="center" style="padding: 20px 0;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" class="email-container" style="font-family: sans-serif; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                        <!-- Header -->
                        <tr>
                            <td class="email-header" style="background: #f48a42; padding: 30px 20px; text-align: center; border-top-left-radius: 12px; border-top-right-radius: 12px;">
                                <img src="${logoUrl}" alt="${
      userLang === "en" ? `${companyName} Logo` : `شعار ${companyName}`
    }" width="170" style="max-width: 170px; margin-bottom: 15px;">
                                <h1 style="margin: 0; font-size: 28px; color: #ffffff; font-weight: bold; font-family: sans-serif;">${headerTitle}</h1>
                            </td>
                        </tr>

                        <!-- Body -->
                        <tr>
                            <td class="email-body" style="background-color: #ffffff; padding: 35px 30px; text-align: start; font-family: sans-serif;">
                                ${bodyIntro}
                                
                                <h3 class="products-heading" style="margin-top: 30px; margin-bottom: 20px; font-size: 20px; color: #333333; border-bottom: 2px solid #F48A42; padding-bottom: 10px; text-align: center; font-family: sans-serif;">${
                                  userLang === "en"
                                    ? "🌟 Rate Your Rented Products"
                                    : "🌟 قيّم منتجاتك المستأجرة"
                                }</h3>
                                
                                <div class="products-list-container" style="font-family: sans-serif; margin-bottom: 20px;">
                                    ${itemsHtml}
                                </div>
                                
                                ${closingMessage}
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
                                        ? `This is a service message related to your completed rental. To manage notification preferences, please visit your account settings or <a href="${unsubscribeUrl}" target="_blank" style="color: #F48A42; text-decoration: none; font-weight: bold; font-family: sans-serif;">unsubscribe</a> from some messages.`
                                        : `هذه رسالة خدمية تتعلق بإيجارك المكتمل. لإدارة تفضيلات الإشعارات، يرجى زيارة إعدادات حسابك أو <a href="${unsubscribeUrl}" target="_blank" style="color: #F48A42; text-decoration: none; font-weight: bold; font-family: sans-serif;">إلغاء الاشتراك</a> من بعض الرسائل.`
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
