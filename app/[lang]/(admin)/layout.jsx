import { getTranslations } from "@/hooks/getTranslations";
import LayoutContainer from "@/components/admin/layout/LayoutContainer";

export const dynamic = "force-dynamic";

export default async function RootLayout({ children, params }) {
  const { lang } = await params;
  const translate = await getTranslations(lang);
  return (
    <div className="bg-lightBg min-h-dvh flex">
      <div className="lg:w-[calc(100%-21rem)] w-full ms-auto">
        <LayoutContainer lang={lang} translate={translate()} />
        <div
          style={{
            paddingBottom: "calc(5.5rem + env(safe-area-inset-bottom, 0px))",
          }}
          className="p-4 md:p-6 lg:!pb-6 max-w-screen-3xl mx-auto"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
