"use client";
import { useEffect, useState } from "react";
import Header from "./Header";

export default function HeaderContainer({
  logo,
  lang,
  translate,
  partner,
  awareness,
  headerData,
  userId,
  scrollContainerId,
  shopSlug,
}) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const container = scrollContainerId
      ? document.getElementById(scrollContainerId)
      : window;

    if (!container) return;

    const getScrollY = () =>
      scrollContainerId && container !== window
        ? container.scrollTop
        : window.scrollY;

    const checkScrollPosition = () =>
      setIsVisible((prev) => getScrollY() < (prev ? 500 : 420));

    checkScrollPosition();
    container.addEventListener("scroll", checkScrollPosition);
    return () => container.removeEventListener("scroll", checkScrollPosition);
  }, [scrollContainerId]);

  return (
    <Header
      logo={logo}
      lang={lang}
      home={headerData?.alwaysWhite ? false : isVisible}
      isStatic={headerData?.sticky === false}
      showSearch={headerData?.showSearch !== false}
      translate={translate}
      partner={partner}
      awareness={awareness}
      headerData={headerData}
      userId={userId}
      scrollContainerId={scrollContainerId}
      shopSlug={shopSlug}
    />
  );
}
