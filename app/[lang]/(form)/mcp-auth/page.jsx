import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import McpAuthClient from "@/components/form/McpAuthClient";
import { getTranslations } from "@/hooks/getTranslations";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return {
    title: lang === "ar" ? "تفويض الذكاء الاصطناعي | استأجر" : "AI Authorization | Estajer",
    robots: { index: false },
  };
}

export default async function McpAuthPage({ params, searchParams }) {
  const { lang } = await params;
  const { code } = await searchParams;
  const translate = await getTranslations(lang);

  // Build the full return URL (this page with the code)
  const returnUrl = `/${lang === "ar" ? "" : `${lang}/`}mcp-auth${code ? `?code=${code}` : ""}`;

  // Check if the user is logged in via the HttpOnly JWT cookie
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("token");

  let isLoggedIn = false;
  if (tokenCookie?.value) {
    try {
      jwt.verify(tokenCookie.value, process.env.JWT_SECRET);
      isLoggedIn = true;
    } catch {
      // token invalid or expired — treat as not logged in
    }
  }

  // Not logged in → send to login page with this page as the redirect target
  if (!isLoggedIn) {
    const loginPath = `/${lang === "ar" ? "" : `${lang}/`}login?page=${encodeURIComponent(returnUrl)}`;
    redirect(loginPath);
  }

  // Logged in → render the authorization UI (client component does the POST)
  return <McpAuthClient code={code || ""} lang={lang} translate={translate()} />;
}
