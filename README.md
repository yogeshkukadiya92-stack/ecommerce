# FitSupplement Store

Premium full-stack ecommerce web app for health supplements, protein powders, performance nutrition, vitamins, shakers, and fitness accessories.

The project includes a customer storefront, product discovery, product detail pages, cart, checkout, customer account, protected admin panel, catalog management, advanced inventory, order fulfillment workflows, CMS/Website Studio, promotions, reviews, CRM, compliance, analytics, SEO, PWA readiness, and automated tests.

## Quick Start

```bash
npm install
cp .env.example .env
npm run db:generate
npm run dev
```

Open `http://localhost:3000`.

Configure admin access with environment variables before signing in:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_NAME`

## Useful Commands

```bash
npm run dev
npm run lint
npm run typecheck
npm test
npm run build
npm run start
npm run db:generate
npm run db:push
npm run db:seed
```

## Folder Structure

```text
.
|-- docs/
|   |-- DEPLOYMENT.md
|   |-- LAUNCH_CHECKLIST.md
|   |-- PAYMENTS.md
|   |-- SHIPPING.md
|   `-- TEST_REPORT.md
|-- prisma/
|   |-- schema.prisma
|   `-- seed.ts
|-- public/
|   |-- icons/
|   `-- og/
|-- src/
|   |-- app/
|   |   |-- (auth)/
|   |   |-- account/
|   |   |-- admin/
|   |   |-- api/
|   |   |-- blog/
|   |   |-- cart/
|   |   |-- checkout/
|   |   |-- collections/
|   |   |-- products/
|   |   |-- robots.ts
|   |   `-- sitemap.ts
|   |-- components/
|   |   |-- admin/
|   |   |-- cart/
|   |   |-- checkout/
|   |   |-- cms/
|   |   |-- layout/
|   |   |-- storefront/
|   |   `-- ui/
|   |-- constants/
|   |-- lib/
|   |   |-- admin/
|   |   |-- auth/
|   |   |-- cart/
|   |   |-- cms/
|   |   |-- compliance/
|   |   |-- inventory/
|   |   |-- orders/
|   |   |-- promotions/
|   |   |-- reports/
|   |   |-- seo/
|   |   `-- services/
|   |-- mock/
|   `-- types/
|-- .env.example
|-- next.config.ts
|-- package.json
|-- tailwind.config.ts
`-- tsconfig.json
```

## Test Coverage

Automated tests live beside business services:

- `src/lib/cart/cartPricing.test.ts`
- `src/lib/inventory/fefo.test.ts`
- `src/lib/inventory/stockService.test.ts`
- `src/lib/orders/orderOpsService.test.ts`
- `src/lib/services/shipping.test.ts`

They cover coupon validation, cart totals, FEFO reservation, stock adjustment movement records, purchase order receiving, order status transitions, split-batch reservation, shipping payloads/status mapping, and cancellation.

Run:

```bash
npm test
```

## Phase Roadmap

| Phase | Scope | Status |
| --- | --- | --- |
| 0 | Foundation, models, seed data, launch configuration | Complete |
| 1 | Design system and layouts | Complete |
| 2 | Homepage, listings, filters, search | Complete |
| 3 | Product detail page and variants | Complete |
| 4 | Cart, checkout, auth, customer account | Complete |
| 5 | Admin dashboard and catalog management | Complete |
| 6 | Advanced inventory, batches, FEFO | Complete |
| 7 | Admin orders, fulfillment, returns, refunds | Complete |
| 8 | CMS and Website Studio | Complete |
| 9 | Promotions, coupons, loyalty, referral, subscriptions | Complete |
| 10 | Reviews, Q&A, CRM, marketing automation | Complete |
| 11 | Compliance, RBAC, audit logs, safety checks | Complete |
| 12 | Analytics and reporting | Complete |
| 13 | SEO, performance, accessibility, PWA readiness | Complete |
| 14 | Testing, bug fixes, deployment docs | Complete |

## Database Model Overview

- Identity and access: `User`, `AdminUser`, `Role`, `Permission`, `Customer`, `Address`.
- Catalog: `Product`, `ProductVariant`, `ProductImage`, `Brand`, `Category`, `Collection`.
- Inventory: `Warehouse`, `Batch`, `InventoryItem`, `StockMovement`, `Supplier`, `PurchaseOrder`, `PurchaseOrderItem`.
- Commerce: `Cart`, `CartItem`, `Order`, `OrderItem`, `Payment`, `Shipment`, `Coupon`.
- Trust and content: `Review`, `ProductQuestion`, `Wishlist`, `BlogPost`, `CMSPage`, `HomepageSection`, `Banner`, `Menu`, `FooterSection`.
- Growth and governance: `SubscriptionPlan`, `LoyaltyPoint`, `Referral`, `AuditLog`.

## Production Docs

- Deployment guide: `docs/DEPLOYMENT.md`
- Launch checklist: `docs/LAUNCH_CHECKLIST.md`
- Payment integration guide: `docs/PAYMENTS.md`
- Shipping integration guide: `docs/SHIPPING.md`
- Phase 14 test report: `docs/TEST_REPORT.md`

## Compliance Note

Product copy must avoid disease cure claims. The platform should present supplements as fitness and dietary products, not medical advice or disease-treatment products. Product pages include responsible warnings and “Not for medicinal use” messaging.
