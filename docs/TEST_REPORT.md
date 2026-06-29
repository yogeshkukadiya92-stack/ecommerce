# Phase 14 Test Report

## Automated Tests Added

- Coupon validation and cart total calculation.
- Inventory FEFO reservation.
- Manual stock adjustment validation and movement creation.
- Purchase order stock receiving.
- Order status timeline updates.
- FEFO split-batch reservation.
- Shipment and cancellation stock updates from exact batch allocations.

Run:

```bash
npm test
```

## Manual QA Scope

Customer-facing:

- Homepage.
- Product listing.
- Filters.
- Search.
- Product detail page.
- Variant selection.
- Add to cart.
- Cart update/remove.
- Checkout.
- Order creation.
- Customer account pages.

Admin:

- Admin login.
- Product create/edit UI.
- Inventory batch creation UI.
- Stock adjustment UI.
- Purchase order UI.
- Order fulfillment UI.
- CMS homepage change UI.
- Coupon management and cart coupon application.

Responsive:

- Desktop storefront.
- Mobile product detail with sticky CTA.
- Desktop admin.
- Mobile admin shell.

## Bugs Fixed During Phase 14

- Added split-batch FEFO allocations to admin order items so fulfillment, cancellation, and returns update exact batches.
- Updated order management UI to display multiple batch allocations.
- Updated compliance recall lookup to detect orders affected through split-batch allocations.
- Added automated tests around coupon, FEFO, stock movement, and order lifecycle rules.
- Expanded production environment checklist and launch documentation.

## Known Launch Blockers Before Real Production

- Replace localStorage mock customer/admin auth with persistent server-backed auth.
- Disable local mock admin login.
- Connect real PostgreSQL migrations and write-based seed flow.
- Connect payment gateways and verify signed webhooks.
- Connect shipping providers and verify tracking callbacks.
- Connect production storage for images, labels, lab reports, invoices, and CMS media.
- Connect email/SMS/WhatsApp providers.
- Add real service worker if full offline PWA behavior is required.
