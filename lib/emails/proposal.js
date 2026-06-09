import { transporter } from "../email";

/**
 * Send a proposal-reply email in Arabic or English.
 *
 * Options:
 *  - email
 *  - name
 *  - subject
 *  - originalMessage
 *  - replyMessage
 *  - proposalId
 *  - proposalTitle
 *  - responderName
 *  - actionUrl
 *  - lang: "ar" | "en" (default: "ar")
 */
export async function sendProposalReplyEmail({
  email,
  name,
  subject,
  originalMessage = "",
  replyMessage = "",
  proposalId,
  proposalTitle,
  responderName,
  actionUrl,
  lang = "ar",
}) {
  const isAr = String(lang || "ar")
    .toLowerCase()
    .startsWith("ar");

  const appUrl = process.env.APP_URL || "https://estajer.com";
  const unsubscribeUrl =
    process.env.UNSUBSCRIBE_URL || `${appUrl}/unsubscribe`;
  const companyName = process.env.COMPANY_NAME || "Estajer | استأجر";
  const companyAddress = process.env.COMPANY_ADDRESS || "123 Main Street";
  const companyCityCountry =
    process.env.COMPANY_CITY_COUNTRY || "Riyadh, Saudi Arabia";
  const logoUrl =
    process.env.COMPANY_LOGO_URL ||
    "https://res.cloudinary.com/dhfzkadm2/image/upload/v1768056757/logoWhite_l0rabo_wc3lbb.webp";
  const supportEmail = "service@estajer.com";
  const fromAddress = process.env.EMAIL_FROM_ADDRESS || "no-reply@estajer.com";

  const builtActionUrl =
    actionUrl || (proposalId ? `${appUrl}/proposals/${proposalId}` : appUrl);

  const L = {
    ar: {
      subjectPrefix: "رد على مقترحك",
      headerTitle: "رد على مقترحك",
      greeting: (n) => `مرحباً ${n || "عميلنا العزيز"}`,
      originalLabel: "استفسارك الأصلي",
      replyLabel: "ردنا",
      viewProposal: "عرض المقترح",
      closing: "مع أطيب التحيات،",
      supportLine: "للدعم",
      unsubscribeLabel: "إلغاء الاشتراك",
      preheader: (s) => `لقد تلقيت ردًا على مقترحك "${s}" من ${companyName}.`,
      marketingNote:
        "هذه رسالة خدمية ردًا على استفسارك. لا يتم إرسال رسائل تسويقية إلى هذا العنوان دون موافقتك.",
      subjectTemplate: (s) => `رد على مقترحك: ${s} - ${companyName}`,
      dir: "rtl",
      langAttr: "ar",
      textLabels: {
        subject: "موضوع",
        viewProposal: "عرض المقترح",
      },
    },
    en: {
      subjectPrefix: "Reply to your proposal",
      headerTitle: "Reply to your proposal",
      greeting: (n) => `Hello ${n || "valued customer"},`,
      originalLabel: "Your original message",
      replyLabel: "Our reply",
      viewProposal: "View proposal",
      closing: "Best regards,",
      supportLine: "Support",
      unsubscribeLabel: "Unsubscribe",
      preheader: (s) =>
        `You have received a reply to your proposal "${s}" from ${companyName}.`,
      marketingNote:
        "This is a service message in response to your inquiry. You won't receive marketing emails at this address without your consent.",
      subjectTemplate: (s) => `Reply to your proposal: ${s} - ${companyName}`,
      dir: "ltr",
      langAttr: "en",
      textLabels: {
        subject: "Subject",
        viewProposal: "View proposal",
      },
    },
  };

  const t = isAr ? L.ar : L.en;

  const emailSubject = t.subjectTemplate(subject || proposalTitle || "");
  const headerTitle = t.headerTitle;

  // HTML escape and newline -> <br>
  const escapeHtml = (str = "") =>
    String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const formatMessageForHtml = (message = "") =>
    escapeHtml(message).replace(/\r\n|\r|\n/g, "<br>");

  // Plain text fallback localized
  const plainTextParts = [];
  if (isAr) {
    plainTextParts.push(headerTitle);
    plainTextParts.push("");
    plainTextParts.push(t.greeting(name));
    plainTextParts.push("");
    plainTextParts.push(
      `${t.textLabels.subject}: ${subject || proposalTitle || "-"}`
    );
    plainTextParts.push("");
    plainTextParts.push(`${t.originalLabel}:`);
    plainTextParts.push(originalMessage || "-");
    plainTextParts.push("");
    plainTextParts.push(`${t.replyLabel}:`);
    plainTextParts.push(replyMessage || "-");
    plainTextParts.push("");
    plainTextParts.push(`${t.viewProposal}: ${builtActionUrl}`);
    plainTextParts.push("");
    plainTextParts.push(t.closing);
    plainTextParts.push(`${responderName || "فريق الدعم"} - ${companyName}`);
    plainTextParts.push("");
    plainTextParts.push(`${t.supportLine}: ${supportEmail}`);
    plainTextParts.push("");
    plainTextParts.push(`${t.unsubscribeLabel}: ${unsubscribeUrl}`);
  } else {
    plainTextParts.push(headerTitle);
    plainTextParts.push("");
    plainTextParts.push(t.greeting(name));
    plainTextParts.push("");
    plainTextParts.push(
      `${t.textLabels.subject}: ${subject || proposalTitle || "-"}`
    );
    plainTextParts.push("");
    plainTextParts.push(`${t.originalLabel}:`);
    plainTextParts.push(originalMessage || "-");
    plainTextParts.push("");
    plainTextParts.push(`${t.replyLabel}:`);
    plainTextParts.push(replyMessage || "-");
    plainTextParts.push("");
    plainTextParts.push(`${t.viewProposal}: ${builtActionUrl}`);
    plainTextParts.push("");
    plainTextParts.push(t.closing);
    plainTextParts.push(`${responderName || "Support Team"} - ${companyName}`);
    plainTextParts.push("");
    plainTextParts.push(`${t.supportLine}: ${supportEmail}`);
    plainTextParts.push("");
    plainTextParts.push(`${t.unsubscribeLabel}: ${unsubscribeUrl}`);
  }
  const plainText = plainTextParts.join("\n");

  // Button (localized) and direction-aware wrapper
  // const actionButtonHtml = builtActionUrl
  //     ? `<div style="text-align:center; margin:18px 0;">
  //      <a href="${escapeHtml(builtActionUrl)}" target="_blank" rel="noopener"
  //        style="display:inline-block; padding:12px 20px; border-radius:8px; text-decoration:none; font-weight:bold; border:1px solid #F48A42;color: #F48A42;">
  //        ${escapeHtml(isAr ? t.viewProposal : t.viewProposal)}
  //      </a>
  //    </div>`
  //     : "";

  const html = `<!DOCTYPE html>
<html dir="${t.dir}" lang="${t.langAttr}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${escapeHtml(emailSubject)}</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
    img { -ms-interpolation-mode:bicubic; border:0; height:auto; line-height:100%; outline:none; text-decoration:none; }
    body { margin:0; padding:0; width:100% !important; background:#f8f6f2; font-family: sans-serif; color:#333; }
    .container { max-width:600px; margin:0 auto; font-size:16px; direction:${
      t.dir
    }; }
    .header { background:#F48A42; padding:28px 20px; text-align:center; border-top-left-radius:12px; border-top-right-radius:12px; color:#fff; }
    .header img { max-width:150px; display:block; margin:0 auto 10px; }
    .body { background:#fff; padding:30px; text-align:${
      isAr ? "right" : "left"
    }; }
    .msg-block { background:#f9f9f9; padding:16px; border-${
      isAr ? "right" : "left"
    }:4px solid #F48A42; border-radius:${
    isAr ? "0 8px 8px 0" : "8px 0 0 8px"
  }; margin:12px 0; color:#555; line-height:1.6; }
    .footer { background:#f0f0f0; padding:20px; text-align:center; font-size:13px; color:#777; border-bottom-left-radius:12px; border-bottom-right-radius:12px; }
    .small { font-size:13px; color:#888; }
    .preheader { display:none; font-size:1px; color:#f8f6f2; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden; }
  </style>
</head>
<body>
  <div class="preheader">${escapeHtml(
    t.preheader(subject || proposalTitle || "")
  )}</div>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f6f2;">
    <tr>
      <td align="center" style="padding:20px 10px;">
        <table class="container" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
          <tr>
            <td class="header">
              <img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(
    companyName
  )} logo" />
              <h1 style="margin:0; font-size:24px;">${escapeHtml(
                headerTitle
              )}</h1>
            </td>
          </tr>

          <tr>
            <td class="body">
              <p style="margin:0 0 14px 0;">${escapeHtml(
                isAr ? t.greeting(name) : t.greeting(name)
              )}</p>
              <p style="margin:0 0 12px 0;">${escapeHtml(
                isAr
                  ? "شكرًا لتواصلك معنا بخصوص المقترح:"
                  : "Thank you for contacting us regarding the proposal:"
              )} "<strong>${escapeHtml(
    subject || proposalTitle || "-"
  )}</strong>".</p>

              <h3 style="margin:18px 0 8px 0;">${escapeHtml(
                isAr ? t.originalLabel : t.originalLabel
              )}:</h3>
              <div class="msg-block">
                <p style="margin:0;">${formatMessageForHtml(
                  originalMessage
                )}</p>
              </div>

              <h3 style="margin:18px 0 8px 0;">${escapeHtml(
                isAr ? t.replyLabel : t.replyLabel
              )}:</h3>
              <div class="msg-block">
                <p style="margin:0;">${formatMessageForHtml(replyMessage)}</p>
              </div>


              <p style="margin:18px 0 6px 0;">${
                isAr
                  ? `إذا كان لديك أي أسئلة إضافية أو ترغب بتعديل المقترح، يمكنك الرد على هذا البريد أو التواصل معنا عبر <a href="mailto:${escapeHtml(
                      supportEmail
                    )}" style="color:#F48A42;">${escapeHtml(supportEmail)}</a>.`
                  : `If you have any additional questions or would like to revise the proposal, reply to this email or contact us at <a href="mailto:${escapeHtml(
                      supportEmail
                    )}" style="color:#F48A42;">${escapeHtml(supportEmail)}</a>.`
              }</p>

              <p style="margin:6px 0 0 0;">${escapeHtml(
                isAr
                  ? `${responderName || "فريق الدعم"} — ${companyName}`
                  : `${responderName || "Support Team"} — ${companyName}`
              )}</p>
            </td>
          </tr>

          <tr>
            <td class="footer">
              <p style="margin:0 0 8px 0;">${escapeHtml(companyName)}</p>
              <p style="margin:0 0 8px 0;">${escapeHtml(
                companyAddress
              )} | ${escapeHtml(companyCityCountry)}</p>
              <p class="small" style="margin-top:10px;">${escapeHtml(
                t.marketingNote
              )}</p>
              <p class="small" style="margin-top:8px;">${
                isAr
                  ? `لإلغاء الاشتراك: <a href="${escapeHtml(
                      unsubscribeUrl
                    )}" style="color:#F48A42;">${escapeHtml(
                      t.unsubscribeLabel
                    )}</a>`
                  : `Unsubscribe: <a href="${escapeHtml(
                      unsubscribeUrl
                    )}" style="color:#F48A42;">${escapeHtml(
                      t.unsubscribeLabel
                    )}</a>`
              }</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return transporter.sendMail({
    from: `"${companyName}" <${fromAddress}>`,
    to: email,
    subject: emailSubject,
    replyTo: supportEmail,
    headers: {
      "List-Unsubscribe": `<${unsubscribeUrl}>, <mailto:${supportEmail}?subject=unsubscribe>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
    text: plainText,
    html,
  });
}
