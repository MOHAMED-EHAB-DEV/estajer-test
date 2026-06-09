import CartContainer from "@/components/cart/CartContainer";
import { getTranslations } from "@/hooks/getTranslations";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const t = await getTranslations(lang);
  const siteURL = process.env.NEXT_PUBLIC_APP_URL;
  const canonical = `${siteURL}/${lang === "ar" ? "" : "en/"}cart`;

  return {
    title: t("cart.title"),
    description: t("cart.description"),
    alternates: {
      canonical: canonical,
      languages: {
        ar: `${siteURL}/cart`,
        en: `${siteURL}/en/cart`,
      },
    },
    openGraph: {
      title: t("cart.title"),
      description: t("cart.description"),
      url: canonical,
      siteName: "Estajer",
      locale: lang === "ar" ? "ar_SA" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("cart.title"),
      description: t("cart.description"),
    },
  };
}

export default async function CartPage({ params, searchParams }) {
  const { lang } = await params;
  const { cart, id } = await searchParams;
  const translate = await getTranslations(lang);

  return (
    <CartContainer
      translate={translate()}
      lang={lang}
      cart={cart}
      shareId={id}
    />
  );
}
