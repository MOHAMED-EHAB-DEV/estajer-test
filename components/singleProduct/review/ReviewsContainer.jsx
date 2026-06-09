"use client";
import dynamic from "next/dynamic";
import { Fragment, useState, useEffect, memo } from "react";
import SingleReview from "./SingleReview";
import { useTranslations } from "@/hooks/useTranslations";
import Button from "@/components/ui/Button";
import { useUser } from "@/context/UserContext";
import { NoReviews } from "@/components/ui/svgs/icons/NoReviewsSvg";
import EmptyPlaceholder from "@/components/shared/EmptyPlaceholder";

const AddReviewModal = dynamic(
  () => import("./AddReviewModal"),
  { ssr: false },
);

function ReviewsContainer({
  initialReviews,
  translate,
  productId,
  pathName,
  productName,
  lang,
}) {
  const { user } = useUser();

  const trans = useTranslations(translate);
  const t = (value) => trans(`profile.${value}`);

  const [reviews, setReviews] = useState(initialReviews.data);
  const [hasMore, setHasMore] = useState(initialReviews.hasMore);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setReviews(initialReviews.data);
    setHasMore(initialReviews.hasMore);
  }, [initialReviews]);

  const loadMore = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/${pathName ? "reviews" : "review"}/${
          productId || pathName
        }?limit=4&skip=${reviews.length}`,
      );
      const data = await response.json();

      if (data.success) {
        setReviews([...reviews, ...data.data]);
        setHasMore(data.hasMore);
      }
    } catch (error) {
      console.error("Error loading more reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (reviewId) => {
    setReviews(reviews.filter((review) => review._id !== reviewId));
  };

  return (
    <section className="mt-6 md:mt-10" aria-labelledby="reviews-section-title">
      <header className="mb-4 md:mb-6">
        <h2
          id="reviews-section-title"
          className="text-darkNavy font-semibold text-base md:text-[1.5rem] lg:text-[1.75rem] mb-1 md:mb-2"
        >
          {initialReviews?.total > 0 ? t("title") : t("noReviews")}
          {initialReviews?.total > 0 && (
            <>
              (<span>{initialReviews?.total}</span>)
            </>
          )}
        </h2>
        {initialReviews?.total > 0 && (
          <p className="text-gray-600 text-xs md:text-sm">
            {`${initialReviews.total} ${t("customerReviews")}`}
          </p>
        )}
      </header>
      <div
        className="flex flex-col gap-4 md:gap-8"
        role="list"
        aria-label={t("productReviews")}
      >
        {reviews.length > 0 ? (
          <div className="space-y-4 md:space-y-6" role="list" aria-label={t("reviewsList")}>
            {reviews.map((review) => (
              <div key={review._id} role="listitem">
                <SingleReview
                  t={trans}
                  review={review}
                  user={review.user}
                  isOwner={
                    review?.user?._id === user?._id ||
                    user?.accountType === "admin"
                  }
                  onDelete={handleDelete}
                  pathName={pathName}
                  productName={productName}
                />
              </div>
            ))}
          </div>
        ) : (
          !productId && (
            <EmptyPlaceholder
              title={t("noReviews")}
              titleClassName="md:text-3xl text-2xl"
              description={t("noReviewsDescription")}
              descriptionClassName="md:text-xl text-base"
              detailsContainerClassName="w-full"
              Icon={NoReviews}
              role="status"
              aria-live="polite"
            />
          )
        )}
      </div>
      {hasMore && (
        <Button
          onPress={loadMore}
          isDisabled={loading}
          className="mt-6 md:mt-8 px-6 md:px-10 text-base md:text-lg"
          aria-label={loading ? t("loading") : t("loadMore")}
        >
          {loading ? t("loading") : t("loadMore")}
        </Button>
      )}
      {productId && (
        <AddReviewModal
          id={productId}
          lang={lang}
          reviews={initialReviews}
          translate={translate}
        />
      )}
    </section>
  );
}

export default memo(ReviewsContainer);
