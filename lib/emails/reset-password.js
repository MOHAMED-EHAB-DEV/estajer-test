import { transporter } from "../email";

export async function sendResetPasswordEmail({ email, resetLink, lang }) {
  const unsubscribeUrl =
    process.env.UNSUBSCRIBE_URL || "https://estajer.com/unsubscribe";
  const companyName = process.env.COMPANY_NAME || "Estajer | استأجر";
  const companyAddress = process.env.COMPANY_ADDRESS || "123 Main Street";
  const companyCityCountry =
    process.env.COMPANY_CITY_COUNTRY || "Riyadh, Saudi Arabia";
  const logoUrl =
    "https://res.cloudinary.com/dhfzkadm2/image/upload/v1768056757/logoWhite_l0rabo_wc3lbb.webp";

  await transporter.sendMail({
    from: `"${companyName}" <${process.env.EMAIL_FROM_ADDRESS}>`,
    to: email,
    subject:
      lang === "en"
        ? "Reset Your Password - Estajer | استأجر"
        : "إعادة تعيين كلمة المرور - Estajer | استأجر",
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
            ? `Reset Your Password - ${companyName}`
            : `إعادة تعيين كلمة المرور - ${companyName}`
        }</title>
        <style type="text/css">
            body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
            table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
            img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
            body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f8f6f2; font-family: sans-serif; }

            .email-container {
                font-family: sans-serif; /* Explicitly set */
                font-size: 18px; /* Increased base font size */
                line-height: 1.6; /* Adjusted line height */
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
                max-width: 170px; /* Slightly larger logo if desired */
                margin-bottom: 15px;
            }
            .email-header h1 {
                margin: 0;
                font-size: 30px; /* Increased heading size */
                color: #ffffff;
                font-weight: bold;
            }

            .email-body {
                background-color: #ffffff;
                padding: 35px 30px; /* Slightly more padding */
                text-align: start;
            }
            .email-body p {
                margin: 0 0 18px 0; /* Increased margin */
            }

            .cta-button-container {
                text-align: center;
                margin: 35px 0; /* Increased margin */
            }
            .cta-button {
                background-color: #F48A42;
                color: #ffffff !important; /* Important to override client styles */
                padding: 14px 28px; /* Increased padding */
                text-decoration: none !important; /* Important to override client styles */
                border-radius: 8px; /* Consistent rounded corners */
                display: inline-block;
                font-weight: bold;
                font-size: 18px; /* Consistent with body or slightly larger */
            }

            .email-footer {
                background-color: #f0f0f0;
                padding: 30px;
                text-align: center;
                font-size: 14px; /* Increased footer font size */
                color: #777777;
                border-bottom-left-radius: 12px;
                border-bottom-right-radius: 12px;
            }
            .email-footer p {
                margin: 0 0 10px 0; /* Increased margin */
            }
            .email-footer a {
                color: #F48A42;
                text-decoration: none;
                font-weight: bold;
            }
            .unsubscribe-link {
              display: block;
              margin-top:12px; /* Increased margin */
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
                ? `Password reset request for your account at ${companyName}.`
                : `طلب إعادة تعيين كلمة المرور لحسابك في ${companyName}.`
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
                                  lang === "en"
                                    ? `${companyName} Logo`
                                    : `شعار ${companyName}`
                                }" width="170" style="max-width: 170px; margin-bottom: 15px;">
                                <h1 style="margin: 0; font-size: 30px; color: #ffffff; font-weight: bold; font-family: sans-serif;">${
                                  lang === "en"
                                    ? "Reset Your Password"
                                    : "إعادة تعيين كلمة المرور"
                                }</h1>
                            </td>
                        </tr>

                        <!-- Body -->
                        <tr>
                            <td class="email-body" style="background-color: #ffffff; padding: 35px 30px; text-align: start; font-family: sans-serif;">
                                <p style="margin: 0 0 18px 0; font-family: sans-serif;">${
                                  lang === "en" ? "Hello," : "مرحباً،"
                                }</p>
                                <p style="margin: 0 0 18px 0; font-family: sans-serif;">${
                                  lang === "en"
                                    ? `We received a request to reset the password for your account at ${companyName}. If you did not make this request, you can safely ignore this email.`
                                    : `لقد تلقينا طلبًا لإعادة تعيين كلمة المرور الخاصة بحسابك في ${companyName}. إذا لم تقم بهذا الطلب، يمكنك تجاهل هذا البريد الإلكتروني بأمان.`
                                }</p>
                                <p style="margin: 0 0 18px 0; font-family: sans-serif;">${
                                  lang === "en"
                                    ? "To reset your password, please click the button below:"
                                    : "لإعادة تعيين كلمة المرور، يرجى النقر على الزر أدناه:"
                                }</p>
                                
                                <div class="cta-button-container" style="text-align: center; margin: 35px 0;">
                                    <a href="${resetLink}" target="_blank" class="cta-button" style="background-color: #F48A42; color: #ffffff !important; padding: 14px 28px; text-decoration: none !important; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 18px; font-family: sans-serif;">
                                        ${
                                          lang === "en"
                                            ? "Reset Password"
                                            : "إعادة تعيين كلمة المرور"
                                        }
                                    </a>
                                </div>
                                
                                <p style="margin: 0 0 18px 0; font-family: sans-serif;">${
                                  lang === "en"
                                    ? "This link is valid for one hour only."
                                    : "هذا الرابط صالح لمدة ساعة واحدة فقط."
                                }</p>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td class="email-footer" style="background-color: #f0f0f0; padding: 30px; text-align: center; font-size: 14px; color: #777777; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px; font-family: sans-serif;">
                                <p style="margin: 0 0 10px 0; font-family: sans-serif;">${
                                  lang === "en"
                                    ? `All rights reserved © ${new Date().getFullYear()} ${companyName}.`
                                    : `جميع الحقوق محفوظة © ${new Date().getFullYear()} ${companyName}.`
                                }</p>
                                <p style="margin: 0 0 10px 0; font-family: sans-serif;">${companyAddress} | ${companyCityCountry}</p>
                                <p class="unsubscribe-link" style="display: block; margin-top:12px; font-family: sans-serif;">
                                  ${
                                    lang === "en"
                                      ? "If you did not make this request, you can ignore it."
                                      : "اذا لم تقم بهذا الطلب، يمكنك تجاهله."
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
