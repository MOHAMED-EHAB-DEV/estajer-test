import { transporter } from "../email";

export async function sendTicketReplyEmail({
  email,
  name,
  ticketId,
  visitorId,
  subject,
  message,
  attachments,
  lang = "ar",
  isUser = false,
}) {
  const companyName = process.env.COMPANY_NAME || "Estajer | استأجر";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://estajer.com";
  
  // Construct ticket link
  const ticketLink = isUser 
    ? `${appUrl}/${lang}/dashboard/tickets/${ticketId}`
    : `${appUrl}/${lang}/ticket/${ticketId}${visitorId ? `?vid=${visitorId}` : ""}`;

  const isArabic = lang === "ar";
  const emailSubject = isArabic
    ? `رد جديد على تذكرتك: ${subject} - ${companyName}`
    : `New reply to your ticket: ${subject} - ${companyName}`;

  const content = {
    ar: {
      greeting: `مرحباً ${name || "عميلنا العزيز"}،`,
      intro: `لقد تلقيت ردًا جديدًا من فريق الدعم بخصوص تذكرتك: "<strong>${subject}</strong>".`,
      messageTitle: "الرسالة:",
      attachmentsTitle: "المرفقات:",
      cta: "عرض التذكرة ومتابعة المحادثة",
      footerInfo: `هذا البريد مرسل تلقائياً من نظام التذاكر في ${companyName}. يرجى عدم الرد عليه مباشرة.`,
    },
    en: {
      greeting: `Hello ${name || "Dear Customer"},`,
      intro: `You have received a new reply from our support team regarding your ticket: "<strong>${subject}</strong>".`,
      messageTitle: "Message:",
      attachmentsTitle: "Attachments:",
      cta: "View Ticket & Continue Conversation",
      footerInfo: `This is an automated message from the ${companyName} ticketing system. Please do not reply directly to this email.`,
    }
  };

  const t = content[lang] === undefined ? content.ar : content[lang];

  const formatMessageForHtml = (msg) => msg?.replace(/\n/g, "<br>");

  const emailAttachments = attachments?.map((att, index) => ({
    filename: `attachment-${index + 1}.webp`,
    path: att,
  })) || [];

  await transporter.sendMail({
    from: `"${companyName}" <${process.env.EMAIL_FROM_ADDRESS}>`,
    to: email,
    subject: emailSubject,
    attachments: emailAttachments,
    html: `
    <!DOCTYPE html>
    <html dir="${isArabic ? "rtl" : "ltr"}" lang="${lang}">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${emailSubject}</title>
        <style>
            body { font-family: sans-serif; background-color: #f8f6f2; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
            .header { background-color: #F48A42; padding: 30px; text-align: center; color: #ffffff; }
            .header img { max-width: 150px; margin-bottom: 10px; }
            .body { padding: 35px 30px; line-height: 1.6; color: #333333; text-align: ${isArabic ? "right" : "left"}; }
            .message-box { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 15px 0; border-${isArabic ? "right" : "left"}: 4px solid #F48A42; }
            .attachment-img { max-width: 100%; border-radius: 8px; margin: 10px 0; border: 1px solid #eee; }
            .btn-container { text-align: center; margin: 30px 0; }
            .btn { background-color: #F48A42; color: #ffffff !important; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; }
            .footer { background: #f0f0f0; padding: 25px; text-align: center; font-size: 13px; color: #777777; }
        </style>
    </head>
    <body dir="${isArabic ? "rtl" : "ltr"}">
        <div class="container">
            <div class="header">
                <img src="https://res.cloudinary.com/dhfzkadm2/image/upload/v1768056757/logoWhite_l0rabo_wc3lbb.webp" alt="${companyName}">
                <h1 style="margin:0; font-size: 24px;">${isArabic ? "تحديث بخصوص تذكرتك" : "Ticket Update"}</h1>
            </div>
            <div class="body">
                <p>${t.greeting}</p>
                <p>${t.intro}</p>
                
                <h3 style="color: #333;">${t.messageTitle}</h3>
                <div class="message-box">
                    ${formatMessageForHtml(message)}
                </div>

                ${attachments && attachments.length > 0 ? `
                    <h3 style="color: #333;">${t.attachmentsTitle}</h3>
                    <div style="text-align: center;">
                        ${attachments.map(url => `<img src="${url}" class="attachment-img" alt="Attachment">`).join('')}
                    </div>
                ` : ""}

                <div class="btn-container">
                    <a href="${ticketLink}" class="btn">${t.cta}</a>
                </div>
            </div>
            <div class="footer">
                <p>© ${new Date().getFullYear()} ${companyName}</p>
                <p>${t.footerInfo}</p>
            </div>
        </div>
    </body>
    </html>
    `
  });
}
