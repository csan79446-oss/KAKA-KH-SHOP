export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  _count?: {
    products: number;
  };
}

export interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  imageUrl: string;
  categoryId: string;
  category?: Category;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface TelegramUserData {
  id: string | number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId?: string | null;
  title: string;
  price: number;
  quantity: number;
  product?: Product | null;
}

export type OrderStatus = "PENDING" | "PAID" | "PREPARING" | "DELIVERED" | "CANCELLED";

export type PaymentMethod = "KHQR" | "ABA_PAYWAY" | "CASH_ON_DELIVERY";

export interface Order {
  id: string;
  telegramUserId?: string | null;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  transactionId?: string | null;
  paidAt?: string | Date | null;
  notes?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  items: OrderItem[];
}

export interface StatsOverview {
  totalRevenue: number;
  paidOrdersCount: number;
  totalOrdersCount: number;
  pendingOrdersCount: number;
  totalUsersCount: number;
}
