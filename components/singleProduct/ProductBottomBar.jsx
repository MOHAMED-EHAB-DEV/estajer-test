"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { useTranslations } from "@/hooks/useTranslations";
import { useDrawerWithHistory } from "@/hooks/useDrawerWithHistory";
import { Home } from "@/components/ui/svgs/icons/HomeSvg";
import { Search } from "@/components/ui/svgs/icons/SearchSvg";
import { Plus } from "@/components/ui/svgs/icons/PlusSvg";
import { Cart } from "@/components/ui/svgs/icons/CartSvg";
import { Menu } from "@/components/ui/svgs/icons/MenuSvg";
import { Chat } from "@/components/ui/svgs/icons/ChatSvg";
import dynamic from "next/dynamic";
import { useState, useMemo, useRef, useEffect } from "react";
import { Currency } from "../ui/svgs/icons/CurrencySvg";
import formatDuration from "@/utils/formatDuration";

const MainChatBox = dynamic(() => import("@/components/chat/MainChatBox"), {
  ssr: false,
});
const NavbarDrawer = dynamic(() => import("@/components/ui/NavbarDrawer"), {
  ssr: false,
});

const CalendarIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

export default function ProductBottomBar({ product, translate, lang }) {
  const langPrefix = lang === "ar" ? "" : "en/";
  const trans = useTranslations(translate);
  const tc = (key) => trans(`chat.${key}`);
  const tn = (key) => trans(`mobileNav.${key}`);
  const t = (key) => trans(`singleProduct.order.${key}`);

  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUser();

  // Chat drawer
  const {
    isOpen: chatOpen,
    onOpen: onChatOpen,
    onOpenChange: onChatOpenChange,
  } = useDrawerWithHistory();

  // Navbar drawer (menu)
  const {
    isOpen: navOpen,
    onOpen: onNavOpen,
    onOpenChange: onNavOpenChange,
  } = useDrawerWithHistory();

  const isOwner = user?._id === product?.owner?._id;

  const handleRentNow = () => {
    window.dispatchEvent(
      new CustomEvent("open-rent-drawer", { detail: { packageIndex: selectedPkgIdx } })
    );
  };

  // Package picker
  const packages =
    product.pricingModel === "packages" ? product.rental?.packages || [] : [];
  const [selectedPkgIdx, setSelectedPkgIdx] = useState(0);
  const [pkgDropOpen, setPkgDropOpen] = useState(false);
  const pkgDropRef = useRef(null);

  useEffect(() => {
    if (!pkgDropOpen) return;
    const handleOutside = (e) => {
      if (pkgDropRef.current && !pkgDropRef.current.contains(e.target)) {
        setPkgDropOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [pkgDropOpen]);

  // Price display
  const { displayPrice, originalPrice, hasDiscount } = useMemo(() => {
    const discountTier = product?.rental?.discountTiers?.find(
      (tier) => tier.minDays === 1,
    );
    const hasDiscount = !!discountTier && product.pricingModel !== "packages";
    const originalPrice =
      product.pricingModel === "packages"
        ? product.rental?.packages?.[selectedPkgIdx]?.price || 0
        : product.rental?.value || 0;
    const displayPrice = hasDiscount
      ? discountTier.discountPrice
      : originalPrice;
    return { displayPrice, originalPrice, hasDiscount };
  }, [product, selectedPkgIdx]);

  const handleChat = () => {
    if (!user) {
      return router.push(
        `/${langPrefix}login?page=${window.location.pathname}&message=unauthorized`,
      );
    }
    onChatOpen();
  };

  const homeHref = lang === "ar" ? "/" : "/en";
  const searchHref = `/${langPrefix}search/products`;
  const cartHref = `/${langPrefix}cart`;

  return (
    <>
      {/* ══ Mobile-only bottom bar ══ */}
      <div className="block md:hidden fixed bottom-0 start-0 end-0 z-50 shadow-2xl shadow-black">
        <div
          className="bg-white/90 backdrop-blur"
          style={{ paddingBottom: "max(0px, env(safe-area-inset-bottom))" }}
        >
          <div className="flex items-stretch gap-0 px-3 pt-3 pb-2.5 border-t border-gray-100 shadow-sm">
            <div className="flex flex-col justify-center pe-3 shrink-0 focus:outline-none">
              <div className="flex items-center gap-1">
                <span className="text-primary font-IBMPlex font-extrabold text-xl leading-none">
                  {displayPrice}
                </span>
                <Currency color="#F48A42" className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                {hasDiscount && (
                  <span className="text-gray-400 line-through font-IBMPlex text-sm">
                    {originalPrice}
                  </span>
                )}
                {product.pricingModel === "packages" && packages.length > 0 ? (
                  <div className="relative" ref={pkgDropRef}>
                    <button
                      type="button"
                      onClick={() => setPkgDropOpen((v) => !v)}
                      className="flex items-center gap-1 text-gray-400 text-sm font-medium focus:outline-none"
                      aria-haspopup="listbox"
                      aria-expanded={pkgDropOpen}
                    >
                      <span>
                        {`${trans("productComponent.per")} ${formatDuration({
                          duration: packages[selectedPkgIdx].duration,
                          unit: packages[selectedPkgIdx].unit,
                          t: (key) =>
                            trans(`productComponent.bookingPackages.${key}`),
                          lang,
                        })}`}
                      </span>
                      {/* chevron */}
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                          transition: "transform 0.2s",
                          transform: pkgDropOpen
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                        }}
                        aria-hidden="true"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>

                    {pkgDropOpen && (
                      <ul
                        role="listbox"
                        className="absolute bottom-full mb-2 start-0 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 min-w-max"
                        style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}
                      >
                        {packages.map((pkg, i) => {
                          const label = `${trans("productComponent.per")} ${formatDuration(
                            {
                              duration: pkg.duration,
                              unit: pkg.unit,
                              t: (key) =>
                                trans(
                                  `productComponent.bookingPackages.${key}`,
                                ),
                              lang,
                            },
                          )}`;
                          const isSelected = i === selectedPkgIdx;
                          return (
                            <li
                              key={i}
                              role="option"
                              aria-selected={isSelected}
                              onClick={() => {
                                setSelectedPkgIdx(i);
                                setPkgDropOpen(false);
                              }}
                              className="flex items-center justify-between gap-4 pe-4 py-2.5 cursor-pointer text-sm transition-colors hover:bg-orange-50"
                              style={{
                                color: isSelected ? "#F48A42" : "#374151",
                                fontWeight: isSelected ? 600 : 400,
                                paddingInlineStart: isSelected
                                  ? "12px"
                                  : "16px",
                                borderInlineStart: isSelected
                                  ? "3px solid #F48A42"
                                  : "3px solid transparent",
                                background: isSelected ? "#fff5ed" : undefined,
                              }}
                            >
                              <span>{label}</span>
                              <span
                                className="font-bold font-IBMPlex"
                                style={{ color: "#F48A42" }}
                              >
                                {pkg.price}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-400 text-sm font-medium">
                    {trans("productComponent.perDay")}
                  </span>
                )}
              </div>
            </div>

            {/* Vertical divider */}
            <div className="w-px bg-gray-200 self-stretch mx-1 shrink-0" />

            {/* CTA group */}
            <div className="flex items-center gap-2 flex-1 ps-3">
              <button
                disabled={isOwner}
                type="button"
                onClick={handleChat}
                aria-label={tc("chatButton")}
                className="flex items-center justify-center w-12 h-12 shrink-0 rounded-2xl border-1 border-gray-200  transition-all active:scale-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
              >
                <Chat
                  className="w-[20px] h-[20px]"
                  fill="#0D092B"
                  aria-hidden="true"
                />
              </button>
              <button
                type="button"
                onClick={handleRentNow}
                aria-label={lang === "ar" ? "استأجر الآن" : "Rent Now"}
                className="flex-1 flex items-center justify-center gap-2 h-12 rounded-2xl font-bold text-white text-[0.95rem] tracking-wide transition-all active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                style={{
                  background:
                    "linear-gradient(130deg, #F48A42 0%, #d96e1c 100%)",
                  boxShadow:
                    "0 4px 20px rgba(244,138,66,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
                }}
              >
                <CalendarIcon />
                <span>{lang === "ar" ? "استأجر الآن" : "Rent Now"}</span>
              </button>
            </div>
          </div>

          {/* ── Row 2: Navigation icons ── */}
          <nav
            aria-label={tn("ariaLabel")}
            className="grid grid-cols-5 items-center justify-items-center px-2 pb-2"
          >
            {/* Home */}
            <Link
              href={`/${langPrefix}`}
              title={tn("homeTitle")}
              aria-label={tn("home")}
              aria-current={pathname === homeHref ? "page" : undefined}
              className="flex flex-col items-center gap-0.5 p-2 rounded-full transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
            >
              <Home
                color={pathname === homeHref ? "#F48A42" : "#0d092b"}
                aria-hidden="true"
              />
            </Link>

            {/* Search */}
            <Link
              href={`/${langPrefix}search/products`}
              title={tn("searchTitle")}
              aria-label={tn("search")}
              aria-current={pathname === searchHref ? "page" : undefined}
              className="flex flex-col items-center gap-0.5 p-2 rounded-full transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
            >
              <Search
                color={pathname === searchHref ? "#F48A42" : "#0d092b"}
                className="min-w-5 h-5"
                aria-hidden="true"
                strokeWidth={6}
              />
            </Link>

            {/* Add product — center circle */}
            <Link
              href={`/${langPrefix}add-product`}
              aria-label={tn("addProduct")}
              className="flex flex-col items-center justify-center h-10 w-10 rounded-full bg-primary !opacity-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <Plus color="#fff" size={18} aria-hidden="true" />
              <span className="sr-only">{tn("addProduct")}</span>
            </Link>

            {/* Cart */}
            <Link
              href={`/${langPrefix}cart`}
              title={tn("cartTitle")}
              aria-label={tn("cart")}
              aria-current={pathname === cartHref ? "page" : undefined}
              className="flex flex-col items-center gap-0.5 p-2 rounded-full transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
            >
              <Cart
                color={pathname === cartHref ? "#F48A42" : "#0d092b"}
                circle={false}
                size={40}
                aria-hidden="true"
              />
            </Link>

            {/* Menu */}
            <button
              type="button"
              onClick={onNavOpen}
              aria-label={tn("menu")}
              aria-expanded={navOpen}
              className="flex flex-col items-center gap-0.5 px-3 py-2 min-w-0 rounded-full transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
            >
              <Menu aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>

      {/* ── Chat box ── */}
      {chatOpen && user && !isOwner && (
        <MainChatBox
          otherUserData={product.owner}
          otherUserId={product.owner._id}
          currentUserId={user._id}
          userFullName={user.fullName}
          onClose={() => onChatOpenChange(false)}
          userAvatar={user.avatar}
          small={true}
          translate={translate}
          initialProduct={product}
        />
      )}

      {/* ── Navbar drawer ── */}
      {navOpen && (
        <NavbarDrawer
          open={navOpen}
          user={user}
          setOpen={onNavOpenChange}
          lang={lang}
          trans={trans}
        />
      )}
    </>
  );
}
