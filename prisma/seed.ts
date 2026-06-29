import { PrismaClient } from "@prisma/client";
import {
  batches,
  brands,
  categories,
  customers,
  homepageBanners,
  homepageSections,
  inventoryBatches,
  productImages,
  products,
  productVariants,
  suppliers,
  warehouses
} from "../src/mock";

const prisma = new PrismaClient();

async function main() {
  console.log("Seed data loaded for reference:", {
    brands: brands.length,
    categories: categories.length,
    products: products.length,
    productVariants: productVariants.length,
    productImages: productImages.length,
    warehouses: warehouses.length,
    suppliers: suppliers.length,
    batches: batches.length,
    inventoryBatches: inventoryBatches.length,
    customers: customers.length,
    homepageBanners: homepageBanners.length,
    homepageSections: homepageSections.length
  });

  console.log(
    "Database writes will be enabled after Phase 1 confirms the target PostgreSQL/Supabase environment."
  );
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
