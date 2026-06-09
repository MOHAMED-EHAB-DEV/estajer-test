import Footer from "@/components/ui/Footer";
import HeaderContainer from "@/components/ui/HeaderContainer";
import { getTranslations } from "@/hooks/getTranslations";

export default async function RootLayout({ children, params }) {
  const { lang } = await params;
  const translate = await getTranslations(lang, ["home", "header", "footer"]);

  return (
    <>
      <HeaderContainer lang={lang} translate={translate()} partner={true} />
      <main
        id="main-content"
        role="main"
        aria-label={translate("home.mainContent")}
      >
        {children}
      </main>
      <Footer lang={lang} />
    </>
  );
}
