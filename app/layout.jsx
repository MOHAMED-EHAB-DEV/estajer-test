import "./globals.css";

export const metadata = {
  title: "Multilingual Blog",
  description: "A Next.js 15 multilingual blog with Arabic and English support",
};
export function generateViewport({ params }) {
  return {
    themeColor: "#ffffff",
  };
}
export default async function RootLayout({ children }) {
  return children;
}
