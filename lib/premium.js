import User from "@/models/User";
import Shop from "@/models/Shop";
import { CLASSIC_SECTIONS } from "@/components/shop/themes/registry";

/**
 * Build default shop sections from the Classic theme registry defaults.
 */
function buildDefaultSections() {
  return CLASSIC_SECTIONS.map((s, i) => ({
    instanceId: s.id,
    themeId: "classic",
    sectionType: s.id,
    order: s.id === "header" ? -100 : s.id === "footer" ? 1000 : i,
    data: { ...s.defaults },
  }));
}

/**
 * Generate a URL-safe slug from a user's name.
 */
function slugify(str = "") {
  const base = str
    .toLowerCase()
    .replace(/[\u0600-\u06FF]/g, "") // strip Arabic
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30);
  return base || "shop";
}

/**
 * Find a unique slug by appending a numeric suffix if needed.
 */
async function findUniqueSlug(base) {
  let slug = base;
  let attempt = 0;
  while (await Shop.exists({ slug })) {
    attempt++;
    slug = `${base}-${attempt}`;
  }
  return slug;
}

/**
 * Activates the premium shop plan for a user, either upgrading an existing shop
 * or creating a new shop with default sections.
 */
export async function activatePremiumSubscription(
  userId,
  plan,
  orderType,
  trialMonths,
) {
  const commission = plan === "growth" ? 5 : 10;
  const isUpgrade = orderType === "upgrade";

  // Calculate plan expiration date
  let expiresAt;
  if (trialMonths && typeof trialMonths === "number" && trialMonths > 0) {
    expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + trialMonths);
  } else {
    expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  }

  // Activate user plan
  await User.findByIdAndUpdate(userId, {
    premium: true,
    hasShop: true,
    shopPlan: plan,
    shopPlanExpiresAt: expiresAt,
    ...(plan === "growth" ? { hasBranches: true } : {}),
  });

  const user = await User.findById(userId);

  if (isUpgrade) {
    // Upgrade: just update existing shop plan + commission
    await Shop.findOneAndUpdate(
      { owner: userId },
      { plan, shopCommission: commission },
    );
  } else {
    // New purchase: auto-create shop with all defaults
    const existingShop = await Shop.findOne({ owner: userId });

    if (!existingShop) {
      const baseSlug = slugify(user.fullName);
      const slug = await findUniqueSlug(baseSlug);

      await Shop.create({
        owner: userId,
        nameAr: user.fullName || "متجري",
        nameEn: user.fullName || "My Shop",
        slug,
        logo: user.avatar || "",
        descriptionAr: "",
        descriptionEn: "",
        brandColor: "#f48a42",
        sections: buildDefaultSections(),
        shopCommission: commission,
        plan,
        isActive: true,
      });
    } else {
      // Shop already exists (edge case) — just update the plan
      await Shop.findByIdAndUpdate(existingShop._id, {
        plan,
        shopCommission: commission,
      });
    }
  }

  return { expiresAt };
}
