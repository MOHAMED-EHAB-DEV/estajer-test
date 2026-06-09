import Footer from "@/components/ui/Footer";
import Header from "@/components/ui/Header";
import { getTranslations } from "@/hooks/getTranslations";
import { getUrlName } from "@/lib/sitemap";

async function getProducts(lang) {
  try {
    const params = new URLSearchParams({
      limit: 200,
      fields: `_id,${lang === "ar" ? "nameAr" : "nameEn"}`,
    });
    const homeParams = new URLSearchParams({
      limit: 20,
      fields: `_id,${lang === "ar" ? "nameAr" : "nameEn"}`,
      status: "main",
    });
    // await all requests
    const [res, homeRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/products?${params}`),
      fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/products?${homeParams}`),
    ]);
    const data = await res.json();
    const homeData = await homeRes.json();
    return data.success ? [...data.data, ...homeData.data] : [];
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}

export async function generateStaticParams({ params }) {
  const { lang } = await params;
  const products = await getProducts(lang);
  return products.map((product) => ({
    ref: `${getUrlName(product[lang === "ar" ? "nameAr" : "nameEn"])}_ref_${
      product._id
    }`,
    lang,
  }));
}

export default async function RootLayout({ children, params }) {
  const { lang } = await params;
  const translate = await getTranslations(lang, ["home", "header", "footer"]);
  return (
    <>
      <Header products={true} lang={lang} translate={translate()} />
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
