import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import connectDB from "@/lib/db";
import AiChat from "@/models/AiChat";
import Visitor from "@/models/Visitor";
import { authenticateUser } from "@/middleware/auth";
import { rateLimit } from "@/lib/rate-limit";
import { handleApiError } from "@/lib/errorHandler";

const postLimiter = rateLimit({
  interval: 24 * 60 * 60 * 1000, // 1 day
  uniqueTokenPerInterval: 2000,
  limit: 20,
});
export async function POST(req) {
  try {
    await postLimiter.check(req);

    const body = await req.json();
    const prompt = body?.prompt;
    const userMessage = body?.userMessage;
    const name = body?.name || "";
    const lang = body?.lang || "ar";
    if (!prompt)
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 },
      );

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    await connectDB();

    let authedUser = null;
    try {
      authedUser = await authenticateUser();
    } catch (_) {
      authedUser = null;
    }

    const headers = req.headers;
    const forwarded =
      headers.get("x-forwarded-for") || headers.get("x-real-ip") || "";
    const ip = forwarded
      ? forwarded.split(",")[0].trim().replace("::ffff:", "")
      : undefined;
    const userAgent = headers.get("user-agent") || "";
    const referrer = headers.get("referer") || "";
    const acceptLanguage = headers.get("accept-language") || "";

    let visitor = null;
    if (!authedUser && ip) {
      visitor = await Visitor.findOne({ ip });
      if (!visitor) {
        visitor = await Visitor.create({
          ip,
          userAgent,
          referrer,
          acceptLanguage,
        });
      }
    }

    const sessionId = authedUser ? `ai_${authedUser._id}` : `ai_${visitor._id}`;

    let aiChat = await AiChat.findOne({ sessionId });
    if (!aiChat) {
      aiChat = await AiChat.create({
        sessionId,
        user: authedUser?._id,
        visitor: visitor?._id,
        visitorName: name || authedUser?.fullName || "",
        metadata: { ip, userAgent, referrer, acceptLanguage },
        messages: [],
      });
    } else if (name && !aiChat.visitorName) {
      aiChat.visitorName = name;
    }

    let userContent = typeof userMessage === "string" ? userMessage : "";
    if (!userContent && typeof prompt === "string") {
      const lines = prompt.split("\n").filter(Boolean);
      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i];
        if (line.startsWith("User:")) {
          userContent = line.replace(/^User:\s*/, "");
          break;
        }
      }
    }

    if (userContent && userContent.length <= 500) {
      aiChat.messages.push({
        role: "user",
        content: userContent,
        timestamp: new Date(),
        state: "read",
      });
    }

    const augmented = `
wYou are a helpful assistant for Estajer.com. Your name is "Estajer assistant", Your response MUST be one object with the format {"type": "", "message": ""} NOT ARRAY.
read the last user message If the user asks about Estajer,and you want to send him to the about page set "type" to "about" if you just told him and didn't want to redirect him set "type" to "text".
If the user wants to rent or search for a product and you want to show him products, set "type" to "search" and add a "name" field with the product's name CORRECTLY typed, if you want to ask him more question or just chat set "type" to "text".
For all other questions and complaint, set "type" to "contact" to show the contact form and set the "question" field with the improved user's question and set the "subject" with one of those [general,support,feedback,subscription,other] or you can give him the whatsapp number 966530636879 and set the "type" to "whatsapp" or just replay and set "type" to "text".
Context about Estajer:أهلاً بك في "استأجر"! نحن منصتك الذكية في السعودية لتأجير واستئجار كل ما تحتاجه بسهولة وأمان. ببساطة، نربط بين أصحاب المنتجات والأشخاص الذين يرغبون في استخدامها مؤقتاً، لنوفر لك تجربة موثوقة تساعدك على توفير مالك والحصول على ما تريد.
Your task is to NOT repeat this text verbatim every time.
the user messages:\n${prompt}`;

    const chatModel = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: { response_mime_type: "application/json" },
    });
    const result = await chatModel.generateContent(augmented);

    let assistantMessageText = "";
    const responseJson = JSON.parse(result.response.text());

    if (responseJson?.type === "contact" || responseJson?.type === "whatsapp") {
      const currentDate = new Date();
      const holidayEndDate = new Date("2026-05-29T23:59:59");
      if (currentDate < holidayEndDate) {
        responseJson.message =
          lang === "ar"
            ? "أهلاً بك، نفيدكم علماً بأن إدارة المنصة وفريق الدعم في إجازة حالياً حتى تاريخ 29-05-2026. نسعد بخدمتكم والرد على استفساراتكم فور استئناف العمل بمشيئة الله. شكراً لتفهمكم."
            : "Hello! Please be informed that the administration and support team is currently on holiday until May 29, 2026. We will get back to you as soon as we resume work. Thank you for your understanding.";
      }
    }

    assistantMessageText = responseJson?.message || "";

    aiChat.messages.push({
      role: "assistant",
      content:
        assistantMessageText ||
        (responseJson?.name
          ? lang === "ar"
            ? "إضغط على المنتج الذي تريد تأجيره"
            : "Click on the product you want to rent"
          : "..."),
      aiData: responseJson,
      timestamp: new Date(),
      state: "read",
    });
    aiChat.lastMessageAt = new Date();
    await aiChat.save();

    return NextResponse.json({
      text:
        assistantMessageText ||
        (responseJson?.name
          ? lang === "ar"
            ? "إضغط على المنتج الذي تريد تأجيره"
            : "Click on the product you want to rent"
          : "..."),
      chatId: sessionId,
      aiData: responseJson,
      success: true,
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/assistant/rag",
      method: "POST",
      req,
      requestBody: body,
    });
  }
}

export async function GET(req) {
  try {
    await connectDB();
    let authedUser = null;
    try {
      authedUser = await authenticateUser();
    } catch (_) {
      authedUser = null;
    }

    const headers = req.headers;
    const forwarded =
      headers.get("x-forwarded-for") || headers.get("x-real-ip") || "";
    const ip = forwarded
      ? forwarded.split(",")[0].trim().replace("::ffff:", "")
      : undefined;

    let visitor = null;
    if (!authedUser && ip) {
      visitor = await Visitor.findOne({ ip });
    }

    const sessionId = authedUser ? `ai_${authedUser._id}` : `ai_${visitor._id}`;

    const aiChat = await AiChat.findOne({ sessionId });
    if (!aiChat) return NextResponse.json([]);

    return NextResponse.json(aiChat);
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/assistant/rag",
      method: "GET",
      req,
    });
  }
}
