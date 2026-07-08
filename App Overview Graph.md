# The Complete Health App Overview

![[attachments/tch-app-overview.svg]]

## One-Page App Graph

```mermaid
flowchart LR
  Visitor["Visitors / Members"] --> Storefront["Public Website"]
  Visitor --> Attendance["Attendance Page"]
  Admin["Admin / Owner"] --> AdminPanel["Admin Panel"]

  Storefront --> ProductPages["Products, Categories, Blog, Cart, Checkout"]
  Attendance --> AttendanceAPI["/api/attendance"]
  AdminPanel --> Leads["WhatsApp Leads"]
  AdminPanel --> Ops["Catalog, Inventory, Orders, Customers"]
  AdminPanel --> Growth["Coupons, Marketing, Reviews"]
  AdminPanel --> Content["CMS, Website Editor, Analytics"]

  Leads --> LeadsAPI["/api/admin/leads"]
  Ops --> AdminAPI["Admin APIs"]
  Growth --> AdminAPI
  Content --> AdminAPI

  AttendanceAPI --> MongoDB[("MongoDB")]
  LeadsAPI --> MongoDB
  AdminAPI --> MongoDB

  MongoDB --> Prisma["Prisma Models"]
  Prisma --> LeadModel["WhatsAppLead"]
  Prisma --> AttendanceModel["AttendanceEntry"]
  Prisma --> CommerceModels["Products, Customers, Orders, Inventory"]

  Payments["Razorpay / Stripe"] -. future/live config .-> Checkout["Checkout"]
  Shipping["Shiprocket / Delhivery"] -. future/live config .-> Orders["Order Fulfillment"]
  Checkout --> MongoDB
  Orders --> MongoDB
```

## Short Explanation

- **Public Website**: Customers browse products, blog, cart, and checkout.
- **Attendance Page**: Members submit attendance by mobile number. It saves to MongoDB.
- **WhatsApp Leads**: Admin can save/search/export WhatsApp group contacts.
- **Admin Panel**: Owner controls catalog, inventory, orders, CRM, coupons, reviews, marketing, CMS, analytics, and security.
- **MongoDB + Prisma**: Main database layer for live data.
- **External Services**: Payments and shipping are ready to connect with provider credentials.

## Current Working Core

- Admin login
- Attendance page
- WhatsApp leads
- Admin dashboard and modules
- MongoDB connection
- Prisma schema

