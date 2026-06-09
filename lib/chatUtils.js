/**
 * Normalizes Arabic/Persian digits to English digits
 */
export const normalizeDigits = (str) =>
  str.replace(/[٠-٩۰-۹]/g, (d) => d.charCodeAt(0) & 0xf);

/**
 * Removes URLs from a string to avoid false positives in detection
 */
export const stripUrls = (str) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return str.replace(urlRegex, "");
};

/**
 * Checks if a message contains a Saudi phone number or suspicious numeric patterns
 */
export const detectPhoneNumber = (
  newMessage,
  messages = [],
  currentUserId,
  t,
) => {
  if (!newMessage.trim()) return false;

  const normalizedNewMessage = normalizeDigits(newMessage);
  const messageForDetection = stripUrls(normalizedNewMessage);

  // Saudi phone numbers regex
  const saudiPhoneRegex =
    /(?:(?:\+|00)(?:\D{0,5}9\D{0,5}6\D{0,5}6)(?:\D{0,5}0)?|0)?\D{0,5}5(?:\D{0,5}\d){8}/g;

  // 1. Prefix Check (Starts with 05 or 9665)
  const cleanMsg = messageForDetection.replace(/[\s\-\+\(\)]/g, "");
  const isPhonePrefix = /^(05|9665)/.test(cleanMsg);
  const digitCount = (messageForDetection.match(/\d/g) || []).length;

  // 2. Cumulative Context Check (Last 2 user messages + current)
  const recentUserMessages = messages
    .filter((m) => m.sender?._id === currentUserId && !m.isAdmin)
    .slice(-2);

  const historyContent = normalizeDigits(
    recentUserMessages.map((m) => stripUrls(m.content)).join(""),
  ).replace(/[\s\-\+\(\)]/g, "");

  const combinedContext = (historyContent + cleanMsg).replace(
    /[\s\-\+\(\)]/g,
    "",
  );

  // 3. Suspicious Numeric Pattern (3 numeric messages in a row)
  const isPurelyNumeric = (str) => {
    const normalized = normalizeDigits(stripUrls(str)).replace(
      /[\s\-\+\(\)]/g,
      "",
    );
    return normalized.length > 0 && /^\d+$/.test(normalized);
  };

  const historyWasNumeric =
    recentUserMessages.length >= 2 &&
    recentUserMessages.every((m) => isPurelyNumeric(m.content));

  saudiPhoneRegex.lastIndex = 0;
  const historyAlreadyMatched = saudiPhoneRegex.test(historyContent);
  saudiPhoneRegex.lastIndex = 0;

  if (
    saudiPhoneRegex.test(messageForDetection) ||
    (digitCount > 0 &&
      !historyAlreadyMatched &&
      saudiPhoneRegex.test(combinedContext)) ||
    (isPhonePrefix && digitCount >= 4) ||
    (historyWasNumeric && isPurelyNumeric(newMessage))
  ) {
    return true;
  }

  return false;
};

export const SAUDI_PHONE_REGEX =
  /(?:(?:\+|00)(?:\D{0,5}9\D{0,5}6\D{0,5}6)(?:\D{0,5}0)?|0)?\D{0,5}5(?:\D{0,5}\d){8}/g;

