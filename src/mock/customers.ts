import type { Customer } from "@/types";

const now = "2026-06-29T00:00:00.000Z";

export const customers: Customer[] = [
  {
    id: "cust-aarav",
    firstName: "Aarav",
    lastName: "Mehta",
    email: "aarav.mehta@example.com",
    phone: "+91 98765 43210",
    loyaltyPoints: 420,
    addresses: [
      {
        id: "addr-aarav-home",
        customerId: "cust-aarav",
        label: "home",
        firstName: "Aarav",
        lastName: "Mehta",
        phone: "+91 98765 43210",
        line1: "A-1204, Green Heights",
        city: "Mumbai",
        state: "Maharashtra",
        postalCode: "400076",
        country: "India",
        isDefaultShipping: true,
        isDefaultBilling: true,
        createdAt: now,
        updatedAt: now
      }
    ],
    createdAt: now,
    updatedAt: now
  },
  {
    id: "cust-nisha",
    firstName: "Nisha",
    lastName: "Rao",
    email: "nisha.rao@example.com",
    phone: "+91 99887 76655",
    loyaltyPoints: 150,
    addresses: [
      {
        id: "addr-nisha-home",
        customerId: "cust-nisha",
        label: "home",
        firstName: "Nisha",
        lastName: "Rao",
        phone: "+91 99887 76655",
        line1: "42, Residency Road",
        city: "Bengaluru",
        state: "Karnataka",
        postalCode: "560025",
        country: "India",
        isDefaultShipping: true,
        isDefaultBilling: true,
        createdAt: now,
        updatedAt: now
      }
    ],
    createdAt: now,
    updatedAt: now
  }
];
