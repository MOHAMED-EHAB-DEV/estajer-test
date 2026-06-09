import { NextResponse } from "next/server";

export async function GET() {
  const siteURL = process.env.NEXT_PUBLIC_APP_URL || "https://estajer.com";

  const apiCatalog = {
    linkset: [
      {
        anchor: `${siteURL}/api`,
        "service-desc": [
          {
            href: `${siteURL}/openapi.json`,
            type: "application/openapi+json;version=3.1",
          },
        ],
      },
    ],
  };

  return NextResponse.json(apiCatalog, {
    headers: { "Content-Type": "application/linkset+json" },
  });
}
