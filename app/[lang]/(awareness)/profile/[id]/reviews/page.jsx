import { getTranslations } from "@/hooks/getTranslations";
import { notFound } from "next/navigation";

import TopSection from "@/components/userProfile/TopSection";
import ReviewsContainer from "@/components/singleProduct/review/ReviewsContainer";
import { Star2 } from "@/components/ui/svgs/icons/Star2Svg";

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

  const userName = user.fullName;
  const userBio = user.bio || "";
  const reviews = await getReviews(user._id);
  const reviewCount = reviews?.total || 0;
  const averageRating = reviews?.averageRatings?.overall || 0;

  return {
    title: `${userName} - ${t("reviews")} (${reviewCount}) | ${t("siteName")}`,
    description:
      userBio ||
      `${t("viewReviewsFor")} ${userName}. ${reviewCount} ${t(
        "customerReviews",
      )} ${
        averageRating > 0
          ? `${t("withAverageRating")} ${averageRating.toFixed(1)} ${t(
              "averageRating",
            )}`
          : ""
      }.`,
    robots: { index: false, follow: true },
    openGraph: {
      title: `${userName} - ${t("reviews")} (${reviewCount})`,
      description: userBio || `${t("viewReviewsFor")} ${userName}`,
      type: "profile",
      url: `${process.env.NEXT_PUBLIC_APP_URL}/${
        lang === "ar" ? "" : "en/"
      }profile/${id}/reviews`,
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
      title: `${userName} - ${t("reviews")} (${reviewCount})`,
      description: userBio || `${t("viewReviewsFor")} ${userName}`,
      images: user.avatar ? [user.avatar] : [],
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_APP_URL}/${
        lang === "ar" ? "" : "en/"
      }profile/${id}/reviews`,
      languages: {
        en: `${process.env.NEXT_PUBLIC_APP_URL}/en/profile/${id}/reviews`,
        ar: `${process.env.NEXT_PUBLIC_APP_URL}/profile/${id}/reviews`,
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

async function getReviews(id) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/reviews/${id}?limit=8&skip=0`,
    );
    const data = await response.json();
    return data.success ? data : [];
  } catch (error) {
    return null;
  }
}

