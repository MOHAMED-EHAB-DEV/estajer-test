import { transporter } from "../email";

export async function sendAiAssistFeatureEmail({
  email,
  name = "",
  lang = "ar",
}) {
  const companyName = process.env.COMPANY_NAME || "Estajer | استأجر";
  const companyAddress = process.env.COMPANY_ADDRESS || "123 Main Street";
  const companyCityCountry =
    process.env.COMPANY_CITY_COUNTRY || "Riyadh, Saudi Arabia";
  const logoUrl =
    "https://res.cloudinary.com/dhfzkadm2/image/upload/v1768056757/logoWhite_l0rabo_wc3lbb.webp";
  const addProductUrl = `https://estajer.com/${lang === "en" ? "en/" : ""}add-product`;

  const isEn = lang === "en";

  // Keep subject plain — no symbols, no "announcing", sounds transactional
  const emailSubject = isEn
    ? `New feature on Estajer: AI-powered product listing`
    : `ميزة جديدة في استأجر: إضافة المنتجات بالذكاء الاصطناعي`;

  const headerTitle = isEn
    ? "List Instantly with AI"
    : "أضف منتجاتك فوراً بالذكاء الاصطناعي";

  await transporter.sendMail({
    from: `"${process.env.EMAIL_FROM_NAME || companyName}" <${
      process.env.EMAIL_FROM_ADDRESS
    }>`,
    to: email,
    subject: emailSubject,
    // No List-Unsubscribe headers — these are the #1 trigger for the Promotions tab
    html: `
    <!DOCTYPE html>
    <html dir="${isEn ? "ltr" : "rtl"}" lang="${lang}">
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
                font-size: 16px;
                line-height: 1.6;
                color: #333333;
                max-width: 600px;
                margin: 0 auto;
                direction: ${isEn ? "ltr" : "rtl"};
            }

            .email-header {
                background: #F48A42;
                padding: 40px 20px;
                text-align: center;
                border-top-left-radius: 12px;
                border-top-right-radius: 12px;
            }
            .email-header img {
                max-width: 170px;
                margin-bottom: 20px;
            }
            .email-header h1 {
                margin: 0;
                font-size: 26px;
                color: #ffffff;
                font-weight: bold;
            }

            .email-body {
                background-color: #ffffff;
                padding: 40px 30px;
                text-align: start;
            }
            .email-body p {
                margin: 0 0 18px 0;
            }
            
            .feature-card {
                background-color: #fffaf6;
                border: 1px solid #ffe6d3;
                border-radius: 12px;
                padding: 20px;
                margin: 25px 0;
            }

            /* Plain link styled minimally — avoid big gradient buttons */
            .cta-link {
                color: #F48A42;
                font-weight: bold;
                text-decoration: underline;
                font-size: 16px;
            }

            .email-footer {
                background-color: #f0f0f0;
                padding: 30px;
                text-align: center;
                font-size: 13px;
                color: #777777;
                border-bottom-left-radius: 12px;
                border-bottom-right-radius: 12px;
            }
            .email-footer p {
                margin: 0 0 8px 0;
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
    <body dir="${isEn ? "ltr" : "rtl"}">
        <div class="hidden-preheader">
            ${
              isEn
                ? "Upload your product photos and let Estajer AI fill in all the listing details for you."
                : "ارفع صور منتجك ودع ذكاء استأجر يكمل تفاصيل إعلانك في ثوانٍ."
            }
        </div>

        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8f6f2;">
            <tr>
                <td align="center" style="padding: 20px 0;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" class="email-container" style="box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                        <!-- Header -->
                        <tr>
                            <td class="email-header">
                                <img src="${logoUrl}" alt="${companyName}" width="170">
                                <h1>${headerTitle}</h1>
                            </td>
                        </tr>

                        <!-- Body -->
                        <tr>
                            <td class="email-body">
                                <p style="font-size: 17px; font-weight: bold; margin-bottom: 20px;">
                                    ${isEn ? `Hello ${name},` : `مرحباً ${name}،`}
                                </p>
                                <p>
                                    ${
                                      isEn
                                        ? "We have just launched a new <strong>AI Assist</strong> feature on Estajer. You can now list products for rent without typing descriptions or setting specifications manually."
                                        : "أطلقنا للتو ميزة <strong>المساعد الذكي (AI Assist)</strong> في استأجر. يمكنك الآن إضافة منتجاتك للتأجير دون الحاجة لكتابة الأوصاف أو تعبئة المواصفات يدوياً."
                                    }
                                </p>
                                
                                <div class="feature-card">
                                    <h4 style="margin: 0 0 20px 0; color: #F48A42; font-size: 15px; font-weight: bold;">
                                        ${isEn ? "How it works:" : "كيف تعمل:"}
                                    </h4>
                                    
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                        <!-- Item 1 -->
                                        <tr>
                                            <td valign="top" style="padding-bottom: 20px; width: 48px; text-align: ${isEn ? "left" : "right"};">
                                                <div style="width: 36px; height: 36px; background-color: #fff0e5; border-radius: 8px; padding: 8px; box-sizing: border-box;">
                                                    <img src="https://img.icons8.com/ios-filled/50/F48A42/camera.png" width="20" height="20" alt="camera" style="display: block; margin: 0 auto;">
                                                </div>
                                            </td>
                                            <td valign="top" style="padding-bottom: 20px; padding-${isEn ? "left" : "right"}: 12px; text-align: start;">
                                                <div style="font-size: 15px; color: #333333; line-height: 1.5; padding-top: 6px;">
                                                    <strong style="color: #1a1a2e;">${isEn ? "1. Upload Images:" : "1. ارفع صور منتجك:"}</strong>
                                                    ${
                                                      isEn
                                                        ? " Drag, drop, or paste your product pictures."
                                                        : " اسحب وأسقط أو الصق صور منتجك."
                                                    }
                                                </div>
                                            </td>
                                        </tr>
                                        <!-- Item 2 -->
                                        <tr>
                                            <td valign="top" style="padding-bottom: 20px; width: 48px; text-align: ${isEn ? "left" : "right"};">
                                                <div style="width: 36px; height: 36px; background-color: #fff0e5; border-radius: 8px; padding: 8px; box-sizing: border-box;">
                                                    <img src="https://img.icons8.com/ios-filled/50/F48A42/sparkles.png" width="20" height="20" alt="sparkles" style="display: block; margin: 0 auto;">
                                                </div>
                                            </td>
                                            <td valign="top" style="padding-bottom: 20px; padding-${isEn ? "left" : "right"}: 12px; text-align: start;">
                                                <div style="font-size: 15px; color: #333333; line-height: 1.5; padding-top: 6px;">
                                                    <strong style="color: #1a1a2e;">${isEn ? "2. AI Auto-Fill:" : "2. التحليل الفوري:"}</strong>
                                                    ${
                                                      isEn
                                                        ? " The AI analyzes your photos and fills in the name, description, category, and specifications."
                                                        : " يحلل الذكاء الاصطناعي الصور ويملأ الاسم والوصف والفئة والمواصفات تلقائياً."
                                                    }
                                                </div>
                                            </td>
                                        </tr>
                                        <!-- Item 3 -->
                                        <tr>
                                            <td valign="top" style="padding-bottom: 20px; width: 48px; text-align: ${isEn ? "left" : "right"};">
                                                <div style="width: 36px; height: 36px; background-color: #fff0e5; border-radius: 8px; padding: 8px; box-sizing: border-box;">
                                                    <img src="https://img.icons8.com/ios-filled/50/F48A42/coins.png" width="20" height="20" alt="coins" style="display: block; margin: 0 auto;">
                                                </div>
                                            </td>
                                            <td valign="top" style="padding-bottom: 20px; padding-${isEn ? "left" : "right"}: 12px; text-align: start;">
                                                <div style="font-size: 15px; color: #333333; line-height: 1.5; padding-top: 6px;">
                                                    <strong style="color: #1a1a2e;">${isEn ? "3. Smart Pricing:" : "3. اقتراح الأسعار:"}</strong>
                                                    ${
                                                      isEn
                                                        ? " Get recommendations for daily rental price, deposit, discounts, and delivery."
                                                        : " يقترح أسعار الإيجار اليومي والتأمين والخصومات والتوصيل."
                                                    }
                                                </div>
                                            </td>
                                        </tr>
                                        <!-- Item 4 -->
                                        <tr>
                                            <td valign="top" style="width: 48px; text-align: ${isEn ? "left" : "right"};">
                                                <div style="width: 36px; height: 36px; background-color: #fff0e5; border-radius: 8px; padding: 8px; box-sizing: border-box;">
                                                    <img src="https://img.icons8.com/ios-filled/50/F48A42/chat.png" width="20" height="20" alt="chat" style="display: block; margin: 0 auto;">
                                                </div>
                                            </td>
                                            <td valign="top" style="padding-${isEn ? "left" : "right"}: 12px; text-align: start;">
                                                <div style="font-size: 15px; color: #333333; line-height: 1.5; padding-top: 6px;">
                                                    <strong style="color: #1a1a2e;">${isEn ? "4. Chat to Refine:" : "4. تعديل بالمحادثة:"}</strong>
                                                    ${
                                                      isEn
                                                        ? " Talk to the AI to adjust any detail — category, price, description — instantly."
                                                        : " تحدث مع المساعد لتغيير أي تفصيل — الفئة، السعر، الوصف — فوراً."
                                                    }
                                                </div>
                                            </td>
                                        </tr>
                                    </table>
                                </div>

                                <p>
                                    ${
                                      isEn
                                        ? `You can try it now when adding a new product: <a href="${addProductUrl}" target="_blank" style="color: #F48A42 !important; text-decoration: underline !important; font-weight: bold; font-size: 16px;">Add a product on Estajer</a>`
                                        : `يمكنك تجربتها الآن عند إضافة منتج جديد: <a href="${addProductUrl}" target="_blank" style="color: #F48A42 !important; text-decoration: underline !important; font-weight: bold; font-size: 16px;">أضف منتجاً في استأجر</a>`
                                    }
                                </p>

                                <p style="margin-top: 30px; color: #555;">
                                    ${
                                      isEn
                                        ? "Thank you for being part of Estajer."
                                        : "شكراً لك على كونك جزءاً من استأجر."
                                    }
                                </p>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td class="email-footer">
                                <p>${
                                  isEn
                                    ? `© ${new Date().getFullYear()} ${companyName}. All rights reserved.`
                                    : `© ${new Date().getFullYear()} ${companyName}. جميع الحقوق محفوظة.`
                                }</p>
                                <p>${companyAddress} | ${companyCityCountry}</p>
                                <p style="margin-top: 10px; color: #999; font-size: 12px;">
                                    ${
                                      isEn
                                        ? "You are receiving this message because you have an account on Estajer."
                                        : "تصلك هذه الرسالة لأن لديك حساباً في استأجر."
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
