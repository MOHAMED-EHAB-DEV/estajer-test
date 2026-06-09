import { transporter } from "../email";

export async function sendChatNotificationEmail(
  email,
  senderName,
  messageCount,
  chatLink,
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

  // Language-specific content
  let emailSubject,
    headerTitle,
    messageText,
    greetingText,
    ctaText,
    instructionText,
    footerText;

  if (userLang === "en") {
    emailSubject = `You have new messages from ${senderName} on ${companyName}`;
    headerTitle = `📬 You have new messages!`;
    greetingText = `Hello,`;

    if (messageCount === 1) {
      messageText = `You have a new message from <strong>${senderName}</strong>.`;
    } else {
      messageText = `You have <strong>${messageCount}</strong> new messages from <strong>${senderName}</strong>.`;
    }

    ctaText = `View Messages`;
    instructionText = `Don't miss the opportunity to reply and continue the conversation. You can view the messages by clicking the button below:`;
    footerText = `If you're having trouble clicking the button, you can copy and paste the following link into your browser:`;
  } else {
    emailSubject = `لديك رسائل جديدة من ${senderName} على ${companyName}`;
    headerTitle = `📬 لديك رسائل جديدة!`;
    greetingText = `مرحبًا،`;

    if (messageCount === 1) {
      messageText = `لديك رسالة جديدة من <strong>${senderName}</strong>.`;
    } else {
      messageText = `لديك <strong>${messageCount}</strong> رسائل جديدة من <strong>${senderName}</strong>.`;
    }

    ctaText = `عرض الرسائل`;
    instructionText = `لا تفوت الفرصة للرد ومتابعة المحادثة. يمكنك عرض الرسائل من خلال الضغط على الزر أدناه:`;
    footerText = `إذا كنت تواجه مشكلة في الضغط على الزر، يمكنك نسخ ولصق الرابط التالي في متصفحك:`;
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
                color: #F48A42; /* Highlight sender name and count */
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
                ? `Don't miss out! You have new messages from ${senderName} waiting for you on ${companyName}.`
                : `لا تفوت الفرصة! لديك رسائل جديدة من ${senderName} في انتظارك على ${companyName}.`
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
                                <p style="margin: 0 0 20px 0; font-family: sans-serif;">${greetingText}</p>
                                <p style="margin: 0 0 20px 0; font-family: sans-serif; font-size: 18px; line-height: 1.7;">${messageText}</p>
                                <p style="margin: 0 0 20px 0; font-family: sans-serif;">${instructionText}</p>
                                
                                <div class="cta-button-container" style="text-align: center; margin: 30px 0 15px 0;">
                                    <a href="${chatLink}" target="_blank" class="cta-button" style="background-color: #F48A42; color: #ffffff !important; padding: 14px 28px; text-decoration: none !important; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 18px; font-family: sans-serif;">
                                        ${ctaText}
                                    </a>
                                </div>
                                <p style="margin-top: 25px; margin-bottom: 0; font-family: sans-serif;">${footerText}</p>
                                <p style="margin: 5px 0 0 0; text-align: center; direction: ltr; word-break: break-all; font-family: sans-serif;"><a href="${chatLink}" target="_blank" style="color: #F48A42; text-decoration: underline; font-family: sans-serif;">${chatLink}</a></p>
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
                                        ? `You are receiving this message as a notification of new messages. To manage your notification preferences, please visit your account settings or <a href="${unsubscribeUrl}" target="_blank" style="color: #F48A42; text-decoration: none; font-weight: bold; font-family: sans-serif;">unsubscribe</a> from message notifications.`
                                        : `تستقبل هذه الرسالة كإشعار بوجود رسائل جديدة. لإدارة تفضيلات الإشعارات، يرجى زيارة إعدادات حسابك أو <a href="${unsubscribeUrl}" target="_blank" style="color: #F48A42; text-decoration: none; font-weight: bold; font-family: sans-serif;">إلغاء الاشتراك</a> من إشعارات الرسائل.`
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
