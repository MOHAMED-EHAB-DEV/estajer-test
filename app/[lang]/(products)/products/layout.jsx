import Footer from "@/components/ui/Footer";
import Header from "@/components/ui/Header";
import { getTranslations } from "@/hooks/getTranslations";
import { getUrlName } from "@/lib/sitemap";

async function getProducts(lang) {
  try {
    const fields = `_id,${lang === "ar" ? "nameAr" : "nameEn"}`;

    // Fetch categories first to get the first category key for the category products section
    let categoryKey = "";
    try {
      const catRes = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/categories?mainOnly=true&status=active`,
        { next: { revalidate: 60 * 60 * 24 * 2 } },
      );
      if (catRes.ok) {
        const catData = await catRes.json();
        if (catData.success && catData.data?.length > 0) {
          categoryKey = catData.data[0].key;
        }
      }
    } catch (catError) {
      console.error("Failed to fetch categories in layout:", catError);
    }

    const generalLimit = lang === "ar" ? 500 : 100;
    const fetchAllParam = generalLimit > 100 ? "&fetch=all" : "";

    const fetches = [
      // general products
      fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/products?limit=${generalLimit}${fetchAllParam}&fields=${fields}`,
      ),
      // key="main" products
      fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/products?limit=20&status=main&fields=${fields}`,
      ),
      // key="offers" products
      fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/products?limit=20&sortBy=discounts&fields=${fields}`,
      ),
    ];

    if (categoryKey) {
      // key="category" products
      fetches.push(
        fetch(
          `${process.env.NEXT_PUBLIC_APP_URL}/api/products?limit=20&category=${categoryKey}&fields=${fields}`,
        ),
      );
    }

    const responses = await Promise.all(fetches);
    const jsonPromises = responses.map((res) => (res.ok ? res.json() : null));
    const results = await Promise.all(jsonPromises);

    const allProducts = [];
    results.forEach((result) => {
      if (result && result.success && Array.isArray(result.data)) {
        allProducts.push(...result.data);
      }
    });

    // Deduplicate by _id
    const uniqueProductsMap = new Map();
    allProducts.forEach((product) => {
      if (product && product._id) {
        uniqueProductsMap.set(product._id.toString(), product);
      }
    });

    return Array.from(uniqueProductsMap.values());
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}

export async function generateStaticParams() {
  const [arProducts, enProducts] = await Promise.all([
    getProducts("ar"),
    getProducts("en"),
  ]);

  const arParams = arProducts.map((product) => ({
    ref: `${getUrlName(product.nameAr || product.nameEn || product.name)}_ref_${product._id}`,
    lang: "ar",
  }));

  const enParams = enProducts.map((product) => ({
    ref: `${getUrlName(product.nameEn || product.nameAr || product.name)}_ref_${product._id}`,
    lang: "en",
  }));

  return [...arParams, ...enParams];
}

export default async function RootLayout({ children, params }) {
  const { lang } = await params;
  const translate = await getTranslations(lang, ["home", "footer"]);
  return (
    <>
      <Header
        products={true}
        lang={lang}
        translate={{
          ui: {
            button: translate("ui.button"),
            header: translate("ui.header"),
            dropdown: translate("ui.dropdown"),
          },
          sidebar: translate("sidebar"),
          home: { search: translate("home.search") },
          mobileNav: translate("mobileNav"),
          langDrawer: translate("langDrawer"),
          notifications: {
            title: translate("notifications.title"),
            drawerTitle: translate("notifications.drawerTitle"),
            showMore: translate("notifications.showMore"),
            markAllAsRead: translate("notifications.markAllAsRead"),
            noNotifications: translate("notifications.noNotifications"),
            noNotificationsDescription: translate("notifications.noNotificationsDescription"),
          },
          footer: translate("footer"),
          productComponent: translate("productComponent"),
        }}
      />
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
