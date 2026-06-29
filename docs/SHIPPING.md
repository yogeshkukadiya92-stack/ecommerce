# Shipping Integration

FitSupplement Store ships through a server-side shipping service layer. Shiprocket is the first live provider; Delhivery, BlueDart, and manual fulfillment stay behind the same admin workflow.

## Shiprocket Flow

1. Admin opens `Admin > Orders`.
2. Admin clicks `Live pincode check` to validate pickup and delivery pincode serviceability.
3. Admin selects `Shiprocket` and clicks `Assign courier`.
4. The browser calls `/api/shipping/shiprocket/create-shipment`.
5. The server logs in to Shiprocket with secret credentials, creates an adhoc order, attempts AWB assignment, and attempts label generation.
6. The sanitized shipment snapshot is returned to the admin UI:
   - `shipmentId`
   - `providerOrderId`
   - `courierName`
   - `awbCode`
   - `trackingNumber`
   - `labelUrl`
   - `status`
7. The order timeline records courier assignment.
8. Admin can click `Fetch tracking`, which calls `/api/shipping/shiprocket/tracking`.
9. Tracking status updates the shipment and order timeline. NDR/RTO handling remains placeholder-ready for webhook or scheduled polling.

## Environment Variables

```bash
SHIPROCKET_API_BASE="https://apiv2.shiprocket.in/v1/external"
SHIPROCKET_EMAIL=""
SHIPROCKET_PASSWORD=""
SHIPROCKET_PICKUP_LOCATION=""
SHIPROCKET_DEFAULT_WEIGHT_KG="0.5"
SHIPROCKET_CHANNEL_ID=""
SHIPROCKET_WEBHOOK_SECRET=""
DELHIVERY_API_TOKEN=""
```

Only server routes read these values. Do not expose Shiprocket credentials with `NEXT_PUBLIC_` variables.

## API Routes

- `POST /api/shipping/shiprocket/serviceability`
- `POST /api/shipping/shiprocket/create-shipment`
- `POST /api/shipping/shiprocket/tracking`
- `POST /api/webhooks/shipping/shiprocket`

When Shiprocket credentials are missing, the service returns safe local placeholders so admin fulfillment can still be tested.

## Testing

1. Add Shiprocket test credentials to `.env`.
2. Set the pickup location exactly as configured in Shiprocket.
3. Run `npm run dev`.
4. Open `/admin/orders`.
5. Select an order and run `Live pincode check`.
6. Click `Assign courier`.
7. Confirm Shipment ID/AWB/courier metadata appears in the fulfillment panel.
8. Click `Fetch tracking`.

Use Shiprocket sandbox/test account data where available. Do not create production labels while testing.

## Extension Points

- `src/lib/services/shipping.ts` owns provider adapters and status mapping.
- `src/app/api/shipping/shiprocket/*` keeps provider calls server-side.
- `src/types/orderOps.ts` stores provider-agnostic shipment metadata.
- `src/components/admin/OrderManagementClient.tsx` controls the admin workflow.

Delhivery and BlueDart can be added by implementing provider-specific adapters that return the same shipment snapshot shape.
