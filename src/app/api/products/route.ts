import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/lib/services/search";
import { products } from "@/mock";

export function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");
  const data = query ? searchProducts(query) : products;

  return NextResponse.json({
    data,
    meta: {
      total: data.length,
      source: "mock"
    }
  });
}
