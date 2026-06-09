import { GoogleGenerativeAI } from "@google/generative-ai";
import Product from "@/models/Product";
import connectDB from "@/lib/db";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function to create a delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Internal helper to process a single product object with the AI model.
 */
async function processSingleProduct(product, model) {
  try {
    // CHECK DESCRIPTION LENGTH
    const needsNewDescription = (product.descriptionAr || "").length < 250;

    // DYNAMIC PROMPT BUILDING
    const baseRules = `
You are an expert bilingual (Arabic & English) E-commerce Copywriter, Data Entry, and SEO Specialist for a Peer-to-Peer (P2P) rental marketplace (like Airbnb for items).
Your task is to analyze the provided Arabic product name (nameAr) and original description (descriptionAr).

CRITICAL ANTI-HALLUCINATION & DATA RULES:
1. Ambiguous Products: If the name is generic (e.g., "Camera") and the exact model is NOT in the description, DO NOT guess. Leave 'specs' and 'features' as empty arrays [].
2. Non-Technical Products: If the item has no electronics/mechanics (e.g., "Sofa", "Barrier"), it DOES NOT have 'features'. Set 'features' to [].
3. KNOWN Technical Products: If the product model is clearly stated and famous (e.g., "Sony a7iii", "PlayStation 5"), you MUST use your general knowledge to populate the 'features' array with 2-3 accurate, famous performance features.
4. Use Cases: ALMOST ALL items have use cases. Deduce 2-4 highly relevant events or situations for renting this item.

STRICT SEO RULES:
- seoTitleAr / seoTitleEn: Write the core, attractive name of the product. MAX 50 CHARACTERS. 
- FORBIDDEN WORDS IN TITLES: Do NOT use the words "استأجر", "تأجير", "للإيجار", "إيجار", "Rent", or "Rental" in the seoTitle.
- seoDescriptionAr / seoDescriptionEn: Write a compelling meta description. MAX 135 CHARACTERS. You CAN use the word "Rent" / "استأجر" here.`;

    // Apply copywriting rules ONLY if description is short
    const copywritingRules = needsNewDescription
      ? `
NEW COPYWRITING RULES (Tone, Style & Dynamic Formatting):
1. TONE (Light White Arabic): The Arabic description MUST be written in "Professional Light White Arabic" (لهجة بيضاء خفيفة واحترافية). It should sound modern, welcoming, and premium. Use acceptable words like "عشان", "يخليك", "يناسب".
2. FORBIDDEN SLANG: DO NOT use heavy street slang (e.g., "أخوياك", "خرافي", "يضبطكم", "رهيب").
3. DYNAMIC STRUCTURE & DIVERSITY (CRITICAL): Do NOT use the exact same layout for every product. 
   - IF the original user description lists multiple distinct items, accessories, or a bundle, you MAY use bullet points for clarity.
   - IF the original description is simple or about a single item, DO NOT use bullet points. Write 1 or 2 short, beautiful, flowing paragraphs instead.
   - Vary your opening and closing lines.
4. NO TEXT WALLS: Whether using paragraphs or lists, keep the text breathable. Maximum 2-3 sentences per paragraph.
5. NO DATA LOSS: You MUST include every single factual detail from the original description without hallucinating extra items.`
      : `\nNote: The user already provided a good description. DO NOT generate new descriptionAr or descriptionEn fields. Just extract the SEO, Use Cases, Specs, and Features.`;

    // Define JSON Structure dynamically based on condition
    const jsonStructure = needsNewDescription
      ? `{
  "descriptionAr": "String (Dynamic format: paragraphs or lists based on item)",
  "descriptionEn": "String (Dynamic format: paragraphs or lists based on item)",
  "useCases": [{ "nameAr": "String", "nameEn": "String" }],
  "specs": [{ "keyAr": "String", "keyEn": "String", "valueAr": "String", "valueEn": "String" }],
  "features": [{ "titleAr": "String", "titleEn": "String", "descAr": "String", "descEn": "String" }],
  "seoTitleAr": "String (Min 40 Max 55 chars)",
  "seoTitleEn": "String (Min 40 Max 55 chars)",
  "seoDescriptionAr": "String (Min 140 Max 155 chars)",
  "seoDescriptionEn": "String (Min 140 Max 155 chars)"
}`
      : `{
  "useCases": [{ "nameAr": "String", "nameEn": "String" }],
  "specs": [{ "keyAr": "String", "keyEn": "String", "valueAr": "String", "valueEn": "String" }],
  "features": [{ "titleAr": "String", "titleEn": "String", "descAr": "String", "descEn": "String" }],
  "seoTitleAr": "String (Min 40 Max 55 chars)",
  "seoTitleEn": "String (Min 40 Max 55 chars)",
  "seoDescriptionAr": "String (Min 140 Max 155 chars)",
  "seoDescriptionEn": "String (Min 140 Max 155 chars)"
}`;

    // Construct final prompt for this specific product
    const finalPrompt = `${baseRules}\n${copywritingRules}\n\nOutput EXACTLY this JSON structure. If a section doesn't apply based on the rules, return an empty array []:\n${jsonStructure}`;

    const userInput = `Product Name (nameAr): ${product.nameAr}\nProduct Description (descriptionAr): ${product.descriptionAr}`;

    const result = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: finalPrompt + "\n\n" + userInput }] },
      ],
    });

    const aiResponseText = result.response.text();
    const generatedData = JSON.parse(aiResponseText);

    // Dynamically build the Database Update Object
    const updateObject = {
      seoTitleAr: generatedData.seoTitleAr,
      seoTitleEn: generatedData.seoTitleEn,
      seoDescriptionAr: generatedData.seoDescriptionAr,
      seoDescriptionEn: generatedData.seoDescriptionEn,
    };

    // Only update these fields if they are currently empty/missing
    // This prevents AI from overwriting data manually entered by the owner
    if (!product.useCases || product.useCases.length === 0) {
      updateObject.useCases = generatedData.useCases;
    }
    if (!product.specs || product.specs.length === 0) {
      updateObject.specs = generatedData.specs;
    }
    if (!product.features || product.features.length === 0) {
      updateObject.features = generatedData.features;
    }

    // ONLY append the descriptions to the DB update if we generated them
    if (
      needsNewDescription &&
      generatedData.descriptionAr &&
      generatedData.descriptionEn
    ) {
      updateObject.descriptionAr = generatedData.descriptionAr;
      updateObject.descriptionEn = generatedData.descriptionEn;
    }

    // Save to database
    await Product.findByIdAndUpdate(product._id, updateObject);

    return {
      success: true,
      productId: product._id,
      newDescriptionGenerated: needsNewDescription,
    };
  } catch (error) {
    console.error(`Error processing product ${product._id}:`, error);
    return {
      success: false,
      productId: product._id,
      error: error.message,
    };
  }
}

