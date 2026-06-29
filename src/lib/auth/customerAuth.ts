import { customers } from "@/mock/customers";
import type { CustomerSession } from "@/types/auth";

const SESSION_KEY = "fitsupplement.customer.session.v1";
const REGISTERED_USERS_KEY = "fitsupplement.customer.users.v1";

type StoredCustomer = CustomerSession & {
  password: string;
};

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function seedCustomers(): StoredCustomer[] {
  return customers.map((customer) => ({
    createdAt: customer.createdAt,
    customerId: customer.id,
    email: customer.email,
    fullName: `${customer.firstName} ${customer.lastName}`,
    password: "password123",
    phone: customer.phone,
    referralCode: `FIT-${customer.firstName.toUpperCase()}`
  }));
}

function readStoredCustomers() {
  if (!canUseStorage()) {
    return seedCustomers();
  }

  const rawCustomers = window.localStorage.getItem(REGISTERED_USERS_KEY);

  if (!rawCustomers) {
    const seeded = seedCustomers();
    window.localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(seeded));
    return seeded;
  }

  try {
    const parsed = JSON.parse(rawCustomers);
    return Array.isArray(parsed) ? (parsed as StoredCustomer[]) : seedCustomers();
  } catch {
    return seedCustomers();
  }
}

function writeSession(session: CustomerSession) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  window.dispatchEvent(new CustomEvent("fitsupplement:auth", { detail: session }));
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

export function loginCustomer(email: string, password: string) {
  const customer = readStoredCustomers().find(
    (storedCustomer) => storedCustomer.email.toLowerCase() === email.trim().toLowerCase()
  );

  if (!customer || customer.password !== password) {
    return {
      message: "Invalid email or password. Please try again or create a new account.",
      ok: false as const
    };
  }

  const session: CustomerSession = {
    createdAt: customer.createdAt,
    customerId: customer.customerId,
    email: customer.email,
    fullName: customer.fullName,
    phone: customer.phone,
    referralCode: customer.referralCode
  };
  writeSession(session);

  return {
    message: "Logged in successfully.",
    ok: true as const,
    session
  };
}

export function logoutCustomer() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new CustomEvent("fitsupplement:auth"));
}

export function signupCustomer(input: { email: string; fullName: string; password: string; phone?: string }) {
  const existingCustomers = readStoredCustomers();
  const email = input.email.trim().toLowerCase();

  if (existingCustomers.some((customer) => customer.email.toLowerCase() === email)) {
    return {
      message: "An account with this email already exists.",
      ok: false as const
    };
  }

  const session: CustomerSession = {
    createdAt: new Date().toISOString(),
    customerId: `cust-${Date.now()}`,
    email,
    fullName: input.fullName.trim(),
    phone: input.phone,
    referralCode: `FIT-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
  };

  const nextCustomers = [...existingCustomers, { ...session, password: input.password }];
  window.localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(nextCustomers));
  writeSession(session);

  return {
    message: "Account created successfully.",
    ok: true as const,
    session
  };
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
