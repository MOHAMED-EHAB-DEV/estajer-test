"use client";

import { useEffect, useState } from "react";
import { GoogleTagManager } from "@next/third-parties/google";

export default function InteractionGTM({ gtmId }) {
  const [load, setLoad] = useState(false);

  useEffect(() => {
    let triggered = false;

    const triggerLoad = () => {
      if (triggered) return;
      triggered = true;
      setLoad(true);
      cleanup();
    };

    const options = { once: true, passive: true };

    const events = [
      "scroll",
      "mousemove",
      "touchstart",
      "pointerdown",
      "wheel",
      "keydown",
    ];

    const cleanup = () => {
      events.forEach((event) => {
        window.removeEventListener(event, triggerLoad, options);
      });
    };

    events.forEach((event) => {
      window.addEventListener(event, triggerLoad, options);
    });

    // Fallback: load after 4 seconds even if they do nothing
    const fallback = setTimeout(triggerLoad, 4000);

    return () => {
      clearTimeout(fallback);
      cleanup();
    };
  }, []);

  if (!load) return null;

  return <GoogleTagManager gtmId={gtmId} />;
}
