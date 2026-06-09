"use client";

import { UpArrow } from "./svgs/icons/UpArrowSvg";
import { sendGTMEvent } from "@next/third-parties/google";

export default function ScrollToTop() {
  const scrollToTop = () => {
    try {
      sendGTMEvent({ event: "scroll_to_top", location: "footer" });
    } catch {}
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div onClick={scrollToTop} className="cursor-pointer">
      <UpArrow />
    </div>
  );
}
