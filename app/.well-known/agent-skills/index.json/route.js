import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export async function GET() {
  const siteURL = process.env.NEXT_PUBLIC_APP_URL || "https://estajer.com";

  let digest = "sha256:error_calculating_hash";
  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      ".well-known",
      "agent-skills",
      "search-products.md",
    );
    const fileBuffer = fs.readFileSync(filePath);
    const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex");
    digest = `sha256:${hash}`;
  } catch (err) {
    console.error("Failed to calculate skill hash:", err);
  }

  const discovery = {
    $schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
    skills: [
      {
        name: "search-products",
        type: "skill-md",
        description: "Search for products available for rent on Estajer.",
        url: `${siteURL}/.well-known/agent-skills/search-products.md`,
        digest: digest,
      },
      {
        name: "estajer-mcp",
        type: "mcp",
        description:
          "MCP server exposing search_products, get_product, and get_categories tools for the Estajer rental marketplace.",
        url: `${siteURL}/api/mcp/mcp`,
        transport: "streamable-http",
        sse: `${siteURL}/api/mcp/sse`,
      },
    ],
  };

  return NextResponse.json(discovery);
}
