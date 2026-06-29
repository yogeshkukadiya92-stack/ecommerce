"use client";

import { useEffect, useState } from "react";
import type { AdminSession } from "@/types/admin";
import { getCurrentAdminSession, subscribeToAdminAuth } from "./adminAuth";

export function useAdminSession() {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setSession(getCurrentAdminSession());
    setIsReady(true);
    return subscribeToAdminAuth(setSession);
  }, []);

  return {
    isReady,
    session
  };
}
