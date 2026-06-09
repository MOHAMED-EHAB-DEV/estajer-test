import { notFound } from "next/navigation";
import ContractForm from "@/components/contract/ContractForm";
// import { getTranslations } from "@/hooks/getTranslations";
import { cookies } from "next/headers";

async function orderData({ id }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/payment-status?full=true`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ id, full: true }),
      },
    );
    const data = await response.json();
    return data.success ? data.data.order : null;
  } catch (error) {
    return null;
  }
}

export default async function Page({ params }) {
  const { lang, id } = await params;
  const langPrefix = lang === "ar" ? "" : "en/";
  const order = await orderData({ id });
  // const translate = await getTranslations(lang);
  if (!order || (order.status === "pending" && order.status === "not-paid"))
    notFound();
  return (
    <ContractForm
      userData={order.userData}
      ownerData={order.ownerData}
      order={order}
      items={order.items}
    />
  );
}
