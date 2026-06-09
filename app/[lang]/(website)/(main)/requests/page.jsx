import RequestedProduct from "@/components/shared/RequestedProduct";
import { getTranslations } from "@/hooks/getTranslations";

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const { lang } = await params;
  const siteURL = process.env.NEXT_PUBLIC_APP_URL;

  const meta = {
    ar: {
      title: "المنتجات المطلوبة | استأجر",
      description:
        "تصفح قائمة المنتجات المطلوبة من قبل المستخدمين. ساعد في توفير المنتجات التي يحتاجها الآخرون.",
    },
    en: {
      title: "Requested Products | Estajer",
      description:
        "Browse the list of products requested by users. Help provide the products others need.",
    },
  };

  const currentMeta = meta[lang] || meta["ar"];

  return {
    title: currentMeta.title,
    description: currentMeta.description,
    alternates: {
      canonical: `${siteURL}/${lang === "ar" ? "" : `${lang}/`}requests`,
      languages: {
        ar: `/requests`,
        en: `/en/requests`,
      },
    },
    openGraph: {
      title: currentMeta.title,
      description: currentMeta.description,
      url: `${siteURL}/${lang === "ar" ? "" : `${lang}/`}requests`,
      type: "website",
    },
  };
}

async function getRequestedProducts({ lang }) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/requests?limit=100&lang=${lang}`,
      { next: { revalidate: 60 * 60 * 24 } } // Revalidate daily
    );
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error("Failed to fetch requested products:", error);
    return [];
  }
}

export default async function page({ params }) {
  const { lang } = await params;
  const translate = await getTranslations(lang);
  const t = (value) => translate(`dashboard.requestedProducts.${value}`);
  const requests = await getRequestedProducts({ lang });

  return (
    <div className="mb-20">
      <div className="px-4">
        <h1 className="text-[1.6rem] font-bold text-center mt-12 mb-8">
          {t("title")}
        </h1>
      </div>
      <div className="grid gap-x-6 gap-y-8 md:gap-x-10 md:grid-cols-2 grid-cols-1 mt-16 max-w-screen-2xl mx-auto">
        {requests.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            {t("noRequests")}
          </div>
        ) : (
          requests.map((request) => (
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
  );
}
