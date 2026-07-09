# Demo-To-Live Interaction Inventory

Generated during the live wiring pass on 2026-07-09.

## Critical Live Surfaces

| Area | Control / Interaction | File / Route | Current Behavior Found | Intended Live Behavior | Dependency | Status |
|---|---|---|---|---|---|---|
| Storefront header | Logo, shop, collections, guides, account, wishlist, cart links | `src/components/storefront/Header.tsx`, `MobileHeader.tsx`, `Footer.tsx` | Real Next routes | Navigate to storefront/account/cart/pages | Next routes | Wired |
| Storefront search | Search inputs and suggestions | `src/components/storefront/SearchBar.tsx`, `src/app/search/page.tsx` | Client search over catalog data | Return matching products and route to search | Product catalog API/mock fallback | Wired |
| Product listing | Filters, sort, product cards, wishlist/compare, add to cart, buy now | `src/components/storefront/ProductListingShell.tsx`, `ProductCard.tsx` | Filters/sort live in UI; cart writes local cart; buy now routes checkout | Browse/filter products, add line item, direct checkout | Local cart, checkout route | Wired |
| Product detail | Variant selection, quantity, pincode check, add to cart, buy now, reviews/Q&A UI | `src/components/storefront/ProductDetailClient.tsx` | Cart actions wired; review/Q&A are local/demo in detail page | Add/buy selected variant; review submission needs live API | Local cart, checkout, future reviews API | Partially wired |
| Cart | Quantity, remove, clear, bundle add, coupon, checkout | `src/components/cart/CartClient.tsx` | Local cart persists; coupon logic local | Cart persists locally and can proceed to checkout | Local storage, promotions service | Wired |
| Checkout | Address, delivery method, online payment methods, place order | `src/components/checkout/CheckoutClient.tsx` | Razorpay path wired; COD removed | Create pending order, open Razorpay, verify payment, persist order | Razorpay env, orders API, local cart | Wired; blocked by payment secrets if unset |
| Customer auth | Login/signup forms | `src/components/auth/AuthFormClient.tsx`, `/api/auth/*` | API-backed auth | Create/login customer account | MongoDB, password hashing | Wired |
| Customer account | Orders, profile sections, addresses/rewards/subscriptions tabs | `src/components/account/AccountClients.tsx` | Reads local orders and mock profile sections | Live account area should read DB customer profile and orders | Customer session, account APIs | Needs live account APIs |
| Attendance | Attendance form submit | `src/components/attendance/AttendanceClient.tsx`, `/api/attendance` | API-backed save | Persist attendance/lead record | MongoDB | Wired |
| Admin login/settings | Login, recover password, change password, create admin | `AdminLoginClient.tsx`, `AdminAccessSettingsClient.tsx`, `/api/admin/access*` | API-backed with session header for protected access | Authenticate and manage admins | Admin env/database, admin session | Wired |
| Admin dashboard | Metrics, recent orders, top products | `AdminDashboardClient.tsx`, `/api/admin/orders`, `/api/admin/customers` | Live fetches now send admin session | Show live metrics/orders/customers | Admin session, MongoDB | Wired in this pass |
| Admin catalog | Product templates, add/edit/delete product, upload images | `CatalogManagementClient.tsx`, product/template/media APIs | Live CRUD existed; backend auth missing | Authenticated catalog CRUD and media upload | Admin session, MongoDB | Wired in this pass |
| Admin inventory | Search, stock edit/save | `InventoryManagementClient.tsx`, `/api/admin/inventory` | Live stock update existed; backend auth missing | Authenticated stock read/update | Admin session, MongoDB | Wired in this pass |
| Admin orders | Search/filter, expand details, update status | `OrderManagementClient.tsx`, `/api/admin/orders*` | Live order read/update existed; backend auth missing | Authenticated order read/status update | Admin session, MongoDB | Wired in this pass |
| Admin customers | Search customer list | `CustomerCrmClient.tsx`, `/api/admin/customers` | Live customer list existed; backend auth missing | Authenticated customer list and totals | Admin session, MongoDB | Wired in this pass |
| Admin leads | Search/filter, add lead, export CSV | `LeadManagementClient.tsx`, `/api/admin/leads` | Live lead save/list existed; backend auth missing | Authenticated lead list/save; CSV client export | Admin session, MongoDB | Wired in this pass |
| Admin coupons | Create/toggle/delete coupon | `PromotionsManagementClient.tsx`, `/api/admin/coupons*` | Live coupon CRUD existed; backend auth missing | Authenticated coupon CRUD | Admin session, MongoDB | Wired in this pass |
| Admin reviews | Approve/reject reviews | `ReviewsModerationClient.tsx`, `/api/admin/reviews` | Live review moderation existed; backend auth missing | Authenticated review read/moderation | Admin session, MongoDB | Wired in this pass |
| Admin analytics | Live metrics and top products | `AnalyticsDashboardClient.tsx`, `/api/admin/analytics` | Live fetch existed; backend auth missing | Authenticated analytics | Admin session, MongoDB | Wired in this pass |
| Admin compliance | Product compliance readout | `ComplianceManagementClient.tsx`, `/api/admin/products` | Live product compliance read existed; backend auth missing | Authenticated compliance product read | Admin session, MongoDB | Wired in this pass |
| Admin marketing | Audience/channel readiness | `MarketingAutomationClient.tsx`, analytics/leads APIs | Live audience stats existed; backend auth missing; providers not connected | Authenticated audience stats; provider integration later | Admin session, email/SMS/WhatsApp secrets | Partially wired; provider secrets needed |
| Admin website editor | CMS section editing and image upload | `WebsiteStudioClient.tsx`, CMS local storage/repository | Draft editing mostly local/client-side | Persist homepage/content drafts and publish | CMS APIs/storage | Partially wired |
| Admin security | RBAC display, audit-logged control actions, upload validation | `SecurityManagementClient.tsx` | Audit log is local storage; controls are audit markers | Backend-backed security settings/actions | Admin settings APIs | Partially wired |

