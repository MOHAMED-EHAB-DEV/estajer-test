import CloudSection from "@/components/singleProduct/CloudSection";
import ImagesContainer from "@/components/singleProduct/ImagesContainer";
import ProductDetails from "@/components/singleProduct/ProductDetails";
import SafetySection from "@/components/singleProduct/SafetySection";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { getTranslations } from "@/hooks/getTranslations";
import { notFound } from "next/navigation";
import ReportButton from "@/components/singleProduct/report/ReportButton";
import Button from "@/components/ui/Button";
import Link from "next/link";

export async function generateMetadata({ params }) {
  const { lang, id } = await params;
  const request = await getRequest({ lang, id });

  return {
    robots: "noindex, nofollow",
    title: `${request?.name || "Request"} | Estajer`,
    description: request?.description || "Request preview",
  };
}

async function getRequest({ lang, id }) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/requests/${id}?lang=${lang}&owner=true`,
      // { next: { revalidate: 60 * 60 * 24 * 2 } }
    );
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    return null;
  }
}

export default async function page({ params }) {
  const { lang, id } = await params;
  const langPrefix = lang === "ar" ? "" : "en/";
  const translate = await getTranslations(lang);
  const request = await getRequest({ lang, id });
  // console.log('request: ', request);

  if (!request) notFound();

  return (
    <div>
      <div className="relative mt-6 md:mt-12 mb-20">
        <CloudSection lang={lang} />
        <div className="max-w-screen-2xl mx-auto lg:px-6 px-4 relative">
          <Breadcrumbs lang={lang} product={request} requested={true} />
          <ImagesContainer product={request} requested={true} />
          <div className="flex flex-wrap mt-10 mb-32">
            <ProductDetails
              lang={lang}
              product={request}
              translate={translate()}
              requested={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
