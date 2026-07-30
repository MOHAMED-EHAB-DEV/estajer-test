import Footer from "@/components/ui/Footer";
import Header from "@/components/ui/Header";
import { getTranslations } from "@/hooks/getTranslations";

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
