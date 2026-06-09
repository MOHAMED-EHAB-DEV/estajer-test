async function getRequestedProducts() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/requests?limit=4`
    );
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error("Failed to fetch requested products:", error);
    return [];
  }
}

export async function generateStaticParams({ params }) {
  const { lang } = await params;
  const requests = await getRequestedProducts();
  return requests.map((request) => ({ ref: request._id, lang }));
}

export default async function RootLayout({ children }) {
  return children;
}
