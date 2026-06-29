"use client";

import { useEffect, useMemo, useState } from "react";
import type { AddToCartPayload, CartLineItem } from "@/types/cart";
import {
  addLocalCartItem,
  clearLocalCart,
  readLocalCartItems,
  removeLocalCartItem,
  subscribeToCartChanges,
  updateLocalCartItemQuantity
} from "./localCart";

export function useCart() {
  const [items, setItems] = useState<CartLineItem[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setItems(readLocalCartItems());
    setIsReady(true);
    return subscribeToCartChanges(setItems);
  }, []);

  return useMemo(
    () => ({
      addItem: (payload: AddToCartPayload) => setItems(addLocalCartItem(payload)),
      clearCart: () => {
        clearLocalCart();
        setItems([]);
      },
      isReady,
      items,
      removeItem: (lineId: string) => setItems(removeLocalCartItem(lineId)),
      updateQuantity: (lineId: string, quantity: number) =>
        setItems(updateLocalCartItemQuantity(lineId, quantity))
    }),
    [isReady, items]
  );
}
