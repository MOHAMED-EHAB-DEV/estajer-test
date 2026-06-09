import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import connectDB from "@/lib/db";
import Category from "@/models/Category";
import { authenticateUser } from "@/middleware/auth";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Reverse geocoding helper using Google Maps API
async function getAddressFromCoords(lat, lng) {
  try {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const [resAr, resEn] = await Promise.all([
      fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&language=ar&key=${key}`,
      ),
      fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&language=en&key=${key}`,
      ),
    ]);
    const [dataAr, dataEn] = await Promise.all([resAr.json(), resEn.json()]);

    const extractComponents = (results) => {
      if (!results || results.length === 0)
        return { country: "", governorate: "", city: "", neighborhood: "" };
      const addressComponents = results[0].address_components;
      const address = {
        country: "",
        governorate: "",
        city: "",
        neighborhood: "",
      };
      addressComponents.forEach((component) => {
        const { types, long_name } = component;
        const typeToField = {
          country: "country",
          administrative_area_level_1: "governorate",
          administrative_area_level_2: "city",
          sublocality_level_1: "neighborhood",
          neighborhood: "neighborhood",
        };
        const field = typeToField[types[0]];
        if (field) address[field] = long_name;
      });
      return address;
    };

    return {
      addressAr: extractComponents(dataAr.results),
      addressEn: extractComponents(dataEn.results),
      coordinates: [lng, lat],
    };
  } catch (e) {
    console.error("[Geocoding] Reverse geocoding failed:", e);
    return null;
  }
}

// Geocoding helper to resolve text address to lat/lng and components
async function getCoordsFromAddress(addressString) {
  try {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const [resAr, resEn] = await Promise.all([
      fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addressString)}&language=ar&key=${key}`,
      ),
      fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addressString)}&language=en&key=${key}`,
      ),
    ]);
    const [dataAr, dataEn] = await Promise.all([resAr.json(), resEn.json()]);

    if (dataAr.status === "OK" && dataAr.results.length > 0) {
      const location = dataAr.results[0].geometry.location; // { lat, lng }

      const extractComponents = (results) => {
        if (!results || results.length === 0)
          return { country: "", governorate: "", city: "", neighborhood: "" };
        const addressComponents = results[0].address_components;
        const address = {
          country: "",
          governorate: "",
          city: "",
          neighborhood: "",
        };
        addressComponents.forEach((component) => {
          const { types, long_name } = component;
          const typeToField = {
            country: "country",
            administrative_area_level_1: "governorate",
            administrative_area_level_2: "city",
            sublocality_level_1: "neighborhood",
            neighborhood: "neighborhood",
          };
          const field = typeToField[types[0]];
          if (field) address[field] = long_name;
        });
        return address;
      };

      return {
        addressAr: extractComponents(dataAr.results),
        addressEn: extractComponents(dataEn.results),
        coordinates: [location.lng, location.lat],
      };
    }
  } catch (e) {
    console.error("[Geocoding] Geocoding failed:", e);
  }
  return null;
}

