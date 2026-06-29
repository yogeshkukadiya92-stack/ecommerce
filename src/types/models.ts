export type ID = string;

export type CurrencyCode = "INR" | "USD";
export type PaymentProvider = "razorpay" | "stripe" | "cashfree";
export type ShippingProvider = "shiprocket" | "delhivery" | "manual";
export type ProductStatus = "draft" | "active" | "archived";
export type OrderStatus =
  | "pending"
  | "paid"
  | "confirmed"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned"
  | "refunded";
export type PaymentStatus = "pending" | "authorized" | "paid" | "failed" | "refunded";
export type ShipmentStatus = "pending" | "ready_to_ship" | "in_transit" | "delivered" | "returned";
export type CouponType = "percentage" | "fixed_amount" | "free_shipping";
export type StockMovementType =
  | "purchase"
  | "sale"
  | "return"
  | "adjustment"
  | "damage"
  | "expiry"
  | "transfer";
export type PermissionKey =
  | "catalog:read"
  | "catalog:write"
  | "inventory:read"
  | "inventory:write"
  | "orders:read"
  | "orders:write"
  | "customers:read"
  | "content:write"
  | "analytics:read"
  | "settings:write";

export interface BaseEntity {
  id: ID;
  createdAt: string;
  updatedAt: string;
}

export interface Permission extends BaseEntity {
  key: PermissionKey;
  name: string;
  description?: string;
}

export interface Role extends BaseEntity {
  name: string;
  description?: string;
  permissions: Permission[];
}

export interface User extends BaseEntity {
  email: string;
  phone?: string;
  passwordHash?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  status: "active" | "disabled";
}

export interface AdminUser extends BaseEntity {
  userId: ID;
  name: string;
  avatarUrl?: string;
  roles: Role[];
  lastLoginAt?: string;
}

export interface Customer extends BaseEntity {
  userId?: ID;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  addresses: Address[];
  loyaltyPoints: number;
}

export interface Address extends BaseEntity {
  customerId: ID;
  label: "home" | "work" | "other";
  firstName: string;
  lastName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
}

export interface NutritionFact {
  name: string;
  amount: string;
  dailyValuePercent?: number;
}

export interface Product extends BaseEntity {
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  brandId: ID;
  categoryIds: ID[];
  collectionIds: ID[];
  status: ProductStatus;
  goalTags: string[];
  nutritionFacts: NutritionFact[];
  ingredients: string[];
  allergens: string[];
  usageInstructions: string;
  warningText: string;
  labelImageUrls: string[];
  labReportUrl?: string;
  images: ProductImage[];
  variants: ProductVariant[];
  seoTitle?: string;
  seoDescription?: string;
}

export interface ProductVariant extends BaseEntity {
  productId: ID;
  sku: string;
  flavor?: string;
  size?: string;
  weightInGrams: number;
  mrp: number;
  sellingPrice: number;
  discountPercent: number;
  currency: CurrencyCode;
  stock: number;
  batchId?: ID;
  expiryDate?: string;
  isActive: boolean;
}

export interface ProductImage extends BaseEntity {
  productId: ID;
  variantId?: ID;
  url: string;
  altText: string;
  position: number;
  isPrimary: boolean;
}

export interface Brand extends BaseEntity {
  slug: string;
  name: string;
  description: string;
  logoUrl?: string;
  isActive: boolean;
}

export interface Category extends BaseEntity {
  slug: string;
  name: string;
  description: string;
  parentId?: ID;
  imageUrl?: string;
  isActive: boolean;
}

export interface Collection extends BaseEntity {
  slug: string;
  name: string;
  description: string;
  productIds: ID[];
  isActive: boolean;
}

export interface Warehouse extends BaseEntity {
  code: string;
  name: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  isActive: boolean;
}

export interface Batch extends BaseEntity {
  batchNumber: string;
  productVariantId: ID;
  supplierId?: ID;
  manufacturedAt?: string;
  expiryDate: string;
  receivedAt: string;
}

export interface InventoryItem extends BaseEntity {
  productVariantId: ID;
  warehouseId: ID;
  batchId: ID;
  batchNumber: string;
  expiryDate: string;
  availableStock: number;
  reservedStock: number;
  damagedStock: number;
  expiredStock: number;
  lowStockThreshold: number;
}

export interface StockMovement extends BaseEntity {
  inventoryItemId: ID;
  productVariantId: ID;
  warehouseId: ID;
  batchId?: ID;
  type: StockMovementType;
  quantity: number;
  reason?: string;
  referenceType?: "order" | "purchase_order" | "manual_adjustment";
  referenceId?: ID;
  createdByAdminId?: ID;
}

export interface Supplier extends BaseEntity {
  name: string;
  email?: string;
  phone?: string;
  gstNumber?: string;
  address?: string;
  isActive: boolean;
}

