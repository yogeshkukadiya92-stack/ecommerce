# Payment Integration Guide

## Current Gateway

Razorpay is the first real online payment gateway. The checkout keeps COD as a separate path and keeps the service layer flexible for Cashfree and Stripe later.

## Environment Variables

Server-only:

```bash
RAZORPAY_KEY_ID="rzp_test_xxxxx"
RAZORPAY_KEY_SECRET="test_secret_xxxxx"
RAZORPAY_WEBHOOK_SECRET="webhook_secret_xxxxx"
RAZORPAY_TEST_MODE="true"
```

Do not expose `RAZORPAY_KEY_SECRET` or `RAZORPAY_WEBHOOK_SECRET` to the frontend. The frontend receives only the public `keyId` returned by the payment initialization API.

## Payment Flow

1. Customer fills checkout address and selects UPI, card, net banking, or wallet.
2. Checkout creates a local pending order snapshot.
3. Frontend calls `POST /api/payments/razorpay/initiate`.
4. Server creates a Razorpay Order using `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.
5. Frontend loads Razorpay Standard Checkout and opens the payment modal.
6. On payment success, frontend calls `POST /api/payments/razorpay/verify`.
7. Server verifies the HMAC signature for `razorpay_order_id|razorpay_payment_id`.
8. Local order payment is marked `paid`, payment id/order id/signature are stored in the local order snapshot, cart is cleared, and the customer is sent to success.
9. On provider failure, local payment is marked `failed` and the customer is sent to the failure page.
10. If the modal is dismissed, the order remains `pending` so the customer can retry.

COD flow does not call Razorpay. It creates a COD order with `cod_pending` payment status.

## API Routes

- `POST /api/payments/razorpay/initiate`
- `POST /api/payments/razorpay/verify`
- `POST /api/webhooks/payments/razorpay`

The webhook handler verifies the Razorpay webhook signature and returns a placeholder response. Persist webhook-driven payment updates when database writes are enabled.

## Test Mode Instructions

1. Create or open a Razorpay test account.
2. Copy test `Key ID` and `Key Secret`.
3. Add them to `.env`.
4. Restart the dev server.
5. Add a product to cart.
6. Fill checkout address.
7. Select UPI, card, net banking, or wallet.
8. Click place order.
9. Use Razorpay test payment details from the Razorpay dashboard/docs.
10. Confirm the success page shows the generated order reference and payment status.
11. Test failure by closing the modal or using a failed test payment.
12. Test COD separately by selecting COD before placing the order.

## Production Notes

- Move order persistence from localStorage to the database before real launch.
- Verify the Razorpay webhook signature before trusting asynchronous payment events.
- Reconcile payments by provider order id and provider payment id.
- Never mark an online order as paid from the client alone.
- Add refund APIs and refund webhook handling before enabling real refunds.
