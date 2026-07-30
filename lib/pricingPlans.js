/**
 * Single source of truth for pricing plans config, financial calculations, and translations helper.
 */

export const TAX_RATE = 0.15; // 15% VAT

export const PRICING_PLANS_CONFIG = {
  starter: {
    id: "starter",
    basePrice: 999,
    oldPriceAr: "1600 ر.س",
    oldPriceEn: "1,600 SAR",
    discountRate: "38%",
    commission: 10,
    checkoutPath: "/premium-checkout?plan=starter",
    isPopular: false,
  },
  growth: {
    id: "growth",
    basePrice: 2399,
    upgradeBasePrice: 1400,
    oldPriceAr: "4500 ر.س",
    oldPriceEn: "4,500 SAR",
    discountRate: "47%",
    commission: 5,
    checkoutPath: "/premium-checkout?plan=growth",
    isPopular: true,
  },
  enterprise: {
    id: "enterprise",
    basePrice: null,
    commission: 0,
    checkoutPath: "/contact",
    isPopular: false,
  },
};

/**
 * Calculates pricing breakdown (base, tax, total) for a given plan and upgrade status.
 */
export function calculatePlanPrice({ planId = "starter", user = null, isUpgrade = false }) {
  const effectiveUpgrade = isUpgrade || user?.shopPlan === "starter";
  const config = PRICING_PLANS_CONFIG[planId] || PRICING_PLANS_CONFIG.starter;

  if (!config.basePrice) {
    return { priceBase: 0, priceTax: 0, priceTotal: 0, commission: 0 };
  }

  const priceBase =
    planId === "growth" && effectiveUpgrade
      ? config.upgradeBasePrice
      : config.basePrice;
  const priceTax = Math.round(priceBase * TAX_RATE);
  const priceTotal = priceBase + priceTax;

  return {
    priceBase,
    priceTax,
    priceTotal,
    commission: config.commission,
  };
}

/**
 * Resolves localized plan details by passing a translation function (trans or t).
 * Supports trans function from useTranslations() or direct t key lookups.
 *
 * @param {Function} trans - translation function
 * @param {Object} options - { lang, user, isUpgrade }
 */
