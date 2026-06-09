import { notFound } from "next/navigation";
import { getTranslations } from "@/hooks/getTranslations";
import { cookies } from "next/headers";
import PageTitle from "@/components/shared/PageTitle";
import DocumentationForm from "@/components/productDocumentation/DocumentationForm";
import DocumentationSafety from "@/components/productDocumentation/DocumentationSafety";
import LoginRequired from "@/components/productDocumentation/LoginRequired";

async function getOrderAndRole({ id }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return { needsLogin: true };
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/order-role/${id}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: token },
      },
    );
    const data = await response.json();

    if (data.error === "No token provided" || response.status === 401) {
      return { needsLogin: true };
    }

    if (!data.success || !data.data?.order) {
      return { order: null };
    }

    return {
      order: data.data.order,
      userRole: data.data.role,
    };
  } catch (error) {
    console.error("Error fetching order role:", error);
    return { order: null };
  }
}

export default async function page({ params }) {
  const { lang, id } = await params;
  const langPrefix = lang === "ar" ? "" : "en/";
  const result = await getOrderAndRole({ id });
  const translate = await getTranslations(lang);

  if (result.needsLogin) {
    return (
      <LoginRequired
        langPrefix={langPrefix}
        redirectPath={`/${langPrefix}documentation/${id}`}
        t={translate()}
      />
    );
  }

  const order = result.order;
  const userRole = result.userRole || "renter";
  const isReceived =
    userRole === "renter" ? order?.renterConfirmedAt : order?.ownerConfirmedAt;
  if (
    !order ||
    (order.status !== "confirmed" && order.status !== "received") ||
    isReceived
  )
    notFound();

  return (
    <div>
      <PageTitle
        lang={lang}
        title={translate().productDocumentation.pageTitle}
        description={translate().productDocumentation.pageDescription}
      />
      <div className="border-t max-w-screen-2xl md:gap-8 mx-auto -mt-4 px-8 pt-10 pb-24 grid grid-cols-1 md:grid-cols-2 justify-center ">
        <DocumentationForm
          id={id}
          lang={lang}
          langPrefix={langPrefix}
          translate={translate()}
          order={order}
          userRole={userRole}
        />
        <DocumentationSafety translate={translate} userRole={userRole} />
      </div>
    </div>
  );
}
