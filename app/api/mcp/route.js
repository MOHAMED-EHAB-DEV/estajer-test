  import { NextResponse } from "next/server";

  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://estajer.com";

  /**
   * GET /api/mcp
   * Returns human-readable info about the Estajer MCP server.
   * The actual MCP endpoint (Streamable HTTP + SSE) is at:
   *   POST /api/mcp/mcp   — Streamable HTTP transport
   *   GET  /api/mcp/sse   — SSE transport
   */
  export async function GET() {
    return NextResponse.json({
      name: "estajer-mcp",
      version: "1.0.0",
      description:
        "Estajer MCP server — exposes rental product search and category tools for the Estajer marketplace.",
      tools: ["search_products", "get_product", "get_categories"],
      endpoints: {
        streamableHttp: `${BASE_URL}/api/mcp/mcp`,
        sse: `${BASE_URL}/api/mcp/sse`,
      },
      docs: `${BASE_URL}/openapi.json`,
    });
  }

