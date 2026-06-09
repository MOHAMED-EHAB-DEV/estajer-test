import { transporter } from "../email";
export async function sendVerificationEmail({ email, code, lang = "ar" }) {
  const unsubscribeUrl =
    process.env.UNSUBSCRIBE_URL || "https://estajer.com/unsubscribe";
  const companyAddress = process.env.COMPANY_ADDRESS || "123 Main Street";
  const companyCityCountry =
    process.env.COMPANY_CITY_COUNTRY || "Riyadh, Saudi Arabia";
  const logoUrl =
    "https://res.cloudinary.com/dhfzkadm2/image/upload/v1768056757/logoWhite_l0rabo_wc3lbb.webp";

  await transporter.sendMail({
    from: `"${process.env.EMAIL_FROM_NAME || "Estajer | استأجر"}" <${
      process.env.EMAIL_FROM_ADDRESS
    }>`,
    to: email,
    subject:
      lang === "en"
        ? "Your Verification Code - Estajer | استأجر"
        : "رمز التحقق الخاص بك - Estajer | استأجر",
    headers: {
      "List-Unsubscribe": `<${unsubscribeUrl}>, <mailto:${process.env.EMAIL_FROM_ADDRESS}?subject=unsubscribe>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
    html: `
    <!DOCTYPE html>
    <html dir="${lang === "en" ? "ltr" : "rtl"}" lang="${lang}">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>${
          lang === "en"
            ? "Your Verification Code - Estajer"
            : "رمز التحقق الخاص بك - Estaajer"
        }</title>
        <style type="text/css">
            body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
            table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
            img {border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
            body {font-family: sans-serif; height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f8f6f2; }

            .email-container {
                font-family: sans-serif;
                font-size: 18px;
                line-height: 1.5;
                color: #333333;
                max-width: 600px;
                margin: 0 auto;
                direction: ${lang === "en" ? "ltr" : "rtl"};
            }

            .email-header {
                background-color: #F48A42;
                padding: 30px 20px;
                text-align: center;
                border-top-left-radius: 12px;
                border-top-right-radius: 12px;
            }
            .email-header img {
                max-width: 160px;
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
                padding: 30px 25px;
                text-align: start;
            }
            .email-body p {
                margin: 0 0 15px 0;
            }

            .verification-code-container {
                margin: 25px 0;
                padding: 20px;
                background-color: #fff7f0;
                border: 1px dashed #F48A42;
                border-radius: 8px;
                text-align: center;
            }
            .verification-code-label {
                font-size: 18px;
                color: #555555;
                margin-bottom: 10px;
            }
            .verification-code {
                font-size: 36px;
                font-weight: bold;
                color: #F48A42;
                letter-spacing: 4px;
                margin: 0;
            }

            .email-footer {
                background-color: #f0f0f0;
                padding: 25px;
                text-align: center;
                font-size: 14px;
                color: #777777;
                border-bottom-left-radius: 12px;
                border-bottom-right-radius: 12px;
            }
            .email-footer p {
                margin: 0 0 8px 0;
            }
            .email-footer a {
                color: #F48A42;
                text-decoration: none;
                font-weight: bold;
            }
            .unsubscribe-link {
              display: block;
              margin-top:10px;
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
    <body dir="${lang === "en" ? "ltr" : "rtl"}">
        <div class="hidden-preheader">
            ${
              lang === "en"
                ? "This is your verification code to activate your account on Estajer."
                : "هذا هو رمز التحقق الخاص بك لتفعيل حسابك في استأجر."
            }
        </div>

        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8f6f2;">
            <tr>
                <td align="center" style="padding: 20px 0;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" class="email-container" style="box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                        <tr>
                            <td class="email-header">
                                <img src="${logoUrl}" alt="${
                                  lang === "en" ? "Estajer Logo" : "شعار استأجر"
                                }" width="160" style="max-width: 160px;">
                                <h1 style="margin: 0; font-size: 28px; color: #ffffff; font-weight: bold;">${
                                  lang === "en"
                                    ? "Verification Code"
                                    : "رمز التحقق"
                                }</h1>
                            </td>
                        </tr>
                        <tr>
                            <td class="email-body" style="background-color: #ffffff; padding: 30px 25px; text-align: start;">
                                <p style="margin: 0 0 15px 0;">${
                                  lang === "en" ? "Hello," : "مرحبًا،"
                                }</p>
                                <p style="margin: 0 0 15px 0;">${
                                  lang === "en"
                                    ? "Thank you for using Estajer platform. Please use the following verification code to confirm your email address:"
                                    : "شكرًا لاستخدامك منصة استأجر. يرجى استخدام رمز التحقق التالي لتأكيد بريدك الإلكتروني:"
                                }</p>
                                
                                <div class="verification-code-container" style="margin: 25px 0; padding: 20px; background-color: #fff7f0; border: 1px dashed #F48A42; border-radius: 8px; text-align: center;">
                                    <p class="verification-code-label" style="font-size: 14px; color: #555555; margin: 0 0 8px 0;">${
                                      lang === "en"
                                        ? "Your verification code is:"
                                        : "رمز التحقق الخاص بك هو:"
                                    }</p>
                                    <p class="verification-code" style="font-size: 36px; font-weight: bold; color: #F48A42; letter-spacing: 4px; margin: 0;">${code}</p>
                                </div>
                                
                                <p style="margin: 0 0 15px 0;">${
                                  lang === "en"
                                    ? "This code is valid for 10 minutes."
                                    : "هذا الرمز صالح لمدة 10 دقائق."
                                }</p>
                                <p style="margin: 0 0 15px 0;">${
                                  lang === "en"
                                    ? "If you did not request this verification, please ignore this email. Someone else may have entered your email address by mistake."
                                    : "إذا لم تطلب هذا التحقق، يرجى تجاهل هذا البريد الإلكتروني. قد يكون شخص آخر أدخل بريدك الإلكتروني عن طريق الخطأ."
                                }</p>
                            </td>
                        </tr>
                        <tr>
                            <td class="email-footer" style="background-color: #f0f0f0; padding: 25px; text-align: center; font-size: 14px; color: #777777; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px;">
                                <p style="margin: 0 0 8px 0;">${
                                  lang === "en"
                                    ? `All rights reserved © ${new Date().getFullYear()} Estajer.`
                                    : `جميع الحقوق محفوظة © ${new Date().getFullYear()} استأجر.`
                                }</p>
                                <p style="margin: 0 0 8px 0;">${companyAddress} | ${companyCityCountry}</p>
                                <p class="unsubscribe-link" style="display: block; margin-top:10px;">
                                    ${
                                      lang === "en"
                                        ? `If you don't want to receive these messages, you can <a href="${unsubscribeUrl}" style="color: #F48A42; text-decoration: none; font-weight: bold;">unsubscribe</a>.`
                                        : `إذا كنت لا ترغب في تلقي هذه الرسائل، يمكنك <a href="${unsubscribeUrl}" style="color: #F48A42; text-decoration: none; font-weight: bold;">إلغاء الاشتراك</a>.`
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
