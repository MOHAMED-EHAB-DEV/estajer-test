import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import connectDB from "@/lib/db";
import SupportChat from "@/models/SupportChat";
import { authenticateUser } from "@/middleware/auth";
import { authHeaders } from "@/middleware/authHeaders";
import { sendChatNotificationEmail } from "@/lib/email";
import User from "@/models/User";
import cloudinary from "@/lib/cloudinary";
import { handleApiError } from "@/lib/errorHandler";

async function getAuthUser(req) {
  const { searchParams } = new URL(req.url);
  const client = searchParams.get("client");
  return client ? await authenticateUser() : await authHeaders(req);
}

function buildFeedbackContext(feedbackItems) {
  if (!feedbackItems || feedbackItems.length === 0) return "[]";
  return JSON.stringify(
    feedbackItems.map((f) => ({ id: f.id, type: f.type, summary: f.summary })),
  );
}

export async function GET(req) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    const chat = await SupportChat.findOne({ userId: user._id });
    const readMsgIds = [];
    if (chat && chat.messages.length > 0) {
      chat.messages.forEach((m) => {
        if (m.role !== "user" && m.state === "sent") {
          m.state = "read";
          readMsgIds.push(m._id.toString());
        }
      });
      if (readMsgIds.length > 0) await chat.save();
    }
    if (!chat) return NextResponse.json(null);
    const chatObj = chat.toObject();
    chatObj.readMsgIds = readMsgIds;
    return NextResponse.json(chatObj);
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/support",
      method: "GET",
      req,
    });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    const { message, image, imageUrl: inputImageUrl } = await req.json();

    let finalImageUrl = inputImageUrl || undefined;
    let rawBase64Data = null;
    let rawMimeType = "image/webp";

    if (image && typeof image === "string") {
      if (image.startsWith("data:image/")) {
        const match = image.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
        if (match) {
          rawMimeType = match[1];
          rawBase64Data = match[2];
        }
        const uploaded = await cloudinary.uploader.upload(image, {
          folder: "support-chat",
          format: "webp",
        });
        finalImageUrl = uploaded.secure_url;
      } else if (image.startsWith("http")) {
        finalImageUrl = image;
      }
    }

    if (!message && !finalImageUrl) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }
    if (message && message.length > 1000) {
      return NextResponse.json({ error: "Message too long" }, { status: 400 });
    }

    const [chat, userRecord] = await Promise.all([
      SupportChat.findOne({ userId: user._id }),
      User.findById(user._id, { isRenter: 1, hasShop: 1 }),
    ]);
    const isRenter = userRecord?.isRenter ?? false;
    const hasShop = userRecord?.hasShop ?? false;

    let resolvedChat = chat;
    if (!resolvedChat) {
      resolvedChat = await SupportChat.create({
        userId: user._id,
        messages: [],
        feedbackItems: [],
        aiMode: true,
      });
    }
    // Use resolvedChat from here on
    const chatRef = resolvedChat;

    // Save user message
    const userMsg = {
      role: "user",
      content: message || "",
      imageUrl: finalImageUrl,
      state: "sent",
      timestamp: new Date(),
    };
    chatRef.messages.push(userMsg);
    chatRef.lastMessageAt = new Date();

    if (!chatRef.aiMode) {
      await chatRef.save();
      return NextResponse.json({
        aiMode: false,
        message: null,
        userMessage: chatRef.messages[chatRef.messages.length - 1],
      });
    }

    // --- AI mode ---
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const responseSchema = {
      type: "object",
      properties: {
        message: { type: "string" },
        feedbackAction: {
          type: "object",
          properties: {
            action: {
              type: "string",
              enum: ["create", "update", "none"],
            },
            type: {
              type: "string",
              enum: ["bug", "suggestion", "review", "other"],
            },
            id: { type: "string" },
            summary: { type: "string" },
          },
          required: ["action"],
        },
      },
      required: ["message", "feedbackAction"],
    };

    const chatModel = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema,
      },
    });

    // Build history context (last 8 messages)
    const historyContext = chatRef.messages
      .slice(-8)
      .map((m) => `${m.role === "user" ? "User" : "Support"}: ${m.content}`)
      .join("\n");

    const feedbackContext = buildFeedbackContext(chatRef.feedbackItems);

    // Role-specific context
    const userRoleContext = isRenter
      ? `User role: RENTER (مستأجر) — rents products from owners.`
      : hasShop
      ? `User role: STORE OWNER (صاحب متجر) — has an official registered Shop on Estajer.`
      : `User role: INDIVIDUAL OWNER (مؤجر) — lists personal products for rent.`;

    // Existing features to avoid redundant suggestions
    const existingFeaturesContext = `EXISTING ESTAJER FEATURES:
Do NOT suggest building these features (already implemented):
- Refundable Security Deposit: Product-specific deposits held and refunded automatically.
- Damage Reports: Portal to submit claims with photos for admin review.
- Escrow Payments: Waffy integration secures rental funds.
- Delivery Options: Pickup, owner delivery (per Km or fixed city rate), verification codes.
- Electronic Agreements: Generated rental contracts signed electronically by both parties.
- Flexible Pricing: Hourly/daily/weekly/monthly packages with automated discounts.
- Brand Storefronts: Businesses can set up online shops.
- Custom Requests: Renters can request unlisted products.
- AI Listing Assistant: Owners can use AI to auto-generate product details, suggest pricing, and enhance images when adding products.`;

    // Build prompt parts
    const promptParts = [];

    const systemPrompt = `You are "Estajer Support" — the friendly, professional, and human-sounding support representative of Estajer.com (a Saudi product rental platform).
Your goal: have a natural conversation to collect user feedback. Never sound like a bot or survey. Use a polite, professional, yet warm Saudi customer service tone.

IMPORTANT CONTEXT:
${userRoleContext}

${existingFeaturesContext}

Tailor ALL suggestions, questions, and feedback summaries to be relevant to this user's role. Do NOT suggest owner-specific features to renters, and do NOT suggest renter-specific features to owners.

RULES:
1. Reply ONLY in the EXACT language the user used (Arabic if Arabic, English if English).
2. Be warm, polite, conversational, and brief. 2-3 sentences max per reply.
3. Guide the conversation naturally: overall opinion → problems → suggestions → close.
4. For each distinct issue or suggestion the user mentions, record it ONCE. Do NOT merge unrelated items.
5. If the user adds detail to an already-recorded item, UPDATE that item (use its id). Do NOT create a duplicate.
6. If the user says something general or you need to ask a follow-up, use action "none".
7. If an image was shared, analyze it and incorporate its content into the feedback summary.
8. Never mention that you are AI or that you are recording feedback items — act natural.
9. ALWAYS write the feedback summary (feedbackAction.summary) in clear, professional Arabic (اللغة العربية), even if the user spoke in English or sent an image containing English text.
10. NEVER create or update feedback items (use action "none") if the user requests or mentions a feature that ALREADY exists in "EXISTING ESTAJER FEATURES". Only record GENUINE NEW suggestions or actual bugs/issues.
11. Do NOT refer to the user as a shop owner unless their context explicitly states they have a registered Shop. For individual owners, speak to them simply as an owner/lender.

Current feedback items already recorded:
${feedbackContext}

Conversation history:
${historyContext}

User's latest message: ${message || "(sent an image)"}`;

    promptParts.push({ text: systemPrompt });

    // Add image if present (Gemini vision)
    if (rawBase64Data) {
      promptParts.push({
        inlineData: { mimeType: rawMimeType, data: rawBase64Data },
      });
    } else if (finalImageUrl) {
      try {
        const imgRes = await fetch(finalImageUrl);
        const arrayBuffer = await imgRes.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");
        const mimeType = imgRes.headers.get("content-type") || "image/webp";
        promptParts.push({ inlineData: { mimeType, data: base64 } });
      } catch (_) {}
    }

    const result = await chatModel.generateContent(promptParts);
    const rawText = result.response.text();

    let responseJson = { message: "...", feedbackAction: { action: "none" } };
    try {
      responseJson = JSON.parse(rawText);
    } catch (_) {
      responseJson.message = rawText;
    }

    const { feedbackAction } = responseJson;
    let feedbackRef = undefined;

    if (feedbackAction?.action === "create" && feedbackAction.summary) {
      const newItem = {
        id: crypto.randomUUID().slice(0, 8),
        type: feedbackAction.type || "other",
        summary: feedbackAction.summary,
        imageUrl: finalImageUrl || undefined,
        createdAt: new Date(),
      };
      chatRef.feedbackItems.push(newItem);
      feedbackRef = newItem.id;
    } else if (
      feedbackAction?.action === "update" &&
      feedbackAction.id &&
      feedbackAction.summary
    ) {
      const item = chatRef.feedbackItems.find(
        (f) => f.id === feedbackAction.id,
      );
      if (item) {
        item.summary = feedbackAction.summary;
        if (finalImageUrl && !item.imageUrl) item.imageUrl = finalImageUrl;
        feedbackRef = item.id;
      }
    }

    const aiMsg = {
      role: "ai",
      content: responseJson.message || "...",
      state: "sent",
      feedbackRef,
      timestamp: new Date(),
    };
    // Mark the user message as read when AI responds
    if (chatRef.messages.length > 0) {
      const lastUserMsgIndex = chatRef.messages
        .map((m) => m.role)
        .lastIndexOf("user");
      if (lastUserMsgIndex !== -1) {
        chatRef.messages[lastUserMsgIndex].state = "read";
      }
    }
    chatRef.messages.push(aiMsg);
    chatRef.lastMessageAt = new Date();
    await chatRef.save();

    return NextResponse.json({
      aiMode: true,
      aiMessage: chatRef.messages[chatRef.messages.length - 1],
      userMessage: chatRef.messages[chatRef.messages.length - 2],
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/support",
      method: "POST",
      req,
    });
  }
}