export interface PurchaseOrder extends BaseEntity {
  supplierId: ID;
  warehouseId: ID;
  status: "draft" | "sent" | "partially_received" | "received" | "cancelled";
  expectedAt?: string;
  totalAmount: number;
  items: PurchaseOrderItem[];
}

export interface PurchaseOrderItem extends BaseEntity {
  purchaseOrderId: ID;
  productVariantId: ID;
  quantityOrdered: number;
  quantityReceived: number;
  unitCost: number;
  batchNumber?: string;
  expiryDate?: string;
}

export interface Cart extends BaseEntity {
  customerId?: ID;
  sessionId?: string;
  items: CartItem[];
  currency: CurrencyCode;
}

export interface CartItem extends BaseEntity {
  cartId: ID;
  productVariantId: ID;
  quantity: number;
  unitPrice: number;
}

export interface Order extends BaseEntity {
  orderNumber: string;
  customerId?: ID;
  status: OrderStatus;
  currency: CurrencyCode;
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  taxAmount: number;
  totalAmount: number;
  couponCode?: string;
  shippingAddress: Address;
  billingAddress: Address;
  items: OrderItem[];
  payment?: Payment;
  shipment?: Shipment;
}

export interface OrderItem extends BaseEntity {
  orderId: ID;
  productId: ID;
  productVariantId: ID;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
}

export interface Payment extends BaseEntity {
  orderId: ID;
  provider: PaymentProvider;
  providerPaymentId?: string;
  status: PaymentStatus;
  amount: number;
  currency: CurrencyCode;
  paidAt?: string;
}

export interface Shipment extends BaseEntity {
  orderId: ID;
  provider: ShippingProvider;
  trackingNumber?: string;
  status: ShipmentStatus;
  shippedAt?: string;
  deliveredAt?: string;
  shippingLabelUrl?: string;
}

export interface Coupon extends BaseEntity {
  code: string;
  type: CouponType;
  value: number;
  minimumOrderAmount?: number;
  startsAt: string;
  endsAt?: string;
  usageLimit?: number;
  perCustomerLimit?: number;
  isActive: boolean;
}

export interface Review extends BaseEntity {
  productId: ID;
  customerId: ID;
  rating: 1 | 2 | 3 | 4 | 5;
  title: string;
  body: string;
  isVerifiedPurchase: boolean;
  status: "pending" | "approved" | "rejected";
}

export interface ProductQuestion extends BaseEntity {
  productId: ID;
  customerId?: ID;
  question: string;
  answer?: string;
  answeredByAdminId?: ID;
  status: "pending" | "answered" | "hidden";
}

export interface Wishlist extends BaseEntity {
  customerId: ID;
  productIds: ID[];
}

export interface BlogPost extends BaseEntity {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  authorAdminId?: ID;
  status: "draft" | "published";
  publishedAt?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface CMSPage extends BaseEntity {
  slug: string;
  title: string;
  body: string;
  status: "draft" | "published";
  seoTitle?: string;
  seoDescription?: string;
}

export interface HomepageSection extends BaseEntity {
  key: string;
  title: string;
  type: "hero" | "category_grid" | "collection" | "banner" | "editorial";
  sortOrder: number;
  isActive: boolean;
  config: Record<string, unknown>;
}

export interface Banner extends BaseEntity {
  title: string;
  subtitle?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  ctaLabel?: string;
  ctaHref?: string;
  placement: "homepage_hero" | "homepage_strip" | "collection" | "product";
  startsAt?: string;
  endsAt?: string;
  isActive: boolean;
}

export interface Menu extends BaseEntity {
  key: string;
  name: string;
  items: MenuItem[];
}

export interface MenuItem {
  label: string;
  href: string;
  children?: MenuItem[];
}

export interface FooterSection extends BaseEntity {
  title: string;
  links: Array<{ label: string; href: string }>;
  sortOrder: number;
}

export interface SubscriptionPlan extends BaseEntity {
  productVariantId: ID;
  name: string;
  interval: "monthly" | "quarterly";
  discountPercent: number;
  isActive: boolean;
}

export interface LoyaltyPoint extends BaseEntity {
  customerId: ID;
  points: number;
  type: "earned" | "redeemed" | "expired" | "adjusted";
  reason: string;
  orderId?: ID;
}

export interface Referral extends BaseEntity {
  referrerCustomerId: ID;
  referredCustomerEmail: string;
  referredCustomerId?: ID;
  status: "sent" | "signed_up" | "converted" | "expired";
  rewardCouponId?: ID;
}

export interface AuditLog extends BaseEntity {
  actorAdminId?: ID;
  action: string;
  entityType: string;
  entityId?: ID;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}
