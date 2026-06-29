# FitSupplement Store

Premium full-stack ecommerce foundation for health supplements, protein powders, performance nutrition, vitamins, shakers, and fitness accessories.

Phase 0 intentionally focuses on the technical foundation: project structure, data models, TypeScript contracts, mock seed data, protected-admin-ready routing, and integration placeholders. Full storefront UI, checkout, authentication, database writes, and live provider integrations are scheduled for later phases.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Update `DATABASE_URL` in `.env` for PostgreSQL or Supabase.

4. Generate Prisma client:

```bash
npm run db:generate
```

5. Run the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000).

## Useful Commands

```bash
npm run dev
npm run build
npm run typecheck
npm run lint
npm run db:generate
npm run db:push
npm run db:seed
```

## Folder Structure

```text
.
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── (auth)/login/
│   │   ├── admin/
│   │   ├── api/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── products/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── admin/
│   │   ├── layout/
│   │   └── ui/
│   ├── constants/
│   ├── lib/
│   │   ├── auth/
│   │   ├── db/
│   │   ├── services/
│   │   └── utils/
│   ├── mock/
│   └── types/
├── .env.example
├── next.config.ts
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## Phase Roadmap

| Phase | Scope | Build expectation |
| --- | --- | --- |
| Phase 0 | Foundation, schema, types, seed data, placeholder routes | Working build |
| Phase 1 | Storefront shell, product listing, responsive navigation | Working catalog UI |
| Phase 2 | Product detail pages, variants, cart, wishlist | Working shopping flow |
| Phase 3 | Checkout, address, coupon, payment/shipping placeholders | Working checkout simulation |
| Phase 4 | Authentication, customer account, order history | Protected customer flows |
| Phase 5 | Admin CRUD for catalog and inventory | Practical admin operations |
| Phase 6 | Orders, shipments, payments, coupons, reviews | Operational back office |
| Phase 7 | CMS, blog, SEO, analytics, audit logs | Growth and governance tools |
| Phase 8 | Provider integrations, search upgrade, production hardening | Launch readiness |

## Database Model Overview

### Access and Identity

- `User`: shared login identity for customers and admins.
- `AdminUser`: admin profile connected to one user.
- `Role` and `Permission`: RBAC foundation for protected admin routes and actions.
- `Customer`: shopper profile with addresses, orders, reviews, wishlist, loyalty, and referrals.
- `Address`: reusable customer address model; orders store address snapshots as JSON for historical accuracy.

### Catalog

- `Product`: supplement product with SEO fields, nutrition facts, ingredients, allergens, usage instructions, warning text, label images, and lab report URL.
- `ProductVariant`: SKU-level sale unit with flavor, size, weight, MRP, selling price, discount, stock, default batch, and expiry.
- `ProductImage`: product and variant image records with ordering and primary image support.
- `Brand`, `Category`, `Collection`: merchandising taxonomy and collection support.

### Inventory and Procurement

- `Warehouse`: physical stock location.
- `Batch`: batch number, supplier, manufacturing date, expiry date, and received date.
- `InventoryItem`: batch and warehouse stock bucket with available, reserved, damaged, expired, and low-stock threshold quantities.
- `StockMovement`: immutable inventory ledger for purchases, sales, returns, adjustments, damage, expiry, and transfers.
- `Supplier`, `PurchaseOrder`, `PurchaseOrderItem`: procurement workflow foundation.

### Commerce

- `Cart`, `CartItem`: customer or anonymous session cart.
- `Order`, `OrderItem`: order lifecycle with pricing, coupon, shipping address snapshot, billing address snapshot, and item snapshots.
- `Payment`: provider-ready payment tracking for Razorpay, Stripe, and Cashfree.
- `Shipment`: courier-ready shipment tracking for Shiprocket, Delhivery, and manual fulfilment.
- `Coupon`: percentage, fixed amount, and free-shipping promotion model.

### Trust, Content, and Growth

- `Review` and `ProductQuestion`: moderation-ready trust content.
- `Wishlist`: customer product saves.
- `BlogPost`, `CMSPage`, `HomepageSection`, `Banner`, `Menu`, `FooterSection`: SEO and CMS foundation.
- `SubscriptionPlan`: recurring purchase-ready product variant plan.
- `LoyaltyPoint` and `Referral`: retention and referral infrastructure.
- `AuditLog`: admin action history for governance.

## Seed and Mock Data

Mock data lives in `src/mock/` and includes:

- Categories
- Brands
- Products
- Product variants
- Product images
- Warehouses
- Suppliers
- Inventory batches and stock buckets
- Customers
- Sample orders
- Homepage banners and sections

The current `prisma/seed.ts` reports the available seed data without writing to a database. Database writes should be enabled after the target PostgreSQL or Supabase environment is confirmed.

## Compliance Note

The product model supports supplement warnings and label transparency. Product copy should avoid medical cure claims. The platform should present supplements as dietary and fitness products, not medical advice or disease-treatment products.

## Phase 13 SEO, Performance, Accessibility, and PWA Notes

- SEO metadata is centralized through `src/lib/seo/seo.ts` for canonical URLs, Open Graph images, Twitter cards, and reusable JSON-LD helpers.
- Product pages emit product, breadcrumb, and FAQ schema placeholders. Listing pages emit breadcrumb and collection schema placeholders.
- `src/app/sitemap.ts` and `src/app/robots.ts` provide framework-native sitemap and robots placeholders.
- The PWA foundation includes `src/app/manifest.ts`, `/offline`, theme metadata, and valid SVG icon/OG placeholders in `public/`.
- Product grids use responsive `next/image` sizes, lazy loading for product cards, and a safe load-more pagination pattern to protect mobile performance.
- The app uses server-rendered route metadata where possible and keeps heavy admin/reporting interfaces behind protected admin routes.
- Mobile UX includes app-like bottom navigation, sticky cart/add-to-cart placement above the nav, touch-friendly controls, and reduced-motion support.
- Accessibility improvements include a skip link, visible focus states, labelled search/forms, dialog semantics, aria-live feedback for cart actions, alt text on product imagery, and reduced-motion CSS.
- Future production performance work should add a real service worker, image CDN policies, route-level analytics, Core Web Vitals monitoring, and database/materialized views for reporting queries.