export const detectContactSolicitation = (message) => {
  if (!message || !message.trim()) return false;

  // Normalize: Arabic/Persian digits → English, collapse repeated spaces, lowercase
  const normalized = normalizeDigits(message)
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

  // ─── 1. Direct contact-request keywords ───────────────────────────────────
  // Arabic patterns: asking for / sharing phone, WhatsApp, social handles, email
  const arabicContactPatterns = [
    // Phone / number
    /رقم(ك|ي|ه|ها|كم|نا|هم)?/, // رقمك, رقمي, رقمه …
    /رق[مه]\s*(التواصل|الجوال|الموبايل|الهاتف|الواتس|الواتساب)/,
    /ارقام\s*التواصل/,
    /رقم\s*خاص/,
    /ايش\s*رقم/,
    /وش\s*رقم/,
    /كيف\s*(اتواصل|أتواصل|نتواصل)/,
    /(ابعت|ارسل|ارسلي|ارسلو|ابعثلي|ابعثلنا)\s*(رقم|ارقام|واتس|تليفون|جوال)/,
    /تواصل\s*(معي|معك|بره|خارج|برا)/,
    /اتواصل\s*(معاك|معكم|معك)/,
    /نتواصل\s*(بره|خارج|برا)/,
    /كلمني/,
    /رن\s*(علي|عليا)/,
    /نتكلم\s*(فون|واتس|مكالمة|صوت)/,
    /(عاوز|عايز|ابي|ابغى|بدي|اريد)\s*(اتواصل|نتواصل|نتكلم)/,
    /(عطني|اعطيني|هات)\s*(رقمك|جوالك|رقم|واتس)/,
    // WhatsApp
    /واتس(اب|آب|آپ|اپ)?(ك|ي|ه|ها|كم|نا)?/,
    /واتس\s*اب/,
    // Telegram
    /تيليجرام|تلجرام|تيلقرام|تلغرام/,
    // Snapchat
    /سناب(شات|چات|تشات)?(ك|ي|ه|ها|كم|نا)?/,
    /سناب\s*شات/,
    // Instagram
    /انستا(قرام|غرام)?(ك|ي|ه|ها|كم|نا)?/,
    /انستغرام|انستاقرام/,
    // Twitter / X
    /تويتر|تويتري|تويترك|تويتره/,
    // Email
    /ايميل(ك|ي|ه|ها|كم|نا)?/,
    /الايميل|بريد\s*الكتروني|بريدك/,
    // Generic off-platform
    /تواصل\s*خارج/,
    /بره\s*(المنصة|الاب|التطبيق)/,
    /خارج\s*(المنصة|الاب|التطبيق)/,
    /اسم\s*(الشركة|المتجر|الحساب)/,
    /حساب(ك|ي|ه|ها)?\s*(في|على|ع)\s*(سناب|انستا|تويتر|تيليجرام)/,
  ];

  // ─── 2. English patterns ───────────────────────────────────────────────────
  const englishContactPatterns = [
    // Phone
    /\b(phone|mobile|cell|telephone)\s*(number|num|no\.?|#)?\b/,
    /\byour\s*(number|phone|mobile|cell)\b/,
    /\bmy\s*(number|phone|mobile|cell)\s*is\b/,
    /\b(call|text|ring)\s*me\b/,
    /\bcontact\s*(me|us|number|info|details)\b/,
    /\breach\s*(me|us|out)\b/,
    // WhatsApp
    /\bwhats\s*app\b/,
    /\bwh?a+ts?\s*a+p+\b/,
    // Telegram
    /\btelegram\b/,
    /\btg\s*(username|id|handle)\b/,
    // Snapchat
    /\bsnap\s*(chat)?\b/,
    // Instagram
    /\b(insta(gram)?|ig)\s*(handle|id|username|account|dm)?\b/,
    /\bsend\s*(me\s*)?(a\s*)?dm\b/,
    /\bdm\s*me\b/,
    // Twitter/X
    /\b(twitter|x\.com)\s*(handle|username|account)?\b/,
    // Email
    /\b(email|e-mail|mail)\s*(address|me|at|:)?\b/,
    /\b(gmail|hotmail|yahoo|outlook)\b/,
    // Generic off-platform
    /\b(outside|off|beyond)\s*(the\s*)?(platform|app|site|here)\b/,
    /\b(contact|communicate|talk|chat)\s*(outside|off|beyond)\b/,
    /\bpersonal\s*(contact|info|details|number)\b/,
    /\bsocial\s*(media|account|handle)\b/,
    /\bcompany\s*name\b/,
    /\bmy\s*(insta|snap|telegram|tg|twitter)\s*(is|:)\b/,
  ];

  for (const pattern of [...arabicContactPatterns, ...englishContactPatterns]) {
    if (pattern.test(normalized)) return true;
  }

  // ─── 3. Social-handle pattern (@username) ─────────────────────────────────
  // Any @mention that looks like a username (not an email)
  if (/@[a-z0-9_.]{3,}/i.test(message) && !/.+@.+\..+/.test(message)) {
    return true;
  }

  return false;
};
