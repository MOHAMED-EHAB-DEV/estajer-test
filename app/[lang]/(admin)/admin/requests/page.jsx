import AdminRequestContainer from "@/components/admin/requests/AdminRequestContainer";
import { getTranslations } from "@/hooks/getTranslations";

async function getInitialData(lang) {
  try {
    const params = new URLSearchParams({
      showAll: true,
      limit: 100,
    });
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/requests?${params}`
    );
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error("Error fetching requests:", error);
    return [];
  }
}

const Page = async ({ params }) => {
  const { lang } = await params;
  const translate = await getTranslations(lang);
  const data = await getInitialData(lang);
  return <AdminRequestContainer translate={translate()} initialData={data} />;
};

export default Page;
  