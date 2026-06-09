/**
 * WhatsApp messaging utility using Facebook Graph API
 */

/**
 * Send a WhatsApp template message (Supports Named & Positional Parameters)
 */
export async function sendWhatsAppTemplate({
  to,
  templateName,
  languageCode,
  headerParameters = [],
  bodyParameters = [],
  buttonParameters = [],
}) {
  if (!process.env.WHATSAPP_TOKEN || !process.env.WHATSAPP_PHONE_NUMBER_ID) {
    throw new Error("WhatsApp credentials not configured");
  }

  /**
   * Helper to map parameters.
   * Supports positional strings/numbers and named objects { name, text }
   */
  const mapParameters = (params) =>
    params.map((param) => {
      if (typeof param === "object" && param.name) {
        // Support for Named Variables (e.g., {{order_id}})
        return {
          type: "text",
          parameter_name: param.name,
          text: String(param.text),
        };
      }
      // Support for Numbered Variables (e.g., {{1}})
      return {
        type: "text",
        text: String(param),
      };
    });

  const components = [];

  // 1. Add Header parameters (e.g., {{1}} in Header)
  if (headerParameters.length > 0) {
    components.push({
      type: "header",
      parameters: mapParameters(headerParameters),
    });
  }

  // 2. Add Body parameters (e.g., {{order_id}} in Body)
  if (bodyParameters.length > 0) {
    components.push({
      type: "body",
      parameters: mapParameters(bodyParameters),
    });
  }

  // 3. Add Button parameters (e.g., {{1}} in URL)
  if (buttonParameters.length > 0) {
    buttonParameters.forEach((param, index) => {
      components.push({
        type: "button",
        sub_type: "url",
        index: index.toString(),
        parameters: [
          {
            type: "text",
            text: String(param.text || param),
          },
        ],
      });
    });
  }

  const response = await fetch(
    `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: templateName,
          language: { code: languageCode },
          components,
        },
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    console.error(
      `WhatsApp API Error [${templateName}]:`,
      JSON.stringify(data, null, 2),
    );
    throw new Error(
      `Failed to send WhatsApp message [${templateName}]: (${data.error?.code}) ${data.error?.message || "Unknown error"}`,
    );
  }

  return data;
}

/**
 * Send verification code via WhatsApp
 */
export async function sendVerificationWhatsApp({ phone, code, lang }) {
  const templateName = lang === "ar" ? "verification_ar" : "verification_en";
  const languageCode = lang === "ar" ? "ar" : "en_US";

  return await sendWhatsAppTemplate({
    to: `+966${phone.slice(1)}`,
    templateName,
    languageCode,
    bodyParameters: [code],
    buttonParameters: [code],
  });
}
