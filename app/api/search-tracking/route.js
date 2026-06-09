import connectDB from "@/lib/db";
import SearchQuery from "@/models/SearchQuery";
import { NextResponse } from "next/server";

/**
 * Smart search tracking endpoint.
 *
 * The client sends a "session" of search terms (the progression of debounced values).
 * We use heuristics to determine the "final" intended search term:
 *
 * 1. If the user typed progressively (l → la → lab → labtop), only the LAST term counts
 *    AS LONG AS each step is a prefix/progression of the next.
 * 2. If the user typed "lab", paused (debounce fired), then CLEARED and typed "phone",
 *    we track both "lab" and "phone" as separate searches.
 * 3. Language is detected from the TEXT ITSELF, not the UI page language.
 *    A user on /ar searching "laptop" is stored as English.
 *    A user on /en searching "لابتوب" is stored as Arabic.
 *
 * The client sends:
 * - term: the current debounced search term
 * - previousTerm: the last tracked term from the same session (if any)
 * - source: "header" | "hero" | "filters"
 * - pageLang: "ar" | "en" (UI page language — used only as tiebreaker)
 * - hasResults: whether the search returned any results
 * - isFinal: true when the user navigated to results, clicked a product, etc.
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const {
      term,
      previousTerm,
      source = "unknown",
      pageLang = "ar", // UI page language — used ONLY as a tiebreaker
      hasResults = true,
      isFinal = false,
    } = body;

    // Validate
    if (!term || typeof term !== "string" || term.trim().length < 2) {
      return NextResponse.json({ success: true }); // Silently ignore short terms
    }

    // Detect the REAL language from the actual characters in the search text
    // This means a user on /ar searching "laptop" is stored as English, not Arabic
    const detectedLang = detectLanguage(term, pageLang);

    // normalizedTerm = the DB key: lowercased + Arabic-normalized (ة→ه, ى→ي, diacritics removed)
    // originalTerm   = preserved as typed (what shows in the admin UI)
    const normalizedTerm = normalizeArabic(term.trim().toLowerCase());
    const normalizedPrevious = normalizeArabic(
      previousTerm?.trim()?.toLowerCase() || "",
    );

    // Smart dedup: check if the previous term is a prefix of the current term
    // If so, this is just the user still typing and we should skip tracking the previous
    // The tracking happens for the CURRENT term only when isFinal=true or the term diverges
    const isPrefixProgression = isProgression(
      normalizedPrevious,
      normalizedTerm,
    );

    // If the term hasn't changed from what was already tracked, skip
    if (normalizedPrevious === normalizedTerm && !isFinal) {
      return NextResponse.json({ success: true });
    }

    // Only track if:
    // 1. isFinal is true (user committed to this search), OR
    // 2. The new term is NOT a progression of the previous (meaning user changed direction)
    if (!isFinal && isPrefixProgression) {
      // The user is still typing progressively, don't track yet
      return NextResponse.json({ success: true, tracked: false });
    }

    await connectDB();

    // Single upsert: one doc per term+language, sources tracked inside the doc
    const upsertResult = await SearchQuery.findOneAndUpdate(
      { term: normalizedTerm, language: detectedLang },
      {
        $inc: {
          count: 1,
          [`sources.${source}`]: 1,
        },
        $set: {
          lastSearchedAt: new Date(),
          hasResults,
          originalTerm: term.trim(),
        },
      },
      { upsert: true, new: true },
    );

    const docId = upsertResult._id;
    const originalSpelling = term.trim();

    // Try to increment an existing variant entry for this exact spelling
    const variantUpdated = await SearchQuery.updateOne(
      { _id: docId, "variants.spelling": originalSpelling },
      { $inc: { "variants.$.count": 1 } },
    );
    // If no entry existed yet for this spelling, push a new one
    if (variantUpdated.modifiedCount === 0) {
      await SearchQuery.updateOne(
        { _id: docId },
        { $push: { variants: { spelling: originalSpelling, count: 1 } } },
      );
    }

    // (re-fetch the updated variants array to find the top one)
    const updated = await SearchQuery.findById(docId, "variants").lean();
    if (updated?.variants?.length > 0) {
      const topVariant = updated.variants.reduce((a, b) =>
        b.count > a.count ? b : a,
      );
      await SearchQuery.updateOne(
        { _id: docId },
        { $set: { originalTerm: topVariant.spelling } },
      );
    }

    // ── Daily breakdown ───────────────────────────────────────────────────────
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const dailyUpdated = await SearchQuery.updateOne(
      { _id: docId, "dailySearches.date": today },
      { $inc: { "dailySearches.$.count": 1 } },
    );
    if (dailyUpdated.modifiedCount === 0) {
      await SearchQuery.updateOne(
        { _id: docId },
        { $push: { dailySearches: { date: today, count: 1 } } },
      );
    }

    return NextResponse.json({ success: true, tracked: true });
  } catch (error) {
    console.error("Search tracking error:", error);
    // Don't fail the user's experience for tracking errors
    return NextResponse.json({ success: true });
  }
}

/**
 * Normalize Arabic text for consistent DB key matching.
 *
 * Treats visually/phonetically identical forms as the same word:
 *   كره = كرة     (ه ↔ ة  taa marbuta confusion)
 *   كرسى = كرسي   (ى ↔ ي  alef maqsura vs ya)
 *   طاوله = طاولة  (same as above)
 *   أ / إ / آ → ا  (hamza on alef variants)
 *   ؤ → و          (hamza on waw)
 *   ئ → ي          (hamza on ya)
 *   Remove diacritics (تشكيل): ً ٌ ٍ َ ُ ِ ّ ْ
 *
 * originalTerm is NOT affected — it keeps the user's real spelling for display.
 */
