export const DASHBOARD_RANGES = ["7d", "30d", "90d", "12m"] as const;

export type DashboardRange = (typeof DASHBOARD_RANGES)[number];

export type DashboardMetric = {
  value: number;
  previous: number;
  change: number | null;
};

export type DashboardRank = {
  id: string;
  name: string;
  slug: string;
  quantity: number;
  sales: number;
  orders: number;
};

export type DashboardProductRank = DashboardRank & {
  sku: string | null;
  image: string | null;
  stock: number | null;
};

export type DashboardDemand = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  stock: number;
  isActive: boolean;
  wishlists: number;
};

export type DashboardCartDemand = DashboardDemand & {
  quantity: number;
  carts: number;
};

export type DashboardData = {
  success: true;
  currency: string;
  range: {
    key: DashboardRange;
    label: string;
    comparison: string;
    bucket: "day" | "month";
    timezone: string;
    from: string;
    to: string;
    previousFrom: string;
    previousTo: string;
  };
  summary: {
    revenue: DashboardMetric;
    orderValue: DashboardMetric;
    outstanding: DashboardMetric;
    orders: DashboardMetric;
    averageOrderValue: DashboardMetric;
    itemsSold: DashboardMetric;
    discount: DashboardMetric;
    newCustomers: DashboardMetric;
    newReviews: DashboardMetric;
  };
  orders: {
    placed: number;
    paid: number;
    unpaid: number;
    cancelled: number;
    couponsUsed: number;
    byStatus: { status: string; count: number; total: number }[];
    byPaymentMethod: { method: string; count: number; total: number }[];
  };
  payments: { status: string; count: number; amount: number }[];
  queue: { status: string; count: number }[];
  chart: {
    bucket: "day" | "month";
    points: {
      date: string;
      revenue: number;
      orderValue: number;
      orders: number;
      cancelled: number;
      items: number;
    }[];
  };
  topProducts: DashboardProductRank[];
  topCategories: DashboardRank[];
  topBrands: DashboardRank[];
  topCities: { city: string; state: string | null; orders: number; total: number }[];
  topWishlisted: DashboardDemand[];
  topInCarts: DashboardCartDemand[];
  catalog: {
    products: {
      total: number;
      active: number;
      inactive: number;
      outOfStock: number;
      lowStock: number;
      lowStockAt: number;
    };
    categories: { total: number; active: number };
    brands: { total: number; active: number };
    customers: { total: number; blocked: number; unverified: number };
    coupons: { active: number; expiringSoon: number; expired: number };
    cartsWithItems: number;
    wishlistItems: number;
  };
  reviews: {
    published: number;
    unpublished: number;
    averageRating: number | null;
    periodAverage: number | null;
    byRating: { rating: number; count: number }[];
  };
  attention: {
    pendingOrders: number;
    unpaidOrders: number;
    outOfStock: number;
    lowStock: number;
    expiringCoupons: number;
    expiredCoupons: number;
    failedPayments: number;
    abandonedCarts: number;
  };
  latestOrders: {
    id: string;
    orderNumber: string;
    status: string;
    paymentMethod: string | null;
    paymentStatus: string;
    total: number;
    itemCount: number;
    preview: string | null;
    customer: { id: string; name: string; email: string | null } | null;
    city: string | null;
    createdAt: string;
  }[];
  stockAlerts: {
    id: string;
    name: string;
    slug: string;
    sku: string | null;
    stock: number;
    price: number;
    image: string | null;
  }[];
  recentReviews: {
    id: string;
    rating: number;
    comment: string | null;
    isPublish: boolean;
    createdAt: string;
    user: { id: string; name: string } | null;
    product: { id: string; name: string } | null;
    order: { id: string; orderNumber: string | null } | null;
  }[];
  recentCustomers: {
    id: string;
    name: string;
    email: string;
    mobile: string;
    isEmailVerified: boolean;
    isBlocked: boolean;
    createdAt: string;
  }[];
};
