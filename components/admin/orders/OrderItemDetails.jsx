"use client";
import Image from "next/image";
import Link from "next/link";
import {
  Calender,
  Products,
  Cash,
  CheckCircle,
  Map,
} from "@/components/ui/svgs/Admin";
import { Location } from "@/components/ui/svgs/icons/LocationSvg";
import { anyImgUrl } from "@/utils/ImageUrl";

const OrderItemDetails = ({ item }) => {
  return (
    <div className="flex gap-4 items-center flex-wrap sm:flex-nowrap justify-center sm:justify-normal">
      <div className="md:min-w-32 min-w-24 aspect-[1.1/1] md:rounded-3xl rounded-2xl overflow-hidden relative">
        <div
          className="absolute inset-0 opacity-95 transition-opacity duration-300"
          style={{
            background:
              item.product?.images[0]?.gradientStyle ||
              "linear-gradient(135deg, rgb(255 255 255), rgb(255 255 255))",
          }}
        />
        <Image
          src={anyImgUrl({
            src: item.product?.images[0]?.preview || "",
            size: 500,
          })}
          fill
          alt={item.product?.nameAr}
          className="h-full w-full object-contain"
          unoptimized
        />
      </div>
      <div>
        <div className="text-darkNavy font-IBMPlex font-semibold text-sm md:text-lg mb-2">
          {item.product?.nameAr}
        </div>
        <div className="text-[11px] md:text-sm text-[#5B5656] mb-3 flex gap-2">
          <span>
            تاريخ الإنشاء:{" "}
            {new Date(item.createdAt).toLocaleString("ar", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "numeric",
              minute: "numeric",
            })}
          </span>
        </div>
        <div className="flex flex-wrap gap-2 md:gap-6 text-sm md:text-base font-semibold mb-1 md:mb-2">
          <div className="flex items-center gap-2">
            <Calender />
            {new Date(item.startDate).toLocaleDateString("ar", {
              weekday: "long",
              year: "numeric",
              month: "numeric",
              day: "numeric",
            })}{" "}
            {" ~ "}
            {new Date(item.endDate).toLocaleDateString("ar", {
              weekday: "long",
              year: "numeric",
              month: "numeric",
              day: "numeric",
            })}
          </div>
          <div className="flex items-center gap-2">
            <Products />
            <span>{item.quantity} قطع</span>
          </div>
          <div className="flex items-center gap-2">
            <Cash />
            <span>{item.price} ر.س</span>
          </div>
          {item.deliveryType && (
            <div className="flex items-center gap-2">
              <Location color="#0D092B" className="w-4 h-4" />
              <span className="font-semibold">طريقة التوصيل: </span>
              <span>
                {item.selectedBranch
                  ? `الاستلام من ${item.selectedBranch?.name}`
                  : item.deliveryType === "delivery"
                    ? "التوصيل"
                    : "الاستلام"}
              </span>
            </div>
          )}
          {item?.deliveryCost > 0 && (
            <div className="flex items-center gap-2">
              <Cash />
              <span className="font-semibold">تكلفة التوصيل:</span>
              <span>{item.deliveryCost} ر.س</span>
            </div>
          )}
        </div>
        {item.deliveryType === "receive" && item.selectedBranch && (
          <Link
            href={`https://www.google.com/maps?q=${item.selectedBranch?.location?.lat},${item.selectedBranch?.location?.lng}`}
            target="_blank"
            className="flex w-max items-center gap-1 text-primary underline font-semibold text-xs md:text-base font-IBMPlex"
          >
            <Map className="md:w-4 md:h-4 w-3.5 h-3.5" />
            <span>عرض في الخريطة</span>
          </Link>
        )}
        {item?.services?.length > 0 && (
          <div>
            <span className="font-semibold">خدمات اضافية:</span>
            <div className="flex flex-wrap justify-between mt-1 gap-x-6 gap-y-1">
              {item?.services?.map((service, idx) => (
                <div className="flex items-center gap-1" key={idx}>
                  <CheckCircle color="#0D092B" />
                  <span className="text-darkNavy">
                    {service.name} - عدد {service.quantity} - {service.price} ر.س
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderItemDetails;
