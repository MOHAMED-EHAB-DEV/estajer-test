import { getTranslations } from "@/hooks/getTranslations";
import { notFound } from "next/navigation";

import TopSection from "@/components/userProfile/TopSection";
import RequestedProduct from "@/components/shared/RequestedProduct";
import EmptyPlaceholder from "@/components/shared/EmptyPlaceholder";
import { NoItems } from "@/components/ui/svgs/icons/NoItemsSvg";

export async function generateMetadata({ params }) {
  const { lang, id } = await params;
  const translate = await getTranslations(lang);
  const t = (value) => translate(`profile.${value}`);

  const user = await getUser(id, lang);

  if (!user) {
    return {
      title: t("notFound"),
      description: t("userNotFoundDescription"),
    };
  }

  const userName = user.fullName || user.name || "User";
  const userBio = user.bio || "";

  return {
    title: `${userName} - ${t("requestedProducts")} | ${t("siteName")}`,
    description:
      userBio ||
      `${t("viewRequestedProductsBy")} ${userName}. ${t("discoverWantedItems")}`,
    openGraph: {
      title: `${userName} - ${t("requestedProducts")}`,
      description: userBio || `${t("viewRequestedProductsBy")} ${userName}`,
      type: "profile",
      url: `${process.env.NEXT_PUBLIC_APP_URL}/${lang}/profile/${id}/requested-products`,
      images: user.avatar
        ? [
            {
              url: user.avatar,
              width: 400,
              height: 400,
              alt: `${userName} ${t("profilePicture")}`,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary",
      title: `${userName} - ${t("requestedProducts")}`,
      description: userBio || `${t("viewRequestedProductsBy")} ${userName}`,
      images: user.avatar ? [user.avatar] : [],
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_APP_URL}/${lang}/profile/${id}/requested-products`,
      languages: {
        en: `${process.env.NEXT_PUBLIC_APP_URL}/en/profile/${id}/requested-products`,
        ar: `${process.env.NEXT_PUBLIC_APP_URL}/ar/profile/${id}/requested-products`,
      },
    },
  };
}

async function getUser(id, lang) {
  try {
    const params = new URLSearchParams();
    if (lang) params.set("lang", lang);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/users/${id}?${params}`,
    );
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    return null;
  }
}
async function getInitialRequests({ id, lang }) {
  const params = new URLSearchParams({
    userId: id,
    limit: 40,
    lang,
  });

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/requests?${params}`,
    );
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error("Failed to fetch initial requested products:", error);
    return [];
  }
}

export default async function page({ params }) {
  const { lang, id } = await params;
  const translate = await getTranslations(lang);
  const t = (value) => translate(`profile.${value}`);

  const user = await getUser(id, lang);
  if (!user) notFound();

  const initialRequests = await getInitialRequests({ id: user._id, lang });

  // Generate JSON-LD schema markup for requested products
  const personSchema = {
    "@context": "https://schema.org",
    "@type": user.accountType === "company" ? "Organization" : "Person",
    name: user.fullName || user.name,
    description: user.bio || `${t("viewRequestedProductsBy")} ${user.fullName}`,
    url: `${process.env.NEXT_PUBLIC_APP_URL}/${lang}/profile/${id}/requested-products`,
    image: user.avatar,
    address: user.address
      ? {
          "@type": "PostalAddress",
          addressLocality: user.address,
        }
      : undefined,
    seeks: initialRequests.map((request) => ({
      "@type": "Demand",
      name: request.title || request.name,
      description: request.description,
      category: request.category,
      priceRange: request.budget
        ? `${request.budget.min}-${request.budget.max} SAR`
        : undefined,
      availabilityStarts: request.startDate,
      availabilityEnds: request.endDate,
      areaServed: request.location || user.address,
    })),
  };

  return (
    <div className="-mt-[7.5rem]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(personSchema),
        }}
      />
      <TopSection
        lang={lang}
        user={user}
        page="requested-products"
        translate={translate()}
      />
      <div className="max-w-screen-2xl mx-auto px-4 pb-32 text-white relative z-10">
        <div
          className={`${
            initialRequests.length > 0 &&
            "grid md:gap-16 gap-8 grid-cols-1 md:grid-cols-2"
          } mt-16`}
        >
          {initialRequests.length === 0 ? (
            <EmptyPlaceholder
              title={t("noRequests")}
              Icon={NoItems}
              containerClassName="bg-[#EAEEF3] w-full"
              titleClassName="text-[#5B5656]"
              detailsContainerClassName="w-full"
            />
          ) : (
            initialRequests.map((request) => (
              <RequestedProduct
                key={request._id}
                request={request}
                lang={lang}
                buttonsText={translate("ui.button")}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
