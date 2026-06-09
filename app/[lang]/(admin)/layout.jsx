import { getTranslations } from "@/hooks/getTranslations";
import LayoutContainer from "@/components/admin/layout/LayoutContainer";

export const dynamic = "force-dynamic";

export default async function RootLayout({ children, params }) {
  const { lang } = await params;
  const translate = await getTranslations(lang);
  return (
    <div className="bg-[#F6F6F6] min-h-dvh flex">
      <div className="lg:w-[calc(100%-21rem)] w-full ms-auto">
        <LayoutContainer lang={lang} translate={translate()} />
        <div className="p-4 max-w-screen-3xl mx-auto">{children}</div>
      </div>
    </div>
  );
}
