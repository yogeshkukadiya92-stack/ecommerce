import type { AuthResult, CustomerSession } from "@/types/auth";

const SESSION_KEY = "fitsupplement.customer.session.v1";

type AuthApiResponse = {
  message?: string;
  session?: CustomerSession;
};

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function writeSession(session: CustomerSession) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  window.dispatchEvent(new CustomEvent("fitsupplement:auth", { detail: session }));
}

async function submitAuthRequest(path: "/api/auth/login" | "/api/auth/signup", body: Record<string, string | undefined>): Promise<AuthResult> {
  const response = await fetch(path, {
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
    method: "POST"
  });
  const result = (await response.json().catch(() => ({}))) as AuthApiResponse;

  if (!response.ok || !result.session) {
    return {
      message: result.message ?? "Authentication failed. Please try again.",
      ok: false
    };
  }

  writeSession(result.session);

  return {
    message: result.message ?? "Authentication successful.",
    ok: true,
    session: result.session
  };
}

export function getCurrentCustomerSession(): CustomerSession | null {
  if (!canUseStorage()) {
    return null;
  }

  const rawSession = window.localStorage.getItem(SESSION_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession) as CustomerSession;
  } catch {
    return null;
  }
}

export async function loginCustomer(email: string, password: string) {
  return submitAuthRequest("/api/auth/login", { email, password });
}

export function logoutCustomer() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new CustomEvent("fitsupplement:auth"));
}

export async function signupCustomer(input: { email: string; fullName: string; password: string; phone?: string }) {
  return submitAuthRequest("/api/auth/signup", input);
}

export function subscribeToAuthChanges(callback: (session: CustomerSession | null) => void) {
  if (!canUseStorage()) {
    return () => undefined;
  }

  const handler = () => callback(getCurrentCustomerSession());
  window.addEventListener("fitsupplement:auth", handler);
  window.addEventListener("storage", handler);

  return () => {
    window.removeEventListener("fitsupplement:auth", handler);
    window.removeEventListener("storage", handler);
  };
}
