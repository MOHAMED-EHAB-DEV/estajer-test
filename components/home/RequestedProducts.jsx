import Button from "../ui/Button";
import SectionTitle from "../shared/SectionTitle";
import RequestedProductsContainer from "./RequestedProductsContainer";
import { getTranslations } from "@/hooks/getTranslations";
import Link from "next/link";

async function getRequestedProducts(lang) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/requests?limit=5&lang=${lang}`,
      { next: { revalidate: 60 * 60 * 24 * 2 } }
    );
    if (!res.ok) throw new Error("Failed to fetch requests");
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error("Failed to fetch requested products:", error);
    return [];
  }
}

export default async function RequestedProducts({ lang }) {
  const langPrefix = lang === "ar" ? "" : "en/";
  const translate = await getTranslations(lang, ["home"]);
  const t = (value) => translate(`home.requestedProducts.${value}`);
  const requests = await getRequestedProducts(lang);

  return (
    <div
      id="requested-products"
      className="max-w-screen-6xl mx-auto px-4 py-12 md:py-32 text-white relative z-10 overflow-x-hidden"
    >
      <SectionTitle
        title={t("title")}
        text={t("description")}
        subHeadingClassName="!text-[#FF8D28]"
      />
      <RequestedProductsContainer
        lang={lang}
        owner={false}
        requests={requests}
        translate={translate()}
      />
      {requests.length > 0 && (
        <div className="flex justify-center mt-2 md:mt-20">
          <Button
            title={translate("ui.button.showAllOrders")}
            className="![filter:drop-shadow(0_17px_20px_#F48A4233)] bg-white text-[#FF8D28] font-semibold px-8 py-4 text-base font-IBMPlex md:text-xl"
            as={Link}
            href={`/${langPrefix}requests`}
          >
            {translate("ui.button.showAllOrders")}
          </Button>
        </div>
      )}
    </div>
  );
}
