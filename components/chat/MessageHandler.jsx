"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Button from "../ui/Button";
import Image from "next/image";
import { anyImgUrl } from "@/utils/ImageUrl";
import { useTranslations } from "@/hooks/useTranslations";
import TicketForm from "../ticket/TicketForm";
import { getUrlName } from "@/lib/sitemap";

async function getInitialProducts({ name, lang }) {
  const params = new URLSearchParams({
    ...(name && { name }),
    lang,
    limit: 5,
    compressed: true,
    fields: `images,owner,${
      lang === "ar" ? "nameAr" : "nameEn"
    },rental,rating,pricingModel,location,${
      lang === "ar" ? "addressAr" : "addressEn"
    }`,
  });

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/products?${params.toString()}`,
    );
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (error) {
    return [];
  }
}

function SimpleProductItem({ product, lang }) {
  const langPrefix = lang === "ar" ? "" : "en/";
  const price =
    product.pricingModel === "packages"
      ? product?.rental?.packages?.[0]?.price
      : product?.rental?.value;

  return (
    <Link
      href={`/${langPrefix}products/${getUrlName(product.name)}_ref_${
        product._id
      }`}
      className="block"
      title={product.name}
      aria-label={product.name}
    >
      <div className="flex items-center gap-3 bg-white rounded-xl shadow-sm p-3 border border-[#EAEEF3] hover:border-primary/40 transition-colors">
        <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-gray-100">
          <Image
            fill
            unoptimized
            src={anyImgUrl({
              src: product?.images?.[0]?.preview || product?.images?.[0],
              size: 100,
              aspectRatio: "1:1",
            })}
            alt={product.name}
            className="object-contain"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-darkNavy line-clamp-2">
            {product.name}
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-primary font-bold text-sm">{price}</span>
            <span className="text-xs text-gray-500">SAR</span>
          </div>
          {product?.address?.city && (
            <div className="mt-1 text-xs text-gray-600">
              {product.address.city}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function MessageHandler({
  data,
  translate,
  lang,
  visitorName,
  open,
}) {
  const trans = useTranslations(translate);
  const tContact = (key) => trans(`ticket.${key}`);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(open);
  useEffect(() => {
    if (!data || data.type !== "search") return;
    const name = data?.name || "";
    if (!name) return;
    if (!isOpen) return;
    setLoading(true);
    getInitialProducts({ name, lang })
      .then((list) => setProducts(list || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [data, isOpen]);

  if (!data || data.type === "text") return null;

  const langPrefix = lang === "ar" ? "" : "/en";

  if (data.type === "about") {
    return (
      <div className="mt-2">
        <Button
          as={Link}
          href={`${langPrefix}/contact`}
          className="font-semibold"
        >
          {trans("chat.aboutUs")}
        </Button>
      </div>
    );
  }

  if (data.type === "whatsapp") {
    return (
      <div className="mt-2">
        <Button
          as={Link}
          href={`https://api.whatsapp.com/send?phone=966530636879`}
          target="_blank"
          className="font-semibold"
          dir="ltr"
        >
          +966 530636879
        </Button>
      </div>
    );
  }

  if (data.type === "contact") {
    return isOpen ? (
      <div className=" px-4 py-6 bg-white rounded-xl shadow w-full">
        <TicketForm
          translate={translate}
          lang={lang}
          t={tContact}
          sm={true}
          data={{ ...data, name: visitorName }}
        />
      </div>
    ) : (
      <div className="mt-2">
        <Button className="font-semibold" onPress={() => setIsOpen(true)}>
          {trans("chat.showContactMethod")}
        </Button>
      </div>
    );
  }

  if (data.type === "search") {
    return (
      <div className="mt-2 text-start">
        {!isOpen ? (
          <Button
            className="font-semibold"
            onPress={() => setIsOpen((prev) => !prev)}
          >
            {trans("chat.showProducts")}
          </Button>
        ) : loading ? (
          <div className="text-sm text-gray-600">...</div>
        ) : products.length > 0 ? (
          <div>
            <div className="grid grid-cols-1 gap-3">
              {products.map((product) => (
                <SimpleProductItem
                  key={product._id}
                  product={product}
                  lang={lang}
                  translate={translate}
                />
              ))}
            </div>
            <div className="text-center mt-3">
              <Button
                as={Link}
                href={`${langPrefix}/search/products?name=${data?.name || ""}`}
                className="font-semibold"
              >
                {trans("chat.moreProducts")}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-600">{trans("chat.noResults")}</div>
        )}
      </div>
    );
  }

  if (data.type === "product") {
    return (
      <div className="mt-1 w-full max-w-sm text-start">
        <SimpleProductItem
          product={data.product}
          lang={lang}
          translate={translate}
        />
      </div>
    );
  }

  return null;
}
