# Deployment Guide

## Production Environment Checklist

Required:

- `NODE_ENV=production`
- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_HIDE_SEEDED_ADMIN_DATA=false`
- `DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_SESSION_COOKIE_NAME`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_NAME`
- `ADMIN_SESSION_TIMEOUT_MINUTES`
- `RATE_LIMIT_ENABLED=true`

Payment provider configuration:

- Razorpay: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `RAZORPAY_TEST_MODE`
- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- Cashfree: `CASHFREE_APP_ID`, `CASHFREE_SECRET_KEY`

Shipping provider configuration:

- Shiprocket: `SHIPROCKET_EMAIL`, `SHIPROCKET_PASSWORD`
- Delhivery: `DELHIVERY_API_TOKEN`

Storage:

- `STORAGE_PROVIDER`
- `S3_BUCKET`
- `S3_REGION`
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`

Search:

- `SEARCH_PROVIDER`
- `ALGOLIA_APP_ID`
- `ALGOLIA_ADMIN_API_KEY`

Communication:

- Email: `EMAIL_PROVIDER`, SMTP variables
- SMS: `SMS_PROVIDER`, `SMS_API_KEY`
- WhatsApp: `WHATSAPP_PROVIDER`, `WHATSAPP_ACCESS_TOKEN`

Monitoring and backup:

- `SENTRY_DSN`
- `ANALYTICS_PROVIDER`
- `GA_MEASUREMENT_ID`
- `BACKUP_PROVIDER`
- `BACKUP_BUCKET`

## Database Setup Instructions

1. Create a MongoDB database in Railway, MongoDB Atlas, Render, DigitalOcean, AWS, or another managed provider.
2. Set `DATABASE_URL` in the deployment provider.
   - Railway MongoDB with root credentials should usually include the app database and auth source:

```env
DATABASE_URL="mongodb://USER:PASSWORD@HOST:27017/fitsupplement_store?authSource=admin"
```

3. Generate Prisma client during build:

```bash
npm run db:generate
```

4. For initial schema setup, use:

```bash
npm run db:push
```

5. Prisma MongoDB uses `db push`; do not run destructive reset commands against production.

## Seed Data Instructions

Local development only:

```bash
npm run db:seed
```

Do not run `npm run db:seed` against production unless the seed file has been reviewed and contains only real launch data.

## Build and Start

```bash
npm install
npm run lint
npm run typecheck
npm test
npm run build
npm run start
```

## Admin Credentials

Set the admin credentials in the deployment provider:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_NAME`

Production requirements:

- Rotate all admin credentials after first deployment.
- Rotate all secrets after deployment.
- Enable 2FA before sharing admin access.

## Security Checklist

- Do not commit admin credentials to the repository.
- Use HTTPS-only cookies.
- Set strong `AUTH_SECRET`.
- Enable server-side RBAC middleware for protected admin routes.
- Add rate limiting for auth, checkout, coupon, and webhook routes.
- Verify payment and shipping webhook signatures.
- Validate uploaded file MIME type, extension, size, and scan result.
- Mask customer phone, email, and payment identifiers in admin logs.
- Restrict database access by environment and IP where possible.
- Run dependency audit before launch.

## Backup Checklist

- Enable automated database backups.
- Confirm point-in-time recovery window.
- Store backup credentials outside the app runtime.
- Test restore into a staging database.
- Back up uploaded labels, lab reports, invoices, and CMS media.
- Define retention for audit logs and order records.

## Monitoring Checklist

- Add error tracking through `SENTRY_DSN` or equivalent.
- Add uptime checks for `/api/health`.
- Monitor checkout, payment webhook, and shipping webhook errors.
- Track Core Web Vitals.
- Track failed admin logins and rate-limit events.
- Alert on low stock, expiring batches, and failed order fulfillment.

## Payment Gateway Integration Checklist

- Use Razorpay test mode first.
- Create Razorpay orders only from server routes.
- Verify `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature` on the server.
- Keep `RAZORPAY_KEY_SECRET` and `RAZORPAY_WEBHOOK_SECRET` out of frontend code.
- Verify order amount server-side.
- Verify webhook signatures.
- Confirm success, failure, timeout, refund, and COD flows.
- Reconcile captured payment IDs with orders.
- Mask payment identifiers in admin UI and audit logs.

## Shipping Gateway Integration Checklist

- Verify pincode serviceability.
- Create shipment labels in test mode.
- Save carrier, AWB/tracking number, status, and estimated delivery.
- Handle NDR, RTO, delivered, and lost/damaged events.
- Sync shipment timeline into order timeline.

## Email/SMS/WhatsApp Integration Checklist

- Confirm transactional templates for order confirmation, shipping, delivery, review request, and subscription renewal.
- Add unsubscribe and preference controls for marketing messages.
- Queue messages and retry failed sends.
- Log delivery status without storing sensitive message payloads unnecessarily.
