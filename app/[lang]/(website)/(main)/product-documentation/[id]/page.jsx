import { notFound } from "next/navigation";
import { getTranslations } from "@/hooks/getTranslations";
import { cookies } from "next/headers";
import DocumentationSvg from "@/components/ui/svgs/DocumentationSvg";
import Button from "@/components/ui/Button";
import Link from "next/link";

async function orderStatus({ id }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/payment-status`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ id }),
      },
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
  const order = await orderStatus({ id });
  const t = await getTranslations(lang);
  if (!order || (order.status === "pending" && order.status === "not-paid"))
    notFound();
  return (
    <div>
      <div className="max-w-screen-xl md:gap-20 mx-auto px-8 py-16 md:min-h-[85vh] flex flex-wrap items-center justify-center ">
        <DocumentationSvg />
        <div className="flex-1">
          <h1 className="md:text-5xl text-3xl font-IBMPlex font-semibold text-primary md:mb-8 mb-4">
            {t("productDocumentation.startTitle")}
          </h1>
          <p className="md:text-3xl text-xl text-darkNavy md:leading-10">
            {t("productDocumentation.successMessage")}
          </p>
          <div className="md:mt-8 my-4">
            <Button
              as={Link}
              href={`/${langPrefix}documentation/${id}`}
              className="md:text-2xl text-xl md:py-8 py-7 md:px-16 px-10 font-semibold font-IBMPlex"
            >
              {t("productDocumentation.startNowButton")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
