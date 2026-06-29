"use client";

import { useEffect, useState } from "react";
import type { CustomerSession } from "@/types/auth";
import { getCurrentCustomerSession, subscribeToAuthChanges } from "./customerAuth";

export function useCustomerSession() {
  const [session, setSession] = useState<CustomerSession | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setSession(getCurrentCustomerSession());
    setIsReady(true);
    return subscribeToAuthChanges(setSession);
  }, []);

  return {
    isReady,
    session
  };
}
