"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import ImageUploader from "./ImageUploader";
import ChatInput from "../chat/ChatInput";
import CustomModal from "@/components/ui/CustomModal";

export default function AiAssistModal({
  isOpen,
  onClose,
  lang,
  translate,
  categories,
  subCategories,
  onApply,
  user,
  setUser,
}) {
  const trans = useTranslations(translate);
  const t = (k) => trans(`addProductPage.aiAssist.${k}`);

  const [images, setImages] = useState([]); // { preview: base64, name: string }
  const [hints, setHints] = useState("");
  const [history, setHistory] = useState([]); // [{ role: "user" | "assistant", content: string }]
  const [chatInput, setChatInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestion, setSuggestion] = useState(null); // structure: { chatResponse, productData }
  const [error, setError] = useState(null);
  const [applied, setApplied] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");

  // Nafath verification gate state
  const [nafathStep, setNafathStep] = useState(null); // null | "waiting_national_id" | "sending" | "polling" | "verified"
  const [pendingImages, setPendingImages] = useState(null);
  const [pendingHints, setPendingHints] = useState(null);
  const [nafathNationalIdInput, setNafathNationalIdInput] = useState("");
  const [nafathRandom, setNafathRandom] = useState(null);
  const [nafathCardError, setNafathCardError] = useState(null);

  const chatBottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [history, isAnalyzing]);

  // First analysis (uploading images + hints)
  const handleAnalyze = async () => {
    if (images.length === 0) {
      setError(t("errorNoImages"));
      return;
    }

    // ── Nafath gate: require identity verification before using AI ──
    const needsVerification =
      user &&
      !user.nafathVerified &&
      user.accountType !== "admin" &&
      user.accountType !== "company" &&
      !user.skipIbanVerification;

    if (needsVerification) {
      const initialUserMessage = hints || t("initialUserMessage");
      setPendingImages([...images]);
      setPendingHints(initialUserMessage);
      setNafathStep("waiting_national_id");
      setNafathCardError(null);
      setNafathNationalIdInput("");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setSuggestion(null);

    // Initial message to display in chat
    const initialUserMessage = hints || t("initialUserMessage");
    const newHistory = [{ role: "user", content: initialUserMessage }];
    setHistory(newHistory);

    try {
      const res = await fetch("/api/ai/analyze-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: images.map((i) => i.preview),
          hints: initialUserMessage,
          history: [],
          currentSuggestion: null,
          lang,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success)
        throw new Error(json.error || "unknown error");

      setSuggestion(json.data);
      setHistory((prev) => [
        ...prev,
        { role: "assistant", content: json.data.chatResponse },
      ]);

      if (json.data.isApproved) {
        setTimeout(async () => {
          await handleApply(json.data);
          onClose();
        }, 2000);
      }
    } catch (e) {
      setError(`${t("errorAnalysis")} (${e.message})`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Chat reply turn
  const handleSendChat = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!chatInput.trim() || isAnalyzing) return;

    const messageText = chatInput.trim();
    setChatInput("");
    setError(null);

    // ── Nafath flow intercepts ──
    if (nafathStep === "sending" || nafathStep === "polling") return;
    if (nafathStep === "waiting_national_id") {
      await handleNafathIdInput(messageText);
      return;
    }

    const updatedHistory = [...history, { role: "user", content: messageText }];
    setHistory(updatedHistory);
    setIsAnalyzing(true);

    try {
      const res = await fetch("/api/ai/analyze-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: [], // Images already provided in first turn, Gemini uses currentSuggestion context
          hints: messageText,
          history: updatedHistory.slice(0, -1), // Send previous messages
          currentSuggestion: suggestion?.productData || null,
          lang,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success)
        throw new Error(json.error || "unknown error");

      setSuggestion(json.data);
      setHistory((prev) => [
        ...prev,
        { role: "assistant", content: json.data.chatResponse },
      ]);

      if (json.data.isApproved) {
        setTimeout(async () => {
          await handleApply(json.data);
          onClose();
        }, 2000);
      }
    } catch (e) {
      setError(`${t("errorAnalysis")} (${e.message})`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ── Nafath helpers ──────────────────────────────────────────────────────────

  const openNafathApp = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    if (isIOS) {
      const now = Date.now();
      window.location.href = "nafath://home";
      setTimeout(() => {
        if (Date.now() - now < 2500) {
          window.location.href = "https://apps.apple.com/sa/app/nafath-%D9%86%D9%81%D8%A7%D8%B0/id1598909871";
        }
      }, 2000);
    } else if (isAndroid) {
      window.location.href =
        "intent://nafath#Intent;scheme=nic;package=sa.gov.nic.myid;S.browser_fallback_url=https://play.google.com/store/apps/details?id=sa.gov.nic.myid;end";
    }
  };

  const handleNafathIdInput = async (input) => {
    // Accept direct number input from card or extract from free-form chat message
    const match = input.match(/\b\d{10}\b/);
    const nationalId = match ? match[0] : input.replace(/\s/g, "");

    if (!/^\d{10}$/.test(nationalId)) {
      setNafathCardError(t("nafathErrorIdLength"));
      return;
    }

    setNafathCardError(null);
    setNafathStep("sending");
    setIsAnalyzing(true);

    try {
      const res = await fetch("/api/auth/nafath/send-request?client=true", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nationalId }),
      });
      const data = await res.json();

      if (data.success) {
        setNafathRandom(data.random);
        setNafathStep("polling");
        openNafathApp();
        startNafathPolling({
          transId: data.transId,
          random: data.random,
          nationalId,
        });
      } else {
        setNafathStep("waiting_national_id");
        setNafathCardError(data.message || t("nafathErrorGeneral"));
      }
    } catch {
      setNafathStep("waiting_national_id");
      setNafathCardError(t("nafathErrorNetwork"));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startNafathPolling = ({ transId, random, nationalId }) => {
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch("/api/auth/nafath/check-status?client=true", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nationalId, transId, random }),
        });
        const statusData = await res.json();

        if (statusData.status === "COMPLETED") {
          clearInterval(pollInterval);
          setNafathStep("verified");
          setNafathRandom(null);
          if (setUser) setUser((prev) => ({ ...prev, nafathVerified: true }));
          await runPendingAnalysis();
        } else if (
          statusData.status === "REJECTED" ||
          statusData.status === "EXPIRED"
        ) {
          clearInterval(pollInterval);
          setNafathRandom(null);
          setNafathStep("waiting_national_id");
          setNafathNationalIdInput("");
          setNafathCardError(
            statusData.status === "REJECTED"
              ? t("nafathErrorRejected")
              : t("nafathErrorExpired"),
          );
        }
      } catch {
        clearInterval(pollInterval);
        setNafathRandom(null);
        setNafathStep("waiting_national_id");
        setNafathCardError(t("nafathErrorPolling"));
      }
    }, 4000);

    // 3-minute global timeout
    setTimeout(() => {
      clearInterval(pollInterval);
      setNafathStep((prev) => {
        if (prev === "polling") {
          setNafathRandom(null);
          setNafathNationalIdInput("");
          setNafathCardError(t("nafathErrorTimeout"));
          return "waiting_national_id";
        }
        return prev;
      });
    }, 180000);
  };

  const runPendingAnalysis = async () => {
    if (!pendingImages || !pendingHints) return;
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/ai/analyze-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: pendingImages.map((i) => i.preview),
          hints: pendingHints,
          history: [], // Nafath exchange is never sent to AI
          currentSuggestion: null,
          lang,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success)
        throw new Error(json.error || "unknown error");

      setSuggestion(json.data);
      setHistory((prev) => [
        ...prev,
        { role: "assistant", content: json.data.chatResponse },
      ]);
      setPendingImages(null);
      setPendingHints(null);
      setNafathStep(null);

      if (json.data.isApproved) {
        setTimeout(async () => {
          await handleApply(json.data);
          onClose();
        }, 2000);
      }
    } catch (e) {
      setError(`${t("errorAnalysis")} (${e.message})`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ────────────────────────────────────────────────────────────────────────────

  const handleApply = async (directData) => {
    const isEvent =
      directData &&
      (directData.nativeEvent ||
        typeof directData.preventDefault === "function");
    const dataToUse = directData && !isEvent ? directData : suggestion;
    if (!dataToUse || !dataToUse.productData) return;

    let updatedProductData = { ...dataToUse.productData };
    const locText = updatedProductData.locationText;

    if (locText && locText.trim()) {
      setIsAnalyzing(true);
      try {
        const [resAr, resEn] = await Promise.all([
          fetch(
            `/api/geocode/search?address=${encodeURIComponent(locText)}&lang=ar`,
          ),
          fetch(
            `/api/geocode/search?address=${encodeURIComponent(locText)}&lang=en`,
          ),
        ]);
        const [dataAr, dataEn] = await Promise.all([
          resAr.json(),
          resEn.json(),
        ]);

        if (dataAr.status === "OK" && dataAr.results.length > 0) {
          const loc = dataAr.results[0].geometry.location; // { lat, lng }

          const extractComponents = (results) => {
            if (!results || results.length === 0)
              return {
                country: "",
                governorate: "",
                city: "",
                neighborhood: "",
              };
            const addressComponents = results[0].address_components;
            const address = {
              country: "",
              governorate: "",
              city: "",
              neighborhood: "",
            };
            const typeToField = {
              country: "country",
              administrative_area_level_1: "governorate",
              administrative_area_level_2: "city",
              locality: "city",
              sublocality_level_1: "neighborhood",
              neighborhood: "neighborhood",
            };
            addressComponents.forEach((component) => {
              const { types, long_name } = component;
              const matchedType = types.find((type) => typeToField[type]);
              if (matchedType) {
                const field = typeToField[matchedType];
                if (!address[field]) {
                  address[field] = long_name;
                }
              }
            });

            let finalCity = address.city || "";
            if (finalCity) {
              finalCity = finalCity
                .replace(/^(إمارة منطقة|امارة منطقة|منطقة|إمارة|امارة)\s+/, "")
                .replace(/\s+(Province|Region|Governorate)$/i, "")
                .trim();
            }
            address.city = finalCity;

            return address;
          };

          let addrAr = extractComponents(dataAr.results);
          let addrEn = extractComponents(dataEn.results);

          if (!addrAr.city || !addrEn.city) {
            try {
              const [revAr, revEn] = await Promise.all([
                fetch(
                  `/api/geocode/reverse?lat=${loc.lat}&lng=${loc.lng}&lang=ar`,
                ),
                fetch(
                  `/api/geocode/reverse?lat=${loc.lat}&lng=${loc.lng}&lang=en`,
                ),
              ]);
              const [revDataAr, revDataEn] = await Promise.all([
                revAr.json(),
                revEn.json(),
              ]);
              if (revDataAr.status === "OK" && revDataAr.results.length > 0) {
                addrAr = extractComponents(revDataAr.results);
              }
              if (revDataEn.status === "OK" && revDataEn.results.length > 0) {
                addrEn = extractComponents(revDataEn.results);
              }
            } catch (e) {
              console.error(
                "Reverse geocoding fallback failed client-side:",
                e,
              );
            }
          }

          updatedProductData.location = {
            lat: loc.lat,
            lng: loc.lng,
          };
          updatedProductData.addressAr = addrAr;
          updatedProductData.addressEn = addrEn;
        }
      } catch (e) {
        console.error("Geocoding failed client-side:", e);
      } finally {
        setIsAnalyzing(false);
      }
    }

    onApply({ suggestion: updatedProductData, images });
    setApplied(true);
    setTimeout(() => {
      setApplied(false);
      onClose();
    }, 2500);
  };

  const handleReset = () => {
    setImages([]);
    setHints("");
    setHistory([]);
    setChatInput("");
    setSuggestion(null);
    setError(null);
    setApplied(false);
    setActiveTab("chat");
    // Reset nafath flow
    setNafathStep(null);
    setPendingImages(null);
    setPendingHints(null);
    setNafathNationalIdInput("");
    setNafathRandom(null);
    setNafathCardError(null);
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      placement="responsive"
      hideCloseButton={true}
      size={!suggestion && history.length === 0 && !nafathStep ? "2xl" : "4xl"}
      className="!p-0 border border-slate-100 shadow-2xl md:rounded-3xl overflow-hidden text-start flex flex-col md:max-h-[92dvh] h-[80dvh] md:h-auto"
    >
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10 rounded-t-3xl">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <svg
                className="w-5 h-5 group-hover:scale-110 transition-transform"
                viewBox="0 0 24 24"
                fill="#fff"
              >
                <path d="M10 2c0 4.418-3.582 8-8 8 4.418 0 8 3.582 8 8 0-4.418 3.582-8 8-8-4.418 0-8-3.582-8-8z" />
                <path d="M19 8c0 2.209-1.791 4-4 4 2.209 0 4 1.791 4 4 0-2.209 1.791-4 4-4-2.209 0-4-1.791-4-4z" />
              </svg>
            </div>
            <div>
              <h2 className="font-bold text-darkNavy font-IBMPlex text-base leading-tight">
                {t("title")}
              </h2>
              <p className="text-slate-500 text-xs">{t("subtitle")}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content Body */}
        <div className={`flex-1 flex flex-col min-h-0 overflow-y-auto`}>
          {!suggestion && history.length === 0 && !nafathStep ? (
            /* ─── INITIAL MODE: IMAGE UPLOADER ─── */
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 mx-auto w-full">
                <div>
                  <label className="block text-sm font-semibold text-darkNavy mb-2 font-IBMPlex">
                    {t("uploadLabel")}
                  </label>
                  <ImageUploader
                    files={images}
                    setFiles={(newFiles) => {
                      const updated =
                        typeof newFiles === "function"
                          ? newFiles(images)
                          : newFiles;
                      setImages(updated);
                      setSuggestion(null);
                      setApplied(false);
                      setError(null);
                    }}
                    translate={translate}
                    sm={true}
                    layout="vertical"
                    hideTips={true}
                  />
                  <div className="flex gap-2.5 items-start bg-amber-50/70 border border-amber-100/60 rounded-2xl p-4 mt-3">
                    <svg
                      className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-amber-850 text-xs leading-relaxed font-medium font-IBMPlex">
                      {t("imageLimitNote")}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-darkNavy mb-2 font-IBMPlex">
                    {t("hintsLabel")}
                  </label>
                  <textarea
                    value={hints}
                    onChange={(e) => setHints(e.target.value)}
                    placeholder={t("hintsPlaceholder")}
                    rows={3}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none bg-slate-50"
                  />
                </div>

                {error && (
                  <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                    {error}
                  </p>
                )}
              </div>

              {/* Sticky bottom analyze button */}
              <div className="p-4 bg-white border-t border-slate-100 shrink-0 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || images.length === 0}
                  type="button"
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold font-IBMPlex transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <svg
                        className="w-4 h-4 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      {t("analyzing")}
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9.813 15.904L9 21l-1.813-5.096L2.096 15 7.192 13.187 9 8.096l1.813 5.091L15.904 15l-6.091.904z"
                        />
                      </svg>
                      {t("analyzeBtn")}
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* ─── CHAT & EDIT SPLIT MODE ─── */
            <>
              {/* Mobile Tab Switcher */}
              <div className="flex md:hidden border-b border-slate-100 p-2.5 bg-slate-50 gap-2 flex-shrink-0">
                <button
                  onClick={() => setActiveTab("chat")}
                  type="button"
                  className={`flex-1 py-2 text-center text-xs font-bold font-IBMPlex rounded-xl transition-all ${
                    activeTab === "chat"
                      ? "bg-amber-500 text-white shadow-sm"
                      : "bg-white text-slate-600 border border-slate-200"
                  }`}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <svg
                      className="w-4 h-4 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    {t("chatTab")}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("suggestion")}
                  type="button"
                  className={`flex-1 py-2 text-center text-xs font-bold font-IBMPlex rounded-xl transition-all relative ${
                    activeTab === "suggestion"
                      ? "bg-amber-500 text-white shadow-sm"
                      : "bg-white text-slate-600 border border-slate-200"
                  }`}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <svg
                      className="w-4 h-4 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                      />
                    </svg>
                    {t("suggestionTab")}
                  </span>
                </button>
              </div>

              <div className="flex flex-col md:flex-row md:h-[70vh] md:min-h-[500px] flex-1 min-h-0 overflow-hidden">
                {/* LEFT SIDE: Chat Flow */}
                <div
                  className={`flex-1 flex flex-col border-e  md:h-[70vh] md:min-h-[500px]  border-slate-100 bg-slate-50 min-w-0 overflow-hidden ${activeTab === "chat" ? "flex" : "hidden md:flex"}`}
                >
                  <div className="flex-1 p-4 overflow-y-auto space-y-3">
                    {history.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                            msg.role === "user"
                              ? "bg-amber-500 text-white rounded-tr-none  whitespace-pre-line"
                              : "bg-white text-slate-800 border border-slate-100 rounded-tl-none shadow-sm whitespace-pre-line"
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    {isAnalyzing && (
                      <div className="flex justify-end">
                        <style
                          dangerouslySetInnerHTML={{
                            __html: `
                        @keyframes subtleBounce {
                          0%, 100% { transform: translateY(0); }
                          50% { transform: translateY(-3px); }
                        }
                        .subtle-bounce {
                          animation: subtleBounce 1.2s infinite ease-in-out;
                        }
                      `,
                          }}
                        />
                        <div className="bg-white text-slate-400 border border-slate-100 rounded-2xl rounded-tl-none px-4 py-2.5 shadow-sm flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full subtle-bounce" />
                          <span
                            className="w-1.5 h-1.5 bg-slate-400 rounded-full subtle-bounce"
                            style={{ animationDelay: "0.2s" }}
                          />
                          <span
                            className="w-1.5 h-1.5 bg-slate-400 rounded-full subtle-bounce"
                            style={{ animationDelay: "0.4s" }}
                          />
                        </div>
                      </div>
                    )}

                    {/* ── Nafath Prompt Card ── */}
                    {nafathStep === "waiting_national_id" && (
                      <div className="flex justify-end">
                        <div className="w-full max-w-sm bg-white border border-green-100 rounded-2xl rounded-tl-none shadow-sm overflow-hidden">
                          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3 flex items-center gap-3">
                            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                              <svg
                                className="w-5 h-5 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                />
                              </svg>
                            </div>
                            <div>
                              <p className="text-white font-bold text-sm font-IBMPlex">
                                {t("nafathTitle")}
                              </p>
                              <p className="text-green-100 text-xs">
                                {t("nafathSubtitle")}
                              </p>
                            </div>
                          </div>
                          <div className="px-4 py-4 space-y-3">
                            <p className="text-slate-600 text-xs leading-relaxed">
                              {t("nafathDesc")}
                            </p>
                            <div className="space-y-1.5">
                              <label className="block text-xs font-semibold text-slate-700">
                                {t("nafathNationalIdLabel")}
                              </label>
                              <input
                                type="text"
                                inputMode="numeric"
                                maxLength={10}
                                value={nafathNationalIdInput}
                                onChange={(e) => {
                                  setNafathNationalIdInput(
                                    e.target.value
                                      .replace(/\D/g, "")
                                      .slice(0, 10),
                                  );
                                  setNafathCardError(null);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleNafathIdInput(nafathNationalIdInput);
                                  }
                                }}
                                placeholder="0000000000"
                                dir="ltr"
                                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 bg-slate-50 font-mono tracking-widest transition-all"
                              />
                              {nafathCardError && (
                                <p className="text-red-500 text-xs flex items-center gap-1">
                                  <svg
                                    className="w-3.5 h-3.5 flex-shrink-0"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2.5}
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                  {nafathCardError}
                                </p>
                              )}
                            </div>
                            <button
                              type="button"
                              disabled={nafathNationalIdInput.length !== 10}
                              onClick={() =>
                                handleNafathIdInput(nafathNationalIdInput)
                              }
                              className="w-full py-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-xs font-IBMPlex transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                />
                              </svg>
                              {t("nafathVerifyBtn")}
                            </button>
                            <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                              <svg
                                className="w-3 h-3 flex-shrink-0"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                              </svg>
                              {t("nafathPrivacyNote")}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ── Nafath Polling Card ── */}
                    {(nafathStep === "sending" || nafathStep === "polling") && (
                      <div className="flex justify-end">
                        <div className="w-full max-w-sm bg-white border border-green-100 rounded-2xl rounded-tl-none shadow-sm overflow-hidden">
                          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3 flex items-center gap-3">
                            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                              <svg
                                className="w-5 h-5 text-white animate-spin"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                />
                              </svg>
                            </div>
                            <div>
                              <p className="text-white font-bold text-sm font-IBMPlex">
                                {t("nafathWaitingTitle")}
                              </p>
                              <p className="text-green-100 text-xs">
                                {t("nafathWaitingSubtitle")}
                              </p>
                            </div>
                          </div>
                          <div className="px-4 py-4 space-y-4">
                            {nafathRandom && (
                              <div className="text-center">
                                <p className="text-[10px] text-slate-500 mb-2 font-IBMPlex uppercase tracking-wider">
                                  {t("nafathRandomNumLabel")}
                                </p>
                                <div className="inline-flex items-center justify-center bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl px-8 py-3">
                                  <span className="text-3xl font-bold tracking-[0.2em] font-IBMPlex">
                                    {nafathRandom}
                                  </span>
                                </div>
                              </div>
                            )}
                            <ol className="space-y-2">
                              {[
                                t("nafathStep1"),
                                t("nafathStep2").replace(
                                  "{random}",
                                  nafathRandom,
                                ),
                                t("nafathStep3"),
                              ].map((step, i) => (
                                <li
                                  key={i}
                                  className="flex items-start gap-2 text-xs text-slate-600"
                                >
                                  <span className="w-4 h-4 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                                    {i + 1}
                                  </span>
                                  {step}
                                </li>
                              ))}
                            </ol>
                            <button
                              type="button"
                              onClick={openNafathApp}
                              className="w-full py-2 rounded-xl border-2 border-green-200 hover:border-green-400 hover:bg-green-50 text-green-700 font-bold text-xs font-IBMPlex transition-all flex items-center justify-center gap-2"
                            >
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                                />
                              </svg>
                              {t("nafathOpenAppBtn")}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={chatBottomRef} />
                  </div>

                  {/* Chat Input Bar — hidden during nafath flow */}
                  {!nafathStep && (
                    <ChatInput
                      small={true}
                      selectedProductForSend={null}
                      setSelectedProductForSend={() => {}}
                      newMessage={chatInput}
                      setNewMessage={setChatInput}
                      sendMessage={handleSendChat}
                      textareaRef={textareaRef}
                      showProductSearch={false}
                      setShowProductSearch={() => {}}
                      t={trans}
                      isAdminChat={true}
                      placeholder={
                        lang === "ar"
                          ? "اسأل الذكاء الاصطناعي أو أضف معلومات..."
                          : "Ask AI or add info..."
                      }
                    />
                  )}
                </div>

                {/* RIGHT SIDE: Current Suggestion Form Details */}
                <div
                  className={`w-full md:w-[48%] flex flex-col h-full md:h-[70vh] md:min-h-[500px] overflow-hidden ${activeTab === "suggestion" ? "flex" : "hidden md:flex"}`}
                >
                  <div className="flex-1 overflow-y-auto p-5 pb-2 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h3 className="font-bold text-darkNavy font-IBMPlex text-sm">
                        {t("suggestionTitle")}
                      </h3>
                      <button
                        type="button"
                        onClick={handleReset}
                        className="text-xs text-red-500 font-semibold hover:underline"
                      >
                        {t("retryBtn")}
                      </button>
                    </div>

                    {suggestion?.productData && (
                      <div className="space-y-4">
                        {/* Editable fields */}
                        <div className="space-y-3">
                          {[
                            { key: "nameAr", field: "nameAr" },
                            { key: "nameEn", field: "nameEn" },
                            { key: "descAr", field: "descriptionAr" },
                            { key: "descEn", field: "descriptionEn" },
                          ].map(({ key, field }) => (
                            <div key={field}>
                              <label className="block text-xs font-semibold text-slate-600 mb-1">
                                {t(key)}
                              </label>
                              <textarea
                                value={suggestion.productData[field] || ""}
                                onChange={(e) =>
                                  setSuggestion((p) => ({
                                    ...p,
                                    productData: {
                                      ...p.productData,
                                      [field]: e.target.value,
                                    },
                                  }))
                                }
                                rows={field.includes("description") ? 3 : 1}
                                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none bg-slate-50"
                              />
                            </div>
                          ))}

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-slate-600 mb-1">
                                {t("rentalValue")}
                              </label>
                              <input
                                type="number"
                                value={suggestion.productData.rentalValue || ""}
                                onChange={(e) =>
                                  setSuggestion((p) => ({
                                    ...p,
                                    productData: {
                                      ...p.productData,
                                      rentalValue: +e.target.value,
                                    },
                                  }))
                                }
                                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-slate-50"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-600 mb-1">
                                {t("insurance")}
                              </label>
                              <input
                                type="number"
                                value={suggestion.productData.insurance || ""}
                                onChange={(e) =>
                                  setSuggestion((p) => ({
                                    ...p,
                                    productData: {
                                      ...p.productData,
                                      insurance: +e.target.value,
                                    },
                                  }))
                                }
                                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-slate-50"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-slate-600 mb-1">
                                {t("quantity")}
                              </label>
                              <input
                                type="number"
                                min={1}
                                value={suggestion.productData.quantity || 1}
                                onChange={(e) => {
                                  const val = +e.target.value;
                                  setSuggestion((p) => {
                                    const nextMin =
                                      p.productData.minQuantity || 1;
                                    return {
                                      ...p,
                                      productData: {
                                        ...p.productData,
                                        quantity: val,
                                        minQuantity:
                                          nextMin > val ? val : nextMin,
                                      },
                                    };
                                  });
                                }}
                                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-slate-50"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-600 mb-1">
                                {t("minQuantity")}
                              </label>
                              <input
                                type="number"
                                min={1}
                                max={suggestion.productData.quantity || 1}
                                value={suggestion.productData.minQuantity || 1}
                                onChange={(e) => {
                                  const val = +e.target.value;
                                  setSuggestion((p) => {
                                    const maxVal = p.productData.quantity || 1;
                                    return {
                                      ...p,
                                      productData: {
                                        ...p.productData,
                                        minQuantity:
                                          val > maxVal ? maxVal : val,
                                      },
                                    };
                                  });
                                }}
                                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-slate-50"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                              {t("category")}
                            </label>
                            <select
                              value={suggestion.productData.category || ""}
                              onChange={(e) => {
                                const newCat = e.target.value;
                                setSuggestion((p) => ({
                                  ...p,
                                  productData: {
                                    ...p.productData,
                                    category: newCat,
                                    subCategory:
                                      subCategories?.[newCat]?.[0]?.key || "",
                                  },
                                }));
                              }}
                              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-slate-50"
                            >
                              {(categories || []).map((c) => (
                                <option key={c.key} value={c.key}>
                                  {c.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          {subCategories &&
                            subCategories[suggestion.productData.category]
                              ?.length > 0 && (
                              <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">
                                  {t("subCategory")}
                                </label>
                                <select
                                  value={
                                    suggestion.productData.subCategory || ""
                                  }
                                  onChange={(e) =>
                                    setSuggestion((p) => ({
                                      ...p,
                                      productData: {
                                        ...p.productData,
                                        subCategory: e.target.value,
                                      },
                                    }))
                                  }
                                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-slate-50"
                                >
                                  {subCategories[
                                    suggestion.productData.category
                                  ].map((sub) => (
                                    <option key={sub.key} value={sub.key}>
                                      {sub.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}

                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                              {t("locationText")}
                            </label>
                            <input
                              type="text"
                              value={suggestion.productData.locationText || ""}
                              onChange={(e) =>
                                setSuggestion((p) => ({
                                  ...p,
                                  productData: {
                                    ...p.productData,
                                    locationText: e.target.value,
                                  },
                                }))
                              }
                              placeholder={
                                lang === "ar"
                                  ? "مثال: الرياض، الملاز"
                                  : "e.g. Riyadh, Al-Malaz"
                              }
                              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-slate-50"
                            />
                          </div>

                          {/* Delivery suggestion details preview */}
                          {suggestion.productData.delivery && (
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <p className="text-xs font-bold text-slate-700 mb-1">
                                🚚{" "}
                                {lang === "ar"
                                  ? "خيارات التوصيل"
                                  : "Delivery Option"}
                              </p>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="text-slate-500">
                                    {lang === "ar" ? "النوع" : "Type"}:{" "}
                                  </span>
                                  <span className="font-semibold text-slate-700">
                                    {suggestion.productData.delivery.type}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-slate-500">
                                    {lang === "ar" ? "الرسوم" : "Cost"}:{" "}
                                  </span>
                                  <span className="font-semibold text-slate-700">
                                    {suggestion.productData.delivery.cost || 0}{" "}
                                    SAR
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Discount tiers suggestion details preview */}
                          {suggestion.productData.discountTiers &&
                            suggestion.productData.discountTiers.length > 0 && (
                              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <p className="text-xs font-bold text-slate-700 mb-1">
                                  🏷️{" "}
                                  {lang === "ar"
                                    ? "الخصومات المقترحة"
                                    : "Suggested Discounts"}
                                </p>
                                <div className="space-y-1">
                                  {suggestion.productData.discountTiers.map(
                                    (tier, idx) => (
                                      <p
                                        key={idx}
                                        className="text-xs text-slate-700"
                                      >
                                        • {tier.minDays}+{" "}
                                        {lang === "ar" ? "أيام" : "days"}:{" "}
                                        <span className="font-bold text-orange-600">
                                          {tier.discount}%
                                        </span>
                                      </p>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}

                          {/* Additional services suggestion details preview */}
                          {suggestion.productData.services &&
                            suggestion.productData.services.length > 0 && (
                              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <p className="text-xs font-bold text-slate-700 mb-1">
                                  🔧{" "}
                                  {lang === "ar"
                                    ? "الخدمات الإضافية"
                                    : "Additional Services"}
                                </p>
                                <div className="space-y-1">
                                  {suggestion.productData.services.map(
                                    (service, idx) => (
                                      <p
                                        key={idx}
                                        className="text-xs text-slate-700"
                                      >
                                        •{" "}
                                        {lang === "ar"
                                          ? service.nameAr
                                          : service.nameEn}
                                        :{" "}
                                        <span className="font-bold text-slate-700">
                                          {service.price} SAR
                                        </span>{" "}
                                        (
                                        {service.pricingType === "perDay"
                                          ? lang === "ar"
                                            ? "يومي"
                                            : "daily"
                                          : lang === "ar"
                                            ? "ثابت"
                                            : "fixed"}
                                        )
                                      </p>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Fixed footer for errors, applied status, and applyBtn */}
                  <div className="p-5 border-t border-slate-100 bg-white flex-shrink-0">
                    {error && (
                      <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-3">
                        {error}
                      </p>
                    )}

                    {applied && (
                      <p className="text-emerald-600 text-sm bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-2 mb-3">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {t("applied")}
                      </p>
                    )}

                    <button
                      onClick={() => handleApply()}
                      disabled={!suggestion?.productData}
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold font-IBMPlex transition-all disabled:opacity-50"
                    >
                      {t("applyBtn")}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
    </CustomModal>
  );
}
