import { anyImgUrl } from "@/utils/ImageUrl";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { ChevronLeft } from "../ui/svgs/icons/ChevronLeftSvg";
import { Currency } from "../ui/svgs/icons/CurrencySvg";
import { EmptyBag } from "../ui/svgs/icons/EmptyBagSvg";
import EmptyPlaceholder from "@/components/shared/EmptyPlaceholder";

const getOrdersData = async (requests) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/orders?limit=1&requests=${requests}`,
      { headers: { Authorization: token } },
    );

    if (!response.ok) throw new Error("Failed to fetch orders");
    const { data } = await response.json();
    return data || [];
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
};

export default async function Orders({
  langPrefix,
  translate,
  placeholder,
  lang,
  requests,
}) {
  const t = (text) => translate(`dashboard.home.latestOrders.${text}`);
  const orderData = placeholder ? [] : await getOrdersData(requests);
  return (
    <div className="col-span-2 bg-white md:p-6 md:py-4 p-4 py-2 rounded-lg">
      <div className="flex justify-between items-center md:mb-6 mb-2 pt-2 md:pb-6 pb-3 border-b border-gray-200">
        <div className="font-IBMPlex font-semibold md:text-lg text-base">
          {requests ? t("landlordTitle") : t("title")}
        </div>
        <Link
          href={`/${langPrefix}dashboard/my-orders`}
          className="flex gap-2 items-center md:font-semibold font-medium md:text-base text-[13px]"
        >
          <span>{t("viewAll")}</span>
          <svg
            className="md:w-[8px] md:h-[13px] w-1.5 h-2.5 rtl:rotate-180"
            viewBox="0 0 8 13"
            fill="none"
          >
            <path
              d="M6.50012 11.7844L1.19385 6.47815L6.50012 1.17187"
              stroke="#0D092B"
              strokeWidth="1.66667"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>
      <div className="flex flex-col gap-4">
        {placeholder ? (
          ""
        ) : orderData?.orders?.length > 0 ? (
          orderData?.orders?.map((order, idx) => (
            <div key={idx}>
              <div className="bg-[#EAEEF3] flex flex-wrap justify-between items-center font-semibold md:text-base text-[13px]">
                <div className="flex flex-wrap md:gap-6 gap-3 items-center md:p-4 p-3 flex-1">
                  <div className="flex items-center gap-2">
                    {requests ? t("renter") : t("landlord")}:{" "}
                    <span className="text-primary font-IBMPlex">
                      {order.ownerData.fullName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {t("numberOfProducts")}: <span>{order.items.length}</span>
                  </div>
                  <div className="flex items-center gap-1 text-primary">
                    {t("cart.total")} : {order.totalAmount}
                    <Currency className="md:w-[15px] md:h-[15px] w-3.5 h-3.5" />
                  </div>
                </div>
                <div>
                  <Link
                    href={`/${langPrefix}dashboard/my-orders`}
                    className="flex gap-1 items-center md:p-4 p-3 md:text-base text-[13px]"
                  >
                    {t("orderDetails")}
                    <ChevronLeft className="md:w-5 md:h-5 w-4 h-4" />
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-[repeat(auto-fill,_minmax(250px,_1fr))] mt-4 gap-4">
                {order.items.map((item, idx) => (
                  <div className="flex flex-col gap-4">
                    <div className="min-w-36 aspect-[1.8/1] rounded-3xl overflow-hidden relative">
                      <div
                        className="absolute inset-0 opacity-95 group-hover:opacity-90 transition-opacity duration-300"
                        style={{
                          background:
                            item?.product?.images[0]?.gradientStyle ||
                            "linear-gradient(135deg, rgb(255 255 255), rgb(255 255 255))",
                        }}
                      />
                      <Image
                        src={anyImgUrl({
                          src: item?.product?.images[0]?.preview,
                          size: 500,
                        })}
                        fill
                        alt={
                          item.product?.[`name${lang === "ar" ? "Ar" : "En"}`]
                        }
                        unoptimized
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-primary font-semibold md:text-xl text-lg flex items-center gap-1">
                          {item.price}
                          <Currency className="md:w-[18px] md:h-[18px] w-4 h-4" />
                        </span>
                        <span className="text-[#595959] md:text-lg text-base">
                          {item.quantity} {t("perDay")}
                        </span>
                      </div>
                      <div className="font-IBMPlex font-semibold md:text-lg text-base line-clamp-1 mb-4">
                        {item.product?.[`name${lang === "ar" ? "Ar" : "En"}`]}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <EmptyPlaceholder
            Icon={() => <EmptyBag className="md:w-72 md:h-72 w-32 h-32" />}
            title={t("noOrders")}
            description={t("noOrdersDescription")}
            sm={true}
          />
        )}
      </div>
    </div>
  );
}
