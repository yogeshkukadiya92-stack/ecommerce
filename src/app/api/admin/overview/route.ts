import { NextResponse } from "next/server";
import { brands, categories, customers, inventoryBatches, orders, products } from "@/mock";

export function GET() {
  return NextResponse.json({
    data: {
      brands: brands.length,
      categories: categories.length,
      products: products.length,
      customers: customers.length,
      orders: orders.length,
      inventoryBatches: inventoryBatches.length
    },
    auth: {
      protectedLaterBy: "role-based access control"
    }
  });
}
