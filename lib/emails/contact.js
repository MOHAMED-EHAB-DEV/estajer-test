import { transporter } from "../email";

export async function sendContactReplyEmail({
  email,
  name,
  subject,
  originalMessage,
  replyMessage,
  attachments,
  lang = "ar", // Default to Arabic
}) {
  const unsubscribeUrl =
    process.env.UNSUBSCRIBE_URL || "https://estajer.com/unsubscribe";
  const companyName = process.env.COMPANY_NAME || "Estajer | استأجر";
  const companyAddress = process.env.COMPANY_ADDRESS || "123 Main Street";
  const companyCityCountry =
    process.env.COMPANY_CITY_COUNTRY || "Riyadh, Saudi Arabia";
  const logoUrl =
    "https://res.cloudinary.com/dhfzkadm2/image/upload/v1768056757/logoWhite_l0rabo_wc3lbb.webp";
  const supportEmail =
    process.env.SUPPORT_EMAIL ||
    process.env.EMAIL_FROM_ADDRESS ||
    "support@estajer.com"; // Fallback support email

  // Language-specific content
  const isArabic = lang === "ar";
  const emailSubject = isArabic
    ? `رد على استفسارك: ${subject} - ${companyName}`
    : `Reply to your inquiry: ${subject} - ${companyName}`;
  const headerTitle = isArabic ? `رد على استفسارك` : `Reply to Your Inquiry`;

  const content = {
    ar: {
      greeting: `مرحباً ${name || "عميلنا العزيز"}،`,
      thankYou: `شكرًا لتواصلك معنا بخصوص استفسارك: "<strong>${subject}</strong>". نحن نقدر اهتمامك ويسعدنا الرد عليك.`,
      originalInquiry: "استفسارك الأصلي:",
      ourReply: "ردنا:",
      attachmentsTitle: "المرفقات:",
      furtherQuestions: `إذا كان لديك أي أسئلة أخرى أو كنت بحاجة إلى مزيد من التوضيح، فلا تتردد في الرد على هذا البريد الإلكتروني أو التواصل معنا عبر <a href="mailto:${supportEmail}" style="color: #F48A42; text-decoration: underline; font-family: sans-serif;">${supportEmail}</a>.`,
      regards: `مع أطيب التحيات،<br>فريق دعم ${companyName}`,
      serviceMessage:
        "هذه رسالة خدمية ردًا على استفسارك. لا يتم إرسال رسائل تسويقية إلى هذا العنوان دون موافقتك.",
      preheader: `لقد تلقيت ردًا على استفسارك "${subject}" من فريق ${companyName}.`,
    },
    en: {
      greeting: `Hello ${name || "Dear Customer"},`,
      thankYou: `Thank you for contacting us regarding your inquiry: "<strong>${subject}</strong>". We appreciate your interest and are pleased to respond to you.`,
      originalInquiry: "Your Original Inquiry:",
      ourReply: "Our Reply:",
      attachmentsTitle: "Attachments:",
      furtherQuestions: `If you have any other questions or need further clarification, please don't hesitate to reply to this email or contact us at <a href="mailto:${supportEmail}" style="color: #F48A42; text-decoration: underline; font-family: sans-serif;">${supportEmail}</a>.`,
      regards: `Best regards,<br>${companyName} Support Team`,
      serviceMessage:
        "This is a service message in response to your inquiry. No marketing emails are sent to this address without your consent.",
      preheader: `You have received a reply to your inquiry "${subject}" from the ${companyName} team.`,
    },
  };

  const t = content[lang] || content.ar;

  // Function to format messages for display (e.g., replace newlines with <br>)
  const formatMessageForHtml = (message) => {
    return message?.replace(/\n/g, "<br>");
  };

  // Prepare email attachments for nodemailer
  const emailAttachments =
    attachments?.map((att, index) => ({
      filename: `attachment-${index + 1}.webp`,
      path: att,
    })) || [];

  await transporter.sendMail({
    from: `"${companyName}" <${process.env.EMAIL_FROM_ADDRESS}>`,
    to: email,
    subject: emailSubject,
    attachments: emailAttachments,
    headers: {
      "List-Unsubscribe": `<${unsubscribeUrl}>, <mailto:${process.env.EMAIL_FROM_ADDRESS}?subject=unsubscribe>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
    html: `
    <!DOCTYPE html>
    <html dir="${isArabic ? "rtl" : "ltr"}" lang="${lang}">
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
                direction: ${isArabic ? "rtl" : "ltr"};
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
            
            .message-block {
                margin: 15px 0 25px 0;
                padding: 18px 20px;
                background-color: #f9f9f9;
                ${
                  isArabic
                    ? "border-right: 4px solid #F48A42; border-radius: 0 8px 8px 0;"
                    : "border-left: 4px solid #F48A42; border-radius: 8px 0 0 8px;"
                }
            }
            .message-block p {
                margin: 0;
                color: #555555;
                font-size: 16px;
                line-height: 1.7;
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
    <body dir="${isArabic ? "rtl" : "ltr"}">
        <div class="hidden-preheader">
            ${t.preheader}
        </div>

        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8f6f2; font-family: sans-serif;">
            <tr>
                <td align="center" style="padding: 20px 0;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" class="email-container" style="font-family: sans-serif; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                        <!-- Header -->
                        <tr>
                            <td class="email-header" style="background-color: #F48A42; padding: 30px 20px; text-align: center; border-top-left-radius: 12px; border-top-right-radius: 12px;">
                                <img src="${logoUrl}" alt="شعار ${companyName}" width="170" style="max-width: 170px; margin-bottom: 15px;">
                                <h1 style="margin: 0; font-size: 30px; color: #ffffff; font-weight: bold; font-family: sans-serif;">${headerTitle}</h1>
                            </td>
                        </tr>

                        <!-- Body -->
                        <tr>
                            <td class="email-body" style="background-color: #ffffff; padding: 35px 30px; text-align: start; font-family: sans-serif;">
                                <p style="margin: 0 0 20px 0; font-family: sans-serif;">${
                                  t.greeting
                                }</p>
                                <p style="margin: 0 0 20px 0; font-family: sans-serif;">${
                                  t.thankYou
                                }</p>
                                
                                <h3 style="margin-top: 25px; margin-bottom: 10px; font-size: 20px; color: #333333; font-family: sans-serif;">${
                                  t.originalInquiry
                                }</h3>
                                <div class="message-block" style="margin: 15px 0 25px 0; padding: 18px 20px; background-color: #f9f9f9; ${
                                  isArabic
                                    ? "border-right: 4px solid #F48A42; border-radius: 0 8px 8px 0;"
                                    : "border-left: 4px solid #F48A42; border-radius: 8px 0 0 8px;"
                                } font-family: sans-serif;">
                                    <p style="margin: 0; color: #555555; font-size: 16px; line-height: 1.7; font-family: sans-serif;">${formatMessageForHtml(
                                      originalMessage,
                                    )}</p>
                                </div>

                                <h3 style="margin-top: 25px; margin-bottom: 10px; font-size: 20px; color: #333333; font-family: sans-serif;">${
                                  t.ourReply
                                }</h3>
                                <div class="message-block" style="margin: 15px 0 25px 0; padding: 18px 20px; background-color: #f9f9f9; ${
                                  isArabic
                                    ? "border-right: 4px solid #F48A42; border-radius: 0 8px 8px 0;"
                                    : "border-left: 4px solid #F48A42; border-radius: 8px 0 0 8px;"
                                } font-family: sans-serif;">
                                    <p style="margin: 0; color: #555555; font-size: 16px; line-height: 1.7; font-family: sans-serif;">${formatMessageForHtml(
                                      replyMessage,
                                    )}</p>
                                </div>

                                ${
                                  attachments && attachments.length > 0
                                    ? `
                                <h3 style="margin-top: 25px; margin-bottom: 10px; font-size: 20px; color: #333333; font-family: sans-serif;">${
                                  t.attachmentsTitle
                                }</h3>
                                <div class="message-block" style="margin: 15px 0 25px 0; padding: 18px 20px; background-color: #f9f9f9; ${
                                  isArabic
                                    ? "border-right: 4px solid #F48A42; border-radius: 0 8px 8px 0;"
                                    : "border-left: 4px solid #F48A42; border-radius: 8px 0 0 8px;"
                                } font-family: sans-serif;">
                                    <div style="text-align: center;">
                                        ${attachments
                                          .map(
                                            (img) => `
                                        <a href="${img}" target="_blank" style="text-decoration: none; cursor: pointer; display: inline-block; margin: 5px;">
                                            <img src="${img}" alt="Attachment" style="max-width: 100%; height: auto; max-height: 200px; border-radius: 8px; border: 1px solid #ddd;" />
                                        </a>
                                        `,
                                          )
                                          .join("")}
                                    </div>
                                </div>
                                `
                                    : ""
                                }
                                
                                <p style="margin: 25px 0 10px 0; font-family: sans-serif;">${
                                  t.furtherQuestions
                                }</p>
                                <p style="margin: 0; font-family: sans-serif;">${
                                  t.regards
                                }</p>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td class="email-footer" style="background-color: #f0f0f0; padding: 30px; text-align: center; font-size: 14px; color: #777777; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px; font-family: sans-serif;">
                                <p style="margin: 0 0 10px 0; font-family: sans-serif;">${companyName}</p>
                                <p style="margin: 0 0 10px 0; font-family: sans-serif;">${companyAddress} | ${companyCityCountry}</p>
                                <p style="display: block; margin-top:12px; font-family: sans-serif;">
                                   ${t.serviceMessage}
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
