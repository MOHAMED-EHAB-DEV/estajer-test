import React from "react";
import { cookies } from "next/headers";
import { getTranslations } from "@/hooks/getTranslations";
import RequestedProduct from "@/components/shared/RequestedProduct";
import PushNotificationModal from "@/components/shared/PushNotificationModal";

const getRequests = async (lang) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/requests?showAll=true&lang=${lang}`,
      { headers: { Authorization: token } },
    );
    if (!response.ok) throw new Error("Failed to fetch requests");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching requests:", error);
    return [];
  }
};

export default async function page({ params }) {
  const { lang } = await params;
  const langPrefix = lang === "ar" ? "" : "en/";
  const translate = await getTranslations(lang);
  const t = (key) => translate(`dashboard.requestedProducts.${key}`);
  const requests = await getRequests(lang);

  return (
    <div>
      <PushNotificationModal
        customer={true}
        translate={translate()}
        open={true}
        lang={lang}
      />

      <h1 className="lg:text-[1.8rem] md:text-[1.6rem] text-[1.2rem] font-semibold md:mb-6 mb-2">
        {t("title")}
      </h1>
      <div className="grid  md:gap-8 gap-4 grid-cols-1 md:grid-cols-2 mt-20">
        {requests?.data?.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            {t("noRequests")}
          </div>
        ) : (
          requests?.data?.map((request) => (
            <RequestedProduct
              key={request._id}
              request={request}
              lang={lang}
              buttonsText={translate("ui.button")}
              translate={translate()}
              owner={true}
            />
          ))
        )}
      </div>
    </div>
  );
}
