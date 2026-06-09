# Search Products Skill

This skill allows agents to search for products available for rent on Estajer.

## Capabilities

- Search by keywords (name)
- Filter by category and subcategory
- Filter by geographical bounds
- Sort by various criteria

## Usage

Agents should use the `/api/products` endpoint to perform searches.

### Parameters

- `name`: Search query string for product name or description
- `category`: Category identifier
- `subCategory`: SubCategory identifier
- `bounds`: JSON string containing geographical bounds, e.g., `{"north": 25.0, "south": 24.0, "east": 47.0, "west": 46.0}`
- `sortBy`: Sorting order (e.g., `newest`, `discounts`, `bestSelling`, `highestRated`, `mostLiked`, `date-desc`, `date-asc`)
- `limit`: Number of results per page (default 10)
- `page`: Page number
- `lang`: Language preference ('ar' or 'en')
- `fields`: Comma-separated list of fields to return
- `compressed`: Boolean string ('true'/'false') to return compressed response format

## MCP Server

An MCP (Model Context Protocol) server is available at `https://estajer.com/api/mcp` using **Streamable HTTP** transport.

Available tools:
- `search_products` — search by name, category, location, sort order
- `get_product` — retrieve full product detail by ID
- `get_categories` — list all rental categories (optionally with subcategories and counts)
