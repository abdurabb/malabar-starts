import type { Address, AddressDraft } from "@/types/address";
import type { CouponType } from "@/types/coupon";
import type { Pagination } from "@/types/product";
import type { OrderStatus, PaymentRecordStatus } from "@/types/status";

export type DeliveryMode = "saved" | "temporary";

export type OrderItemReview = {
  id: string;
  rating: number;
  comment: string | null;
};

export type OrderItem = {
  id: string;
  product: string;
  name: string;
  slug: string;
  sku: string | null;
  unit: string | null;
  image: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  review?: OrderItemReview | null;
};

export type ShippingAddress = {
  source: "permanent" | "temporary";
  addressId: string | null;
  label: string | null;
  type: Address["type"];
  fullName: string;
  mobile: string;
  line1: string;
  line2: string | null;
  landmark: string | null;
  city: string;
  state: string;
  country: string;
  postalCode: string;
};

export type OrderUser = {
  id: string;
  name: string;
  email: string;
} | null;

export type OrderCoupon = {
  id: string | null;
  code: string;
  couponType: CouponType;
  value: number;
} | null;

export type OrderRecord = {
  id: string;
  orderNumber: string;
  user: OrderUser;
  items: OrderItem[];
  itemCount: number;
  shippingAddress: ShippingAddress;
  status: OrderStatus;
  statusHistory: { status: OrderStatus; date: string }[];
  paymentMethod: "cod" | "online" | null;
  paymentStatus: "unpaid" | "paid";
  note: string | null;
  cancelReason: string | null;
  coupon: OrderCoupon;
  subtotal: number;
  discount: number;
  total: number;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OrderPayment = {
  id?: string;
  status?: PaymentRecordStatus;
  paymentUrl?: string;
};

export type OrderSort = "newest" | "oldest" | "total_asc" | "total_desc";

export type OrderQuery = {
  page?: number;
  limit?: number;
  search?: string;
  status?: OrderStatus;
  product?: string;
  userId?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  from?: string;
  to?: string;
  minTotal?: number;
  maxTotal?: number;
  sort?: OrderSort;
};

export type PlaceOrderInput = {
  addressId?: string;
  address?: AddressDraft;
  saveAddress?: boolean;
  makeDefault?: boolean;
  note?: string;
};

export type OrderUpdateInput = {
  addressId?: string;
  address?: AddressDraft;
  saveAddress?: boolean;
  makeDefault?: boolean;
  note?: string | null;
};

export type { Pagination };
