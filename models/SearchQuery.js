import mongoose from "mongoose";

const searchQuerySchema = new mongoose.Schema(
  {
    // Normalized search term (lowercase + Arabic-normalized) — the DB key
    term: {
      type: String,
      required: true,
    },
    // Most-searched spelling variant (updated to top variant automatically)
    originalTerm: {
      type: String,
      required: true,
    },
    // Detected language of the SEARCH TEXT (not the UI page language)
    language: {
      type: String,
      enum: ["ar", "en"],
      default: "ar",
    },
    // Total searches across all sources and spelling variants
    count: {
      type: Number,
      default: 1,
    },
    // Per-source search counts
    sources: {
      hero: { type: Number, default: 0 },
      header: { type: Number, default: 0 },
      filters: { type: Number, default: 0 },
      unknown: { type: Number, default: 0 },
    },

    variants: [
      {
        spelling: { type: String, required: true },
        count: { type: Number, default: 1 },
      },
    ],
    // Whether the search returned results (last known value)
    hasResults: {
      type: Boolean,
      default: true,
    },
    // Last time this term was searched
    lastSearchedAt: {
      type: Date,
      default: Date.now,
    },
    // Daily breakdown for trend chart (last 30 days)
    dailySearches: [
      {
        date: { type: Date },
        count: { type: Number, default: 1 },
      },
    ],
  },
  { timestamps: true },
);

// Unique: one document per term+language combination
searchQuerySchema.index({ term: 1, language: 1 }, { unique: true });
searchQuerySchema.index({ count: -1 });
searchQuerySchema.index({ lastSearchedAt: -1 });

export default mongoose.models.SearchQuery ||
  mongoose.model("SearchQuery", searchQuerySchema);
