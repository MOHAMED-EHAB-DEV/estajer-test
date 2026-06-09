"use client";

import { useRef, useCallback } from "react";

// How long (ms) to suppress duplicate final events for the same term.
// Prevents Enter-key spam from inflating counts.
const FINAL_COOLDOWN_MS = 30_000; // 30 seconds

// ─── Client-side progression check ────────────────────────────────────────────
// Mirrors the server-side isProgression logic.
// Returns true if newTerm is a continuation of prevTerm (typing forward/backspace/typo fix).
function isClientProgression(prev, next) {
  if (!prev || prev.length === 0) return true; // fresh start — always a "progression"
  if (!next || next.length === 0) return false; // cleared → new session

  // Prefix match: typing forward OR deleting backward
  if (next.startsWith(prev) || prev.startsWith(next)) return true;

  // Minor edit (typo correction, max 2 character changes)
  if (Math.abs(prev.length - next.length) <= 2) {
    return simpleLevenshtein(prev, next) <= 2;
  }

  return false;
}

function simpleLevenshtein(a, b) {
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

// ─── Core send function ────────────────────────────────────────────────────────
async function sendTrackingRequest({ term, previousTerm, source, pageLang, hasResults, isFinal }) {
  try {
    await fetch("/api/search-tracking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true, // survives page navigation (for unmount tracking)
      body: JSON.stringify({ term, previousTerm, source, pageLang, hasResults, isFinal }),
    });
  } catch (_) {
    // Never break user experience
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useSearchTracking({ source = "unknown" }) {
  // The last term CONFIRMED sent to the server (used as previousTerm for next call)
  const lastTrackedRef = useRef("");

  // The last debounced term we have SEEN — tracks the current "typing session"
  // This is updated even when we skip sending (progression suppression)
  const lastDebouncedRef = useRef("");

  // Per-term cooldown for isFinal events (prevents Enter spam)
  const lastFinalTimeRef = useRef({});

  const _trackFinal = useCallback(
    async (term, lang, hasResults) => {
      const normalizedKey = term.toLowerCase();

      // Spam protection: same term can't be finalized more than once per 30s
      const lastTime = lastFinalTimeRef.current[normalizedKey] || 0;
      if (Date.now() - lastTime < FINAL_COOLDOWN_MS) return;
      lastFinalTimeRef.current[normalizedKey] = Date.now();

      await sendTrackingRequest({
        term,
        previousTerm: lastTrackedRef.current,
        source,
        pageLang: lang,
        hasResults,
        isFinal: true,
      });

      lastTrackedRef.current = term;
      lastDebouncedRef.current = term;
    },
    [source],
  );

  /**
   * trackSearch — called by debounce-based search hooks.
   *
   * isFinal: false (default) — user is still typing.
   *   Client-side progression detection prevents sending م, مل, ملع, ملعب separately.
   *   Only sends when the user changes to a completely new direction.
   *
   * isFinal: true — user committed (pressed Enter, clicked a result, page unmounting).
   *   Always sends (subject to 30s cooldown per term).
   */
  const trackSearch = useCallback(
    async ({ term, lang = "ar", hasResults = true, isFinal = false }) => {
      if (!term || term.trim().length < 2) {
        // Clear state on empty
        if (!term || term.trim().length === 0) {
          lastTrackedRef.current = "";
          lastDebouncedRef.current = "";
        }
        return;
      }

      const trimmed = term.trim();

      // ── FINAL event ────────────────────────────────────────────────────────
      if (isFinal) {
        await _trackFinal(trimmed, lang, hasResults);
        return;
      }

      // ── NON-FINAL: client-side progression check ───────────────────────────
      const normalizedNew = trimmed.toLowerCase();
      const normalizedLastDebounced = lastDebouncedRef.current.toLowerCase();

      if (isClientProgression(normalizedLastDebounced, normalizedNew)) {
        // User is still typing progressively (م → مل → ملع → ملعب).
        // Just update the debounced ref — NO server call, NO tracking.
        lastDebouncedRef.current = trimmed;
        return;
      }

      // ── DIRECTION CHANGE ────────────────────────────────────────────────────
      // The user typed a completely different term (e.g., cleared "ملعب" and typed "كرة").
      // The last debounced term from the PREVIOUS session is their committed search.
      const prevSessionTerm = lastDebouncedRef.current;
      if (
        prevSessionTerm &&
        prevSessionTerm.trim().length >= 2 &&
        prevSessionTerm.toLowerCase() !== lastTrackedRef.current.toLowerCase()
      ) {
        // Track the previous session's final term
        await _trackFinal(prevSessionTerm.trim(), lang, true);
      }

      // Start new typing session
      lastDebouncedRef.current = trimmed;
    },
    [source, _trackFinal],
  );

  /**
   * trackFinalSearch — explicitly called when user commits to a search
   * (form submit, clicking a result, etc.)
   */
  const trackFinalSearch = useCallback(
    async ({ term, lang = "ar", hasResults = true }) => {
      if (!term || term.trim().length < 2) return;
      await trackSearch({ term, lang, hasResults, isFinal: true });
    },
    [trackSearch],
  );

  /**
   * trackUnmount — call this in a useEffect cleanup to track the last
   * debounced term when the component unmounts (user navigates away).
   * Uses the current ref value directly so it always gets the latest term.
   */
  const trackUnmount = useCallback(
    (lang = "ar") => {
      const term = lastDebouncedRef.current;
      if (!term || term.trim().length < 2) return;

      const normalizedKey = term.toLowerCase();
      const lastTime = lastFinalTimeRef.current[normalizedKey] || 0;
      if (Date.now() - lastTime < FINAL_COOLDOWN_MS) return;
      lastFinalTimeRef.current[normalizedKey] = Date.now();

      // Fire-and-forget with keepalive so it survives navigation
      sendTrackingRequest({
        term: term.trim(),
        previousTerm: lastTrackedRef.current,
        source,
        pageLang: lang,
        hasResults: true,
        isFinal: true,
      });
    },
    [source],
  );

  const resetTracking = useCallback(() => {
    lastTrackedRef.current = "";
    lastDebouncedRef.current = "";
  }, []);

  return { trackSearch, trackFinalSearch, trackUnmount, resetTracking };
}
