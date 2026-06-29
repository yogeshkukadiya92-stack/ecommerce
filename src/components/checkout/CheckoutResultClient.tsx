"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { useMemo } from "react";
import { getLocalOrderByNumber } from "@/lib/orders/localOrders";
import { formatRs } from "@/lib/cart/cartPricing";

export function CheckoutSuccessClient() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order") ?? "";
  const order = useMemo(() => (orderNumber ? getLocalOrderByNumber(orderNumber) : undefined), [orderNumber]);

  return (
    <main className="container-page py-16">
      <section className="mx-auto max-w-2xl rounded-card border border-black/10 bg-white p-6 text-center shadow-card">
        <CheckCircle2 className="mx-auto h-12 w-12 text-forest" />
        <p className="mt-4 text-xs font-black uppercase tracking-[0.14em] text-forest">Order placed</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-ink">Your order is confirmed</h1>
        <p className="mt-3 text-sm leading-6 text-slate">
          {order ? `Order ${order.orderNumber} is ${order.status}.` : "Your mock order has been created."}
        </p>
        {order ? (
          <div className="mt-5 rounded-md bg-mist p-4 text-left text-sm font-semibold text-slate">
            <div className="flex justify-between gap-4">
              <span>Total</span>
              <span className="font-black text-ink">{formatRs(order.totalAmount)}</span>
            </div>
            <div className="mt-2 flex justify-between gap-4">
              <span>Payment</span>
              <span className="font-black text-ink">{order.payment.method.toUpperCase()} / {order.payment.status}</span>
            </div>
          </div>
        ) : null}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link className="focus-ring rounded-md bg-ink px-5 py-3 text-sm font-black text-white" href="/account/orders">
            View orders
          </Link>
          <Link className="focus-ring rounded-md border border-black/10 bg-white px-5 py-3 text-sm font-black text-ink" href="/products">
            Continue shopping
          </Link>
        </div>
      </section>
    </main>
  );
}

export function CheckoutFailureClient() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason") ?? "payment";
  const orderNumber = searchParams.get("order");

  return (
    <main className="container-page py-16">
      <section className="mx-auto max-w-2xl rounded-card border border-black/10 bg-white p-6 text-center shadow-card">
        <XCircle className="mx-auto h-12 w-12 text-coral" />
        <p className="mt-4 text-xs font-black uppercase tracking-[0.14em] text-coral">Order not completed</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-ink">Payment could not be completed</h1>
        <p className="mt-3 text-sm leading-6 text-slate">
          {failureMessage(reason, orderNumber)}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link className="focus-ring rounded-md bg-ink px-5 py-3 text-sm font-black text-white" href="/checkout">
            Retry checkout
          </Link>
          <Link className="focus-ring rounded-md border border-black/10 bg-white px-5 py-3 text-sm font-black text-ink" href="/cart">
            Back to cart
          </Link>
        </div>
      </section>
    </main>
  );
}

function failureMessage(reason: string, orderNumber: string | null) {
  const suffix = orderNumber ? ` Order reference: ${orderNumber}.` : "";

  if (reason.includes("razorpay-verification")) {
    return `We could not verify the Razorpay signature. If money was deducted, support will reconcile it with Razorpay before confirming the order.${suffix}`;
  }

  if (reason.includes("razorpay-payment-failed")) {
    return `Razorpay reported that the payment failed. No successful payment was captured by the store.${suffix}`;
  }

  if (reason.includes("cod")) {
    return `COD order creation failed. Please review the address and try again.${suffix}`;
  }

  return `Failure reason: ${reason}. No successful payment was captured by the store.${suffix}`;
}
