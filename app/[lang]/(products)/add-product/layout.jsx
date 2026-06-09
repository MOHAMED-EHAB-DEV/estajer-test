import Footer from "@/components/ui/Footer";
import Header from "@/components/ui/Header";
import { getTranslations } from "@/hooks/getTranslations";

export default async function RootLayout({ children, params }) {
  const { lang } = await params;
  const translate = await getTranslations(lang, ["home", "header", "footer"]);

  return (
    <>
      <Header lang={lang} translate={translate()} />
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
