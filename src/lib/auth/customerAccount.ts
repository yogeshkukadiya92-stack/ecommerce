import type { Customer, User } from "@prisma/client";
import type { CustomerSession } from "@/types/auth";

export function createCustomerSession(user: User & { customer: Customer | null }): CustomerSession {
  const customer = user.customer;
  const fullName = customer ? `${customer.firstName} ${customer.lastName}`.trim() : user.email;

  return {
    createdAt: (customer?.createdAt ?? user.createdAt).toISOString(),
    customerId: customer?.id ?? user.id,
    email: customer?.email ?? user.email,
    fullName,
    phone: customer?.phone ?? user.phone ?? undefined,
    referralCode: `FIT-${(customer?.id ?? user.id).slice(-6).toUpperCase()}`
  };
}

export function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const firstName = parts[0] ?? "Customer";
  const lastName = parts.slice(1).join(" ") || "Account";

  return { firstName, lastName };
}
