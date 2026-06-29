import type { AddToCartPayload, CartLineItem } from "@/types/cart";

export const CART_STORAGE_KEY = "fitsupplement.cart.v1";
const CART_EVENT_NAME = "fitsupplement:cart";

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function createLineId(payload: Pick<AddToCartPayload, "purchaseType" | "subscriptionFrequency" | "variantId">) {
  return [
    payload.variantId,
    payload.purchaseType,
    payload.subscriptionFrequency ?? "one-time"
  ].join("__");
}

function normalizeCartItem(item: AddToCartPayload | CartLineItem): CartLineItem {
  return {
    ...item,
    lineId: "lineId" in item ? item.lineId : createLineId(item)
  };
}

function writeLocalCartItems(items: CartLineItem[]) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(CART_EVENT_NAME, { detail: items }));
}

export function addLocalCartItem(payload: AddToCartPayload) {
  const existingItems = readLocalCartItems();
  const lineId = createLineId(payload);
  const existingItem = existingItems.find((item) => item.lineId === lineId);
  const nextItems = existingItem
    ? existingItems.map((item) =>
        item.lineId === lineId
          ? { ...item, quantity: Math.min(10, item.quantity + payload.quantity), addedAt: payload.addedAt }
          : item
      )
    : [...existingItems, { ...payload, lineId }];

  writeLocalCartItems(nextItems);
  return nextItems;
}

export function clearLocalCart() {
  writeLocalCartItems([]);
}

export function readLocalCartItems(): CartLineItem[] {
  if (!canUseStorage()) {
    return [];
  }

  const rawCart = window.localStorage.getItem(CART_STORAGE_KEY);

  if (!rawCart) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawCart);
    return Array.isArray(parsed) ? parsed.map(normalizeCartItem) : [];
  } catch {
    return [];
  }
}

export function removeLocalCartItem(lineId: string) {
  const nextItems = readLocalCartItems().filter((item) => item.lineId !== lineId);
  writeLocalCartItems(nextItems);
  return nextItems;
}

export function updateLocalCartItemQuantity(lineId: string, quantity: number) {
  const safeQuantity = Math.max(1, Math.min(10, quantity));
  const nextItems = readLocalCartItems().map((item) =>
    item.lineId === lineId ? { ...item, quantity: safeQuantity } : item
  );
  writeLocalCartItems(nextItems);
  return nextItems;
}

export function subscribeToCartChanges(callback: (items: CartLineItem[]) => void) {
  if (!canUseStorage()) {
    return () => undefined;
  }

  const handler = () => callback(readLocalCartItems());
  window.addEventListener(CART_EVENT_NAME, handler);
  window.addEventListener("storage", handler);

  return () => {
    window.removeEventListener(CART_EVENT_NAME, handler);
    window.removeEventListener("storage", handler);
  };
}