/**
 * Enriches a single product with AI.
 * @param {string} productId - The ID of the product to enrich.
 */
export async function enrichProduct(productId) {
  try {
    await connectDB();
    const product = await Product.findById(productId).lean();
    if (!product) return { success: false, error: "Product not found" };

    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      generationConfig: { responseMimeType: "application/json" },
    });

    return await processSingleProduct(product, model);
  } catch (error) {
    console.error(`Error enriching product ${productId}:`, error);
    return { success: false, productId, error: error.message };
  }
}

/**
 * Enriches multiple products with AI in batches of 10.
 * @param {string[]} productIds - Array of product IDs to enrich.
 */
export async function enrichProductsBulk(productIds) {
  try {
    await connectDB();

    // Fetch all products at once
    const products = await Product.find({ _id: { $in: productIds } }).lean();

    if (!products || products.length === 0) {
      return { success: false, error: "No products found" };
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      generationConfig: { responseMimeType: "application/json" },
    });

    const allResults = [];
    const batchSize = 10;

    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);

      // Process batch concurrently
      const batchResults = await Promise.all(
        batch.map((product) => processSingleProduct(product, model)),
      );

      allResults.push(...batchResults);

      // Wait 0.2s before next batch
      if (i + batchSize < products.length) await delay(200);
    }

    return {
      success: true,
      processedCount: allResults.length,
      data: allResults,
    };
  } catch (error) {
    console.error("Bulk enrichment error:", error);
    return { success: false, error: error.message };
  }
}
