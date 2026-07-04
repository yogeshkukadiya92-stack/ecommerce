import { NextRequest, NextResponse } from "next/server";
import { listActiveProducts } from "@/lib/catalog/productRepository";
import { products } from "@/mock";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");

  try {
    const data = await listActiveProducts(query);

    return NextResponse.json({
      data,
      meta: {
        total: data.length,
        source: "database"
      }
    });
  } catch (error) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        {
          data: [],
          error: "products_database_unavailable",
          message: "Product catalog is temporarily unavailable.",
          meta: { source: "database", total: 0 }
        },
        { status: 503 }
      );
    }

    const normalizedQuery = query?.trim().toLowerCase();
    const data = normalizedQuery
      ? products.filter((product) =>
          [product.name, product.shortDescription, product.brandId, ...product.goalTags]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery)
        )
      : products;

    return NextResponse.json({
      data,
      message: error instanceof Error ? error.message : "Database unavailable. Showing local development catalog.",
      meta: {
        total: data.length,
        source: "development-fallback"
      }
    });
  }
}
