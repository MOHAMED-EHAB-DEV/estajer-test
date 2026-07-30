import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import cloudinary from "@/lib/cloudinary";
import { authenticateUser } from "@/middleware/auth";
import { handleApiError } from "@/lib/errorHandler";
import sharp from "sharp";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const DEFAULT_PROMPT =
  "Keep the main product in this image exactly as it is, do not change any details of the item itself. Completely remove the messy background and replace it with a pure, solid white background (#FFFFFF). Add a subtle, realistic drop shadow beneath the product to ground it. Professional e-commerce catalog photography style, highly detailed, clean minimalist look.";

export const maxDuration = 60;

/**
 * Fetch an image from a URL and return it as a base64 string with its mimeType.
 */
async function fetchImageAsBase64(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.statusText}`);
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const contentType = res.headers.get("content-type") || "image/webp";
  return { data: buffer.toString("base64"), mimeType: contentType, buffer };
}





function getClosestAspectRatio(width, height) {
  if (!width || !height) return "1:1";
  const ratio = width / height;

  if (ratio >= 0.9 && ratio <= 1.1) return "1:1";

  if (ratio > 1.1) {
    if (ratio <= 1.4) return "4:3";
    if (ratio <= 1.6) return "3:2";
    return "16:9";
  } else {
    if (ratio >= 0.75) return "3:4";
    if (ratio >= 0.65) return "2:3";
    return "9:16";
  }
}

/**
 * POST /api/ai/enhance-product-image
 * Body: { productId: string, prompt?: string }
 * Admin only.
 * Steps:
 *   1. Fetch the product's first image URL from DB
 *   2. Download it and send to Gemini for background removal
 *   3. Upload result to Cloudinary
 *   4. Return the new image data
 */
export async function POST(req) {
  try {
    await connectDB();
    const user = await authenticateUser();

    if (user.accountType !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin only" },
        { status: 403 },
      );
    }

    const { productId, prompt, base64Image } = await req.json();

    if (!productId) {
      return NextResponse.json(
        { error: "productId is required" },
        { status: 400 },
      );
    }

    const product = await Product.findById(productId).select("images").lean();
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    if (!product.images || product.images.length === 0) {
      return NextResponse.json(
        { error: "Product has no images" },
        { status: 400 },
      );
    }

    const finalPrompt = (prompt?.trim() || DEFAULT_PROMPT) +
      " Output image must be high-resolution, crystal clear, sharp focus, professional catalog quality, 8k, no blur, high fidelity.";

    let base64Data, mimeType, buffer;

    if (base64Image && base64Image.startsWith("data:image/")) {
      mimeType = base64Image.substring(base64Image.indexOf(":") + 1, base64Image.indexOf(";"));
      const rawBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");
      base64Data = rawBase64;
      buffer = Buffer.from(rawBase64, "base64");
    } else {
      const imageUrl = product.images[0].preview;
      // Download the original image
      const fetched = await fetchImageAsBase64(imageUrl);
      base64Data = fetched.data;
      mimeType = fetched.mimeType;
      buffer = fetched.buffer;
    }

    // Get metadata to preserve correct aspect ratio and quality
    const metadata = await sharp(buffer).metadata();
    const aspect = getClosestAspectRatio(metadata.width, metadata.height);

    // Call Gemini for image editing
    const model = genAI.getGenerativeModel({
      model: "models/gemini-3.1-flash-image",
      generationConfig: {
        temperature: 0.2,
        responseModalities: ["image", "text"],
        imageConfig: {
          aspectRatio: aspect,
        },
      },
    });

    const result = await model.generateContent([
      { inlineData: { data: base64Data, mimeType } },
      { text: finalPrompt },
    ]);

    // Extract the generated image from the response
    const parts = result.response.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find((p) => p.inlineData?.data);

    if (!imagePart) {
      return NextResponse.json(
        {
          error: "AI did not return an image. Try again or adjust the prompt.",
        },
        { status: 422 },
      );
    }

    const generatedBase64 = imagePart.inlineData.data;
    const generatedMime = imagePart.inlineData.mimeType || "image/png";

    // Convert to webp buffer via sharp for consistency + color extraction
    const inputBuffer = Buffer.from(generatedBase64, "base64");
    const webpBuffer = await sharp(inputBuffer)
      .webp({ quality: 90 })
      .toBuffer();

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "products", format: "webp", resource_type: "image" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );
      stream.end(webpBuffer);
    });

    // Since background is made pure white, set card gradient backdrop to white to match
    const gradientColors = ["#ffffff", "#ffffff"];
    const gradientStyle = "linear-gradient(135deg, #ffffff, #ffffff)";

    const newImage = {
      preview: uploadResult.secure_url,
      gradientColors,
      gradientStyle,
    };

    return NextResponse.json({ success: true, image: newImage });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/ai/enhance-product-image",
      method: "POST",
      req,
    });
  }
}

/**
 * PUT /api/ai/enhance-product-image
 * Body: { productId: string, image: { preview, gradientColors, gradientStyle } }
 * Admin only. Saves the enhanced image to Product.images[0] in DB.
 */
export async function PUT(req) {
  try {
    await connectDB();
    const user = await authenticateUser();

    if (user.accountType !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin only" },
        { status: 403 },
      );
    }

    const { productId, image } = await req.json();

    if (!productId || !image) {
      return NextResponse.json(
        { error: "productId and image data are required" },
        { status: 400 },
      );
    }

    let finalImage = image;

    if (image.preview.startsWith("data:image/")) {
      const base64Data = image.preview.replace(/^data:image\/\w+;base64,/, "");
      const inputBuffer = Buffer.from(base64Data, "base64");
      const webpBuffer = await sharp(inputBuffer)
        .webp({ quality: 90 })
        .toBuffer();

      // Upload to Cloudinary
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "products", format: "webp", resource_type: "image" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        );
        stream.end(webpBuffer);
      });

      finalImage = {
        preview: uploadResult.secure_url,
        gradientColors: ["#ffffff", "#ffffff"],
        gradientStyle: "linear-gradient(135deg, #ffffff, #ffffff)",
      };
    }

    // Update DB
    await Product.findByIdAndUpdate(productId, {
      $set: { "images.0": finalImage },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/ai/enhance-product-image",
      method: "PUT",
      req,
    });
  }
}