function normalizeArabic(text) {
  if (!text) return text;
  return (
    text
      // Remove Arabic diacritics (tashkeel / harakaat)
      .replace(/[\u064B-\u065F\u0670]/g, "")
      // Normalize alef variants (أ إ آ ٱ) → ا
      .replace(/[\u0622\u0623\u0625\u0671]/g, "\u0627")
      // Normalize ة (taa marbuta) → ه
      .replace(/\u0629/g, "\u0647")
      // Normalize ى (alef maqsura) → ي
      .replace(/\u0649/g, "\u064A")
      // Normalize ؤ (hamza on waw) → و
      .replace(/\u0624/g, "\u0648")
      // Normalize ئ (hamza on ya) → ي
      .replace(/\u0626/g, "\u064A")
  );
}

/**
 * Detect the actual language of a search term from its characters.
 *
 * Strategy: count Arabic vs Latin meaningful characters.
 * The majority wins. Ties fall back to the page language.
 *
 * Examples:
 *   detectLanguage("laptop", "ar")      → "en"  (all Latin)
 *   detectLanguage("لابتوب", "en")      → "ar"  (all Arabic)
 *   detectLanguage("iPhone 15", "ar")   → "en"  (Latin letters dominate)
 *   detectLanguage("123", "ar")         → "ar"  (no letters → fallback to pageLang)
 *   detectLanguage("لابتوب laptop", "ar") → "ar" (Arabic chars > Latin chars)
 */
function detectLanguage(text, pageLang = "ar") {
  if (!text) return pageLang;

  const arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g;
  const latinPattern = /[a-zA-Z]/g;

  const arabicMatches = text.match(arabicPattern) || [];
  const latinMatches = text.match(latinPattern) || [];

  const arabicCount = arabicMatches.length;
  const latinCount = latinMatches.length;

  // No meaningful letters at all (e.g. pure numbers "123") → use page language
  if (arabicCount === 0 && latinCount === 0) return pageLang;

  // Clear majority → use detected language
  if (arabicCount > latinCount) return "ar";
  if (latinCount > arabicCount) return "en";

  // Exact tie → use page language as tiebreaker
  return pageLang;
}

/**
 * Check if termA is a "progression" toward termB.
 * This covers both typing forward (prefix) and minor edits.
 *
 * Examples:
 * - "l" → "la" → "lab" → "labt" → "labto" → "labtop" ✓ (prefix progression)
 * - "لا" → "لابت" → "لابتوب" ✓ (Arabic prefix progression)
 * - "lab" → "phone" ✗ (completely different search)
 * - "lab" → "la" ✓ (backspace, still progressing)
 * - "" → "lab" ✓ (starting fresh)
 */
function isProgression(termA, termB) {
  if (!termA || termA.length === 0) return true; // Empty → anything is a fresh start
  if (!termB || termB.length === 0) return false; // Something → empty means cleared

  // One is a prefix of the other (covers both typing forward and backspace)
  if (termB.startsWith(termA) || termA.startsWith(termB)) return true;

  // Check Levenshtein distance for typo corrections (edits of 1-2 chars)
  if (Math.abs(termA.length - termB.length) <= 2) {
    const distance = levenshteinDistance(termA, termB);
    if (distance <= 2) return true;
  }

  return false;
}

/**
 * Simple Levenshtein distance calculation
 */
function levenshteinDistance(a, b) {
  const matrix = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) =>
      i === 0 ? j : j === 0 ? i : 0,
    ),
  );

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  return matrix[a.length][b.length];
}