## Backend Permission Wiring Added

| API | Permission |
|---|---|
| `GET /api/admin/overview` | `dashboard:read` |
| `GET /api/admin/analytics` | `analytics:read` |
| `GET /api/admin/products` | `catalog:read` |
| `POST /api/admin/products` | `product:create` |
| `PATCH /api/admin/products/:productId` | `product:edit` |
| `DELETE /api/admin/products/:productId` | `product:delete` |
| `GET /api/admin/product-templates` | `catalog:read` |
| `POST /api/admin/product-templates` | `catalog:write` |
| `DELETE /api/admin/product-templates/:id` | `catalog:write` |
| `POST /api/admin/media` | `catalog:write` |
| `GET /api/admin/inventory` | `inventory:read` |
| `PATCH /api/admin/inventory` | `stock:adjust` |
| `GET /api/admin/orders` | `orders:read` |
| `PATCH /api/admin/orders/:id` | `orders:write` |
| `GET /api/admin/customers` | `customers:read` |
| `GET /api/admin/leads` | `customers:read` |
| `POST /api/admin/leads` | `customers:read` |
| `GET /api/admin/coupons` | `coupon:create` |
| `POST /api/admin/coupons` | `coupon:create` |
| `PATCH /api/admin/coupons/:id` | `coupon:create` |
| `DELETE /api/admin/coupons/:id` | `coupon:create` |
| `GET /api/admin/reviews` | `customers:read` |
| `PATCH /api/admin/reviews` | `orders:write` |

## Remaining Live Wiring Backlog

| Area | Remaining Work | Status |
|---|---|---|
| Customer account | Replace mock/customer local sections with database-backed customer profile, addresses, reviews, subscriptions, loyalty, and referrals APIs. | Needs implementation |
| Product reviews/Q&A storefront | Add customer-facing POST APIs for reviews/questions, require customer identity, and refresh moderation queue. | Needs implementation |
| CMS/Website editor | Move website studio drafts from local storage to authenticated database APIs and publish workflow. | Needs implementation |
| Marketing automation | Connect email/SMS/WhatsApp providers using env vars and persist automation rules. | Blocked by provider choice/secrets |
| Security controls | Replace audit-only buttons with real 2FA/session/rate-limit settings where product decisions exist. | Needs product decisions |
| Shipping labels/tracking | Shiprocket fallbacks exist; production labels/tracking require Shiprocket env vars. | Blocked by secrets |
| Payments | Razorpay integration exists; production payment capture requires Razorpay env vars and webhook secret. | Blocked by secrets |

