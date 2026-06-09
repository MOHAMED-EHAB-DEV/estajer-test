"use client";
import { useEffect, useState } from "react";
import Header from "./Header";

export default function HeaderContainer({
  lang,
  translate,
  partner,
  awareness,
}) {
  const [isVisible, setIsVisible] = useState(true);

  const checkScrollPosition = () =>
    setIsVisible((prev) => window.scrollY < (prev ? 500 : 420));

  useEffect(() => {
    checkScrollPosition();
    window.addEventListener("scroll", checkScrollPosition);
    return () => window.removeEventListener("scroll", checkScrollPosition);
  }, []);

  return (
    <Header
      lang={lang}
      home={isVisible}
      translate={translate}
      partner={partner}
      awareness={awareness}
    />
  );
}