export async function POST(req) {
  try {
    const {
      images,
      hints,
      history = [],
      currentSuggestion = null,
      lang,
    } = await req.json();

    // Connect to database and load real categories and subcategories keys if it's the first message
    await connectDB();
    let categoryMapping = [];
    if (history.length === 0) {
      const dbCategories = await Category.find({
        parentCategory: null,
        status: "active",
      })
        .populate({
          path: "subcategories",
          select: "key",
          match: { status: "active" },
        })
        .select("key")
        .lean();

      categoryMapping = dbCategories.map((cat) => ({
        categoryKey: cat.key,
        subcategoryKeys: cat.subcategories?.map((sub) => sub.key) || [],
      }));
    }

    // Fetch user details to get default location if available
    let defaultLocation = null;
    try {
      const user = await authenticateUser();
      if (user && user.location && user.location.lat && user.location.lng) {
        const resolved = await getAddressFromCoords(
          user.location.lat,
          user.location.lng,
        );
        if (resolved) {
          defaultLocation = resolved;
          defaultLocation.locationText =
            `${resolved.addressEn.neighborhood || ""}, ${resolved.addressEn.city || ""}`.replace(
              /^,\s*/,
              "",
            );
        }
      }
    } catch (e) {
      // Not authenticated or no profile location, ignore
    }

    let categoryInstructionText = "";
    if (history.length === 0) {
      categoryInstructionText = `3. Category & Subcategory:
   - You MUST choose from the provided category mapping list keys:
   ${JSON.stringify(categoryMapping, null, 2)}`;
    } else {
      categoryInstructionText = `3. Category & Subcategory:
   - If the user asks to change the category or subcategory, politely instruct them to change it themselves using the dropdown select boxes in the edit/preview panel on the right side of the screen. Keep the category/subCategory fields in the JSON matching the previous values.`;
    }

    let systemInstruction = `You are a conversational product listing assistant for Estajer, a peer-to-peer rental marketplace in Saudi Arabia.
Your goal is to chat with the user, collect/confirm product listing information (including product location), and build/update a structured product metadata JSON object.

Strict Listing & Default Rules:
0. Latency Optimization:
   - On the first turn (when images are uploaded), you MUST generate all listing details (nameAr, nameEn, descriptionAr, descriptionEn, category, subCategory, rentalValue, insurance, and locationText).
   - On subsequent turns, to minimize response latency, you MUST NOT include any unchanged fields in the JSON object at all. Completely omit their keys from the 'productData' object. Only output fields that are being explicitly modified or added in the current turn. The backend will automatically merge and preserve the previous values.
1. Names & Descriptions:
   - Must write names and descriptions in BOTH Arabic and English.
   - The descriptionAr and descriptionEn fields MUST be at least 250 characters long.
   - You MUST use clear spacing and line breaks: separate paragraphs using double newlines (written as \\n\\n inside the JSON string value), or use bullet points separated by newlines (written as \\n).
   - DO NOT return a single solid block of text. Break the text into 2-3 readable paragraphs.
   - Write descriptionAr in professional "Light White Arabic" (لهجة بيضاء خفيفة واحترافية) - welcoming, modern, avoiding heavy street slang.
2. Pricing & Insurance:
   - Suggest a realistic rental price per day in SAR based on the product type, brand, and condition.
   - Insurance Value (insurance): MUST default to 0. Only suggest a non-zero insurance deposit if the item is a known high-value asset (e.g. camera, drone, heavy equipment) or if the user explicitly requests/consents to it.
${categoryInstructionText}
4. Product Location (locationText):
   - You MUST ask the user for the product's location (city and neighborhood in Saudi Arabia, e.g. "Riyadh, Al-Malaz").
   - If a default location is provided below, ask the user if this is the correct location of the product to confirm it.
   - Fill "locationText" with the verified location string (e.g., "Jeddah, Al-Hamra"). Do NOT try to guess or fill "location" lat/lng coordinates or addressAr/addressEn components yourself. They will be geocoded automatically on the backend.
5. Delivery Options:
   - Default setting: MUST default to "type": "receive" (which means pickup/receive by user) with cost: 0.
   - Do NOT guess expensive or random delivery costs.
   - Do NOT ask the user if they want "Delivery as an additional service". Delivery is handled by the dedicated delivery section.
   - Ask the user: "How would you like to handle delivery? Pickup (receive), Free delivery, or Delivery to specific cities or per-km?"
   - If the user specifies cities, add them to "fixedCityPricing". If they want delivery per-km, set type to "delivery" and pricingModel to "perKm".
6. Discount Tiers (discountTiers):
   - You MUST default to an empty array [] on the first turn.
   - Inform the user in your message that they can set multiple discount levels for different periods (e.g. a basic general discount, and/or higher discounts for longer rental periods like 3+ days, 7+ days).
   - If the user agrees to add a discount but does not specify a duration (e.g., "add 10%" or "you can add a discount"), you MUST default "minDays" to 1 so the discount applies to any rental period (from the first day).
   - If they specify multiple durations (e.g. 10% for 1 day, 20% for 3 days), add both tiers to "discountTiers".
   - Do NOT add any discount tiers unless you ask the user first in the chat and they explicitly agree/request it.
   - Format: array of { "minDays": number, "discount": number, "discountType": "percentage" }.
7. Additional Services (services):
   - You MUST default to an empty array [] on the first turn.
   - There are two pricing types for services:
     * "pricingType": "perDay" (variable daily pricing) for optional equipment/accessories that scale with rental days (e.g., extra PlayStation controllers, additional lenses/tripods for a camera).
     * "pricingType": "fixed" (fixed one-off price) for services/actions that don't scale with rental duration (e.g., a one-time cleaning fee, decoration fee).
   - Inform the user of these two options when prompting them about adding services.
   - STRICT RULE: Do NOT suggest any delivery, transport, shipping, setup, or "delivery and setup" services here. Delivery has its own section, and setup is part of it.
   - Only suggest relevant, strictly optional equipment/addons. If the item has no logical optional accessories (like a basic hotel chair), do NOT suggest any additional services at all. Keep it empty.
   - Do NOT add services unless you ask the user first in the chat and they explicitly agree.
   - Format: array of { "nameAr": "string", "nameEn": "string", "price": number, "quantity": number, "pricingType": "perDay" | "fixed" }.
8. Approval Detection (isApproved):
    - Set "isApproved" to true in the JSON response ONLY when the user explicitly agrees to approve, confirm, apply, publish, or save the listing (e.g. saying "اعتمد", "تمام انشر", "طبق", "موافق", "save", "confirm", "approve").
    - When "isApproved" is true, write a friendly "chatResponse" informing the user that you are applying the details to the form and closing the modal automatically.
    - On all other turns before approval, you MUST completely omit the "isApproved" key from the JSON structure (do not include it at all).
9. Available Quantity & Minimum Rent Quantity (quantity, minQuantity):
    - By default, do NOT ask the user about the available quantity ("quantity") or minimum rent quantity ("minQuantity"), and do NOT suggest changing them from their default values (which are both 1).
    - If and ONLY IF the user explicitly requests to change either the available quantity or the minimum rental quantity, update "quantity" and/or "minQuantity" in "productData" to match the requested values.
    - Ensure logical consistency: Available quantity ("quantity") MUST always be greater than or equal to the minimum rental quantity ("minQuantity"). If the user specifies values that violate this rule, politely explain and guide them.

Conversational Flow & Sequential Questions (CRITICAL):
- Avoid overwhelming the user by asking too many questions at once. Ask at most 2 or 4 related questions per turn.
- Group questions in logical sequential stages:
  * Stage 1 (Initial turn): Welcome the user, identify the product name/type, suggest a daily price, and confirm or ask for the product location (e.g., confirm default profile location or ask for city/neighborhood). Do not ask about delivery or discounts yet.
  * Stage 2 (Location set): Once location is confirmed, ask about delivery options (pickup, free, or fixed rates for specific cities).
  * Stage 3 (Delivery set): Ask about duration discounts (informing them they can add a general discount starting from 1 day, and/or larger discounts for longer periods) and optional accessories/add-on services (not delivery/setup).
- Maintain an interactive, helpful dialogue. Keep updating the JSON data on every turn while the conversation advances.
- CRITICAL: Do NOT repeat, restate, or list all previously confirmed details (such as listing all delivery cities, prices, or discounts again and again) in your messages once they have been acknowledged. Keep the conversation moving forward.
- Keep responses concise, helpful, and polite.

You MUST return EXACTLY this JSON structure:
{
  "chatResponse": "your friendly reply to the user in the language they are typing (or fallback to Arabic), acknowledging their input and asking the next question. Do NOT repeat already confirmed listing details.",
  "isApproved": boolean (optional, include only when true),
  "productData": {
    "nameAr": "string",
    "nameEn": "string",
    "descriptionAr": "string",
    "descriptionEn": "string",
    "category": "string",
    "subCategory": "string",
    "rentalValue": number,
    "insurance": number,
    "locationText": "string (e.g. Riyadh, Al-Malaz)",
    "quantity": number (optional, only include if explicitly requested to change by the user),
    "minQuantity": number (optional, only include if explicitly requested to change by the user),
    "delivery": {
      "type": "receive" | "delivery" | "free",
      "pricingModel": "free" | "perKm" | "fixedCity",
      "cost": number,
      "fixedCityPricing": [
        {
          "cityAr": "string",
          "cityEn": "string",
          "governorateAr": "string",
          "governorateEn": "string",
          "displayName": "string",
          "isGovernorate": boolean,
          "price": number
        }
      ]
    },
    "discountTiers": [
      { "minDays": number, "discount": number, "discountType": "percentage" }
    ],
    "services": [
      { "nameAr": "string", "nameEn": "string", "price": number, "quantity": number, "pricingType": "perDay" | "fixed" }
    ]
  }
}`;

    // Inject user's default location if found on their profile
    if (history.length === 0 && defaultLocation) {
      systemInstruction += `\n\nNote: The user is currently logged in, and their registered location is: "${defaultLocation.locationText}". Pre-fill productData.locationText with this value and ask the user to confirm if it is correct.`;
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      systemInstruction,
      generationConfig: { responseMimeType: "application/json" },
    });

    const contents = [];

    // Reconstruct the message history in correct Gemini format
    for (const msg of history) {
      contents.push({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      });
    }

    // Prepare the latest user message parts
    const latestUserParts = [];
    if (hints) {
      latestUserParts.push({ text: hints });
    }

    if (images && images.length > 0) {
      // Limit to first 3 images max as per user instructions
      const imagesToAnalyze = images.slice(0, 3);
      for (const img of imagesToAnalyze) {
        const matches = img.match(/^data:(.+);base64,(.+)$/);
        if (matches) {
          latestUserParts.push({
            inlineData: {
              mimeType: matches[1],
              data: matches[2],
            },
          });
        }
      }
    }

    // If there is already a product suggestion state, inject it in the model context
    if (currentSuggestion) {
      latestUserParts.push({
        text: `\n\n[Current state of product listing data for reference/updating: ${JSON.stringify(currentSuggestion)}]`,
      });
    }

    // If no text or image was supplied in this turn, provide a fallback request
    if (latestUserParts.length === 0) {
      latestUserParts.push({ text: "Hello! Let's build a product listing." });
    }

    contents.push({
      role: "user",
      parts: latestUserParts,
    });
    const result = await model.generateContent({ contents });
    const text = result.response.text();
    let data = JSON.parse(text);

    // Merge new suggestion data with currentSuggestion to preserve fields omitted on subsequent turns
    if (currentSuggestion && data.productData) {
      data.productData = {
        ...currentSuggestion,
        ...Object.fromEntries(
          Object.entries(data.productData).filter(
            ([_, v]) => v !== null && v !== undefined,
          ),
        ),
      };
    }

    // If default location was pre-filled and not modified, ensure it has coordinates resolved
    if (
      data.productData &&
      defaultLocation &&
      (!data.productData.locationText ||
        data.productData.locationText === defaultLocation.locationText)
    ) {
      data.productData.location = {
        lng: defaultLocation.coordinates[0],
        lat: defaultLocation.coordinates[1],
      };
      data.productData.addressAr = defaultLocation.addressAr;
      data.productData.addressEn = defaultLocation.addressEn;
      data.productData.locationText = defaultLocation.locationText;
    }

    // Geocode or update coordinates if locationText changed/set
    if (data.productData && data.productData.locationText) {
      const prevLocText = currentSuggestion?.locationText || "";
      if (
        data.productData.locationText !== prevLocText ||
        !data.productData.location
      ) {
        const resolved = await getCoordsFromAddress(
          data.productData.locationText,
        );
        if (resolved) {
          data.productData.location = {
            lng: resolved.coordinates[0],
            lat: resolved.coordinates[1],
          };
          data.productData.addressAr = resolved.addressAr;
          data.productData.addressEn = resolved.addressEn;
        }
      } else if (currentSuggestion) {
        // Carry forward previous geocoded fields if locationText matches
        data.productData.location = currentSuggestion.location;
        data.productData.addressAr = currentSuggestion.addressAr;
        data.productData.addressEn = currentSuggestion.addressEn;
      }
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[AI analyze-product]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
