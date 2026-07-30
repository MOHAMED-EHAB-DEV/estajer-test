import Footer from "@/components/ui/Footer";
import HeaderContainer from "@/components/ui/HeaderContainer";
import { getTranslations } from "@/hooks/getTranslations";
import InteractionGTM from "@/components/seo/InteractionGTM";
import GTMPageView from "@/hooks/GTMPageView";
import { Suspense } from "react";

export default async function RootLayout({ children, params }) {
  const { lang } = await params;
  const translate = await getTranslations(lang, ["home","footer"]);

  return (
    <>
      <Suspense fallback={null}>
        <GTMPageView />
      </Suspense>
      <HeaderContainer lang={lang} translate={translate()} awareness={true} />
      <main
        id="main-content"
        role="main"
        aria-label={translate("home.mainContent")}
      >
        {children}
      </main>
      <Footer lang={lang} />
      <InteractionGTM gtmId="GTM-W7PNC244" />
    </>
  );
}