export default async function page({ params, searchParams }) {
  const { lang, id } = await params;
  const queryParams = await searchParams;
  const translate = await getTranslations(lang);
  const t = (text) => translate(`singleProduct.reviews.${text}`);
  const user = await getUser(id, lang);
  if (!user) notFound();

  const reviews = await getReviews(user._id);

  // Generate JSON-LD schema markup for reviews
  const personSchema = {
    "@context": "https://schema.org",
    "@type": user.accountType === "company" ? "Organization" : "Person",
    name: user.fullName,
    description: user.bio || `${"View reviews for"} ${user.fullName}`,
    url: `${process.env.NEXT_PUBLIC_APP_URL}/${
      lang === "ar" ? "" : "en/"
    }profile/${id}/reviews`,
    image: user.avatar,
    address: user.address
      ? {
          "@type": "PostalAddress",
          addressLocality: user.address,
        }
      : undefined,
    aggregateRating:
      reviews?.total > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: reviews.averageRatings?.overall || 0,
            ratingCount: reviews.total || 0,
            reviewCount: reviews.total || 0,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
    review:
      reviews?.data?.map((review) => ({
        "@type": "Review",
        reviewRating: {
          "@type": "Rating",
          ratingValue: review.rating?.overall || 0,
          bestRating: 5,
          worstRating: 1,
        },
        author: {
          "@type": "Person",
          name: review.userName || review.user?.fullName,
        },
        reviewBody: review.comment,
        datePublished: review.createdAt,
      })) || [],
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
        page="reviews"
        translate={translate()}
        branch={queryParams.branch}
      />
      <div className="max-w-screen-2xl mx-auto lg:px-0 px-4 mb-28">
        <div className="mt-4 md:-mt-8 grid grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-4 md:text-lg text-darkNavy font-semibold">
          <div
            className="bg-[rgba(253,220,166,0.12)] border border-[rgba(253,220,166,0.25)] rounded-2xl p-3
           md:px-8 md:py-6 flex flex-col md:flex-row gap-1.5 md:gap-2 justify-between items-center text-center md:text-start"
          >
            <span className="text-[10px] md:text-base font-bold text-gray-600 uppercase tracking-wider md:normal-case">
              {t("quality")}
            </span>
            <div className="flex items-center gap-1.5 md:gap-4">
              <div className="flex items-center gap-1.5 -space-x-1 rtl:space-x-reverse text-[#f28e2b]">
                {new Array(5).fill(0).map((_, idx) => (
                  <Star2
                    key={idx}
                    size={12}
                    className="md:w-5 md:h-5"
                    filled={
                      idx < Math.round(reviews.averageRatings?.quality || 0)
                    }
                  />
                ))}
              </div>
              <span className="text-sm md:text-base font-black text-darkNavy">
                {reviews.averageRatings?.quality?.toFixed(1) || "0.0"}
              </span>
            </div>
          </div>
          <div className="bg-[rgba(253,220,166,0.12)] border border-[rgba(253,220,166,0.25)] rounded-2xl p-3 md:px-8 md:py-6 flex flex-col md:flex-row gap-1.5 md:gap-2 justify-between items-center text-center md:text-start">
            <span className="text-[10px] md:text-base font-bold text-gray-600 uppercase tracking-wider md:normal-case">
              {t("price")}
            </span>
            <div className="flex items-center gap-1.5 md:gap-4">
              <div className="flex items-center gap-1.5 -space-x-1 rtl:space-x-reverse text-[#f28e2b]">
                {new Array(5).fill(0).map((_, idx) => (
                  <Star2
                    key={idx}
                    size={12}
                    className="md:w-5 md:h-5"
                    filled={
                      idx < Math.round(reviews.averageRatings?.price || 0)
                    }
                  />
                ))}
              </div>
              <span className="text-sm md:text-base font-black text-darkNavy">
                {reviews.averageRatings?.price?.toFixed(1) || "0.0"}
              </span>
            </div>
          </div>
          <div className="bg-[rgba(253,220,166,0.12)] border border-[rgba(253,220,166,0.25)] rounded-2xl p-3 md:px-8 md:py-6 flex flex-col md:flex-row gap-1.5 md:gap-2 justify-between items-center text-center md:text-start">
            <span className="text-[10px] md:text-base font-bold text-gray-600 uppercase tracking-wider md:normal-case">
              {t("experience")}
            </span>
            <div className="flex items-center gap-1.5 md:gap-4">
              <div className="flex items-center gap-1.5 -space-x-1 rtl:space-x-reverse text-[#f28e2b]">
                {new Array(5).fill(0).map((_, idx) => (
                  <Star2
                    key={idx}
                    size={12}
                    className="md:w-5 md:h-5"
                    filled={
                      idx < Math.round(reviews.averageRatings?.experience || 0)
                    }
                  />
                ))}
              </div>
              <span className="text-sm md:text-base font-black text-darkNavy">
                {reviews.averageRatings?.experience?.toFixed(1) || "0.0"}
              </span>
            </div>
          </div>
          <div className="bg-[rgba(253,220,166,0.12)] border border-[rgba(253,220,166,0.25)] rounded-2xl p-3 md:px-8 md:py-6 flex flex-col md:flex-row gap-1.5 md:gap-2 justify-between items-center text-center md:text-start">
            <span className="text-[10px] md:text-base font-bold text-gray-600 uppercase tracking-wider md:normal-case">
              {t("communication")}
            </span>
            <div className="flex items-center gap-1.5 md:gap-4">
              <div className="flex items-center gap-1.5 -space-x-1 rtl:space-x-reverse text-[#f28e2b]">
                {new Array(5).fill(0).map((_, idx) => (
                  <Star2
                    key={idx}
                    size={12}
                    className="md:w-5 md:h-5"
                    filled={
                      idx <
                      Math.round(reviews.averageRatings?.communication || 0)
                    }
                  />
                ))}
              </div>
              <span className="text-sm md:text-base font-black text-darkNavy">
                {reviews.averageRatings?.communication?.toFixed(1) || "0.0"}
              </span>
            </div>
          </div>
        </div>
        <ReviewsContainer
          initialReviews={reviews}
          translate={translate()}
          pathName={id}
          lang={lang}
        />
      </div>
    </div>
  );
}
