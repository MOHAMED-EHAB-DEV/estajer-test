"use client";
import { useEffect, useState } from "react";
import AddReview from "./AddReview";
import Button from "@/components/ui/Button";
import { useUser } from "@/context/UserContext";
import { useTranslations } from "@/hooks/useTranslations";

export default function AddReviewModal({ lang, translate, id, reviews }) {
  const trans = useTranslations(translate);
  const t = (text) => trans(`singleProduct.reviews.${text}`);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [booking, setBooking] = useState(false);
  const { user } = useUser();
  useEffect(() => {
    user &&
      fetch(`/api/bookings?product=${id}`)
        .then((res) =>
          res.json().then((data) => {
            if (data.success) setBooking(data.data);
            else setBooking(false);
          }),
        )
        .catch((err) => console.error("Error fetching booking data:", err));
  }, [reviews, user]);

  return (
    <div id="rating" style={{ scrollMarginTop: "250px" }}>
      {booking && (
        <>
          <AddReview
            lang={lang}
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            translate={translate}
            product={id}
          />

          <div className="mt-20">
            <Button
              onPress={() => setIsModalOpen(true)}
              className="text-lg gap-3 ps-12 pe-16 py-7 bg-darkNavy !opacity-100"
            >
              <svg width="22" height="22" viewBox="0 0 26 26" fill="#F48A42">
                <path d="M0.5 25.5V3C0.5 2.3125 0.745 1.72417 1.235 1.235C1.725 0.745833 2.31333 0.500833 3 0.5H23C23.6875 0.5 24.2763 0.745 24.7663 1.235C25.2563 1.725 25.5008 2.31333 25.5 3V18C25.5 18.6875 25.2554 19.2763 24.7663 19.7663C24.2771 20.2563 23.6883 20.5008 23 20.5H5.5L0.5 25.5ZM9.34375 15.8125L13 13.5938L16.6562 15.8125L15.6875 11.6562L18.9375 8.84375L14.6562 8.5L13 4.5625L11.3438 8.5L7.0625 8.84375L10.3125 11.6562L9.34375 15.8125Z" />
              </svg>
              {t("addReviewBtn")}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