export function getPricingPlans(trans, { lang = "ar", user = null, isUpgrade = false } = {}) {
  const t = typeof trans === "function" ? trans : (k) => k;

  const getTransVal = (key) => {
    try {
      const val = t(key);
      return val !== key ? val : undefined;
    } catch {
      return undefined;
    }
  };

  const starterConfig = PRICING_PLANS_CONFIG.starter;
  const growthConfig = PRICING_PLANS_CONFIG.growth;
  const enterpriseConfig = PRICING_PLANS_CONFIG.enterprise;

  const starterPricing = calculatePlanPrice({ planId: "starter", user, isUpgrade });
  const growthPricing = calculatePlanPrice({ planId: "growth", user, isUpgrade });

  // Translation lookups
  const starterTrans = getTransVal("marketing.pricingPlans.starterPlan") || {};
  const growthTrans = getTransVal("marketing.pricingPlans.premiumPlan") || {};
  const enterpriseTrans = getTransVal("marketing.pricingPlans.enterprisePlan") || {};

  const starterCheckoutTrans = getTransVal("shopCheckout.plans.starter") || {};
  const growthCheckoutTrans = getTransVal("shopCheckout.plans.growth") || {};

  const langPrefix = lang === "ar" ? "" : "en/";

  return {
    starter: {
      ...starterConfig,
      ...starterPricing,
      id: "starter",
      name: starterTrans.name || starterCheckoutTrans.name || (lang === "ar" ? "باقة البداية" : "Starter Plan"),
      badge: starterCheckoutTrans.badge || (lang === "ar" ? "الأفضل للمبتدئين" : "Best for starters"),
      currentLabel: starterTrans.currentLabel || (lang === "ar" ? "باقة البداية" : "Starter Plan"),
      desc: starterTrans.desc || starterCheckoutTrans.desc || "",
      price: "999",
      currency: starterTrans.currency || (lang === "ar" ? "ر.س سنوياً" : "SAR annually"),
      priceSub: starterTrans.priceSub || (lang === "ar" ? "غير شاملة ضريبة القيمة المضافة" : "Tax not included"),
      discountNote: starterTrans.discountNote || (lang === "ar" ? "خصم لفترة محدودة" : "Limited-time discount"),
      discountRate: starterConfig.discountRate,
      discountSuffix: starterTrans.discountSuffix || (lang === "ar" ? "بدلاً من" : "instead of"),
      discountOld: lang === "ar" ? starterConfig.oldPriceAr : starterConfig.oldPriceEn,
      currentBtn: starterTrans.currentBtn || (lang === "ar" ? "اشترك الآن" : "Subscribe Now"),
      featuresLabel: starterTrans.featuresLabel || (lang === "ar" ? "المميزات المتاحة" : "What you get"),
      features: Array.isArray(starterTrans.features) && starterTrans.features.length > 0
        ? starterTrans.features
        : (Array.isArray(starterCheckoutTrans.features) ? starterCheckoutTrans.features : []),
      checkoutFeatures: Array.isArray(starterCheckoutTrans.features) ? starterCheckoutTrans.features : [],
      lockedFeatures: Array.isArray(starterCheckoutTrans.lockedFeatures) ? starterCheckoutTrans.lockedFeatures : [],
      href: `/${langPrefix}premium-checkout?plan=starter`,
    },
    growth: {
      ...growthConfig,
      ...growthPricing,
      id: "growth",
      name: growthTrans.name || growthCheckoutTrans.name || (lang === "ar" ? "باقة النمو" : "Growth Plan"),
      badge: growthTrans.badge || growthCheckoutTrans.badge || (lang === "ar" ? "الأكثر طلباً ⭐" : "Most Popular ⭐"),
      tierLabel: growthTrans.tierLabel || (lang === "ar" ? "الباقة الاحترافية" : "Premium Plan"),
      desc: growthTrans.desc || growthCheckoutTrans.desc || "",
      price: "2399",
      priceSuffix: growthTrans.priceSuffix || (lang === "ar" ? "ر.س سنوياً" : "SAR annually"),
      priceSub: growthTrans.priceSub || starterTrans.priceSub || (lang === "ar" ? "غير شاملة ضريبة القيمة المضافة" : "Tax not included"),
      discountNote: growthTrans.discountNote || (lang === "ar" ? "خصم لفترة محدودة" : "Limited-time discount"),
      discountRate: growthConfig.discountRate,
      discountSuffix: growthTrans.discountSuffix || (lang === "ar" ? "بدلاً من" : "instead of"),
      discountOld: lang === "ar" ? growthConfig.oldPriceAr : growthConfig.oldPriceEn,
      subscribeBtn: growthTrans.subscribeBtn || (lang === "ar" ? "اشترك الآن" : "Subscribe Now"),
      currentBtn: growthTrans.subscribeBtn || (lang === "ar" ? "اشترك الآن" : "Subscribe Now"),
      everythingPlus: growthTrans.everythingPlus || (lang === "ar" ? "كل مميزات باقة البداية + إضافات حصرية" : "Everything in Starter Plan + Exclusive Additions"),
      featuresLabel: growthTrans.featuresLabel || (lang === "ar" ? "كل مميزات باقة البداية، بالإضافة إلى:" : "Everything in Starter, plus:"),
      features: Array.isArray(growthTrans.features) && growthTrans.features.length > 0
        ? growthTrans.features
        : (Array.isArray(growthCheckoutTrans.features) ? growthCheckoutTrans.features.map(f => ({ text: f })) : []),
      checkoutFeatures: Array.isArray(growthCheckoutTrans.features) ? growthCheckoutTrans.features : [],
      lockedFeatures: Array.isArray(growthCheckoutTrans.lockedFeatures) ? growthCheckoutTrans.lockedFeatures : [],
      href: `/${langPrefix}premium-checkout?plan=growth`,
    },
    enterprise: {
      ...enterpriseConfig,
      id: "enterprise",
      priceBase: 0,
      priceTax: 0,
      priceTotal: 0,
      name: enterpriseTrans.name || (lang === "ar" ? "الباقة المخصصة" : "Enterprise Plan"),
      badge: enterpriseTrans.badge || (lang === "ar" ? "للشركات والمؤسسات" : "For Large Enterprises"),
      tierLabel: enterpriseTrans.tierLabel || (lang === "ar" ? "باقة الشركات" : "Custom Plan"),
      desc: enterpriseTrans.desc || "",
      price: enterpriseTrans.pricingLabel || (lang === "ar" ? "تواصل معنا" : "Contact Us"),
      pricingLabel: enterpriseTrans.pricingLabel || (lang === "ar" ? "أسعار مرنة" : "Flexible Pricing"),
      pricingSub: enterpriseTrans.pricingSub || (lang === "ar" ? "تبدأ من سعر مخصص بناءً على حجم نشاطك" : "Starting from a custom price based on your business scale"),
      contactBtn: enterpriseTrans.contactBtn || (lang === "ar" ? "تواصل معنا" : "Contact Us"),
      everythingPlus: enterpriseTrans.everythingPlus || (lang === "ar" ? "كل مميزات باقة النمو + مزايا حصرية" : "Everything in Growth + Exclusive Benefits"),
      featuresLabel: enterpriseTrans.featuresLabel || (lang === "ar" ? "كل المميزات، بالإضافة إلى:" : "All features, plus:"),
      features: Array.isArray(enterpriseTrans.features) ? enterpriseTrans.features : [],
      footerNote: enterpriseTrans.footerNote || "",
      href: `/${langPrefix}contact`,
    },
  };
}
