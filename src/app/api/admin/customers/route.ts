import { NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/admin/apiAuth";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: Request) {
  const auth = requireAdminPermission(request, "customers:read");

  if (auth.response) {
    return auth.response;
  }

  const [customers, users] = await Promise.all([
    prisma.customer.findMany({
      include: {
        orders: {
          select: {
            status: true,
            totalAmount: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 500
    }),
    prisma.user.findMany({
      orderBy: {
        createdAt: "desc"
      },
      select: {
        adminUser: {
          select: {
            id: true
          }
        },
        createdAt: true,
        email: true,
        status: true
      },
      take: 500
    })
  ]);

  const customerEmails = new Set(customers.map((customer) => customer.email));

  return NextResponse.json({
    data: {
      customers: customers.map((customer) => ({
        createdAt: customer.createdAt.toISOString(),
        email: customer.email,
        id: customer.id,
        name: `${customer.firstName} ${customer.lastName}`.trim().replace(/ -$/, ""),
        orderCount: customer.orders.length,
        phone: customer.phone ?? "-",
        totalSpent: customer.orders
          .filter((order) => order.status !== "CANCELLED" && order.status !== "REFUNDED")
          .reduce((total, order) => total + order.totalAmount, 0)
      })),
      registeredUsers: users
        .filter((user) => !user.adminUser && !customerEmails.has(user.email))
        .map((user) => ({
          createdAt: user.createdAt.toISOString(),
          email: user.email,
          status: user.status
        }))
    }
  });
}
