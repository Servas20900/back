// Types from backend (usando tipos en lugar de enums por TSConfig)
export type Role = 'USER' | 'ADMIN';
export const Role = {
  USER: 'USER' as Role,
  ADMIN: 'ADMIN' as Role,
};

export type Status = 'ACTIVE' | 'INACTIVE';
export const Status = {
  ACTIVE: 'ACTIVE' as Status,
  INACTIVE: 'INACTIVE' as Status,
};

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export const OrderStatus = {
  PENDING: 'PENDING' as OrderStatus,
  PROCESSING: 'PROCESSING' as OrderStatus,
  SHIPPED: 'SHIPPED' as OrderStatus,
  DELIVERED: 'DELIVERED' as OrderStatus,
  CANCELLED: 'CANCELLED' as OrderStatus,
};

export type ShippingMethod = 'STANDARD' | 'EXPRESS' | 'OVERNIGHT';
export const ShippingMethod = {
  STANDARD: 'STANDARD' as ShippingMethod,
  EXPRESS: 'EXPRESS' as ShippingMethod,
  OVERNIGHT: 'OVERNIGHT' as ShippingMethod,
};

export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'PAYPAL' | 'BANK_TRANSFER';
export const PaymentMethod = {
  CREDIT_CARD: 'CREDIT_CARD' as PaymentMethod,
  DEBIT_CARD: 'DEBIT_CARD' as PaymentMethod,
  PAYPAL: 'PAYPAL' as PaymentMethod,
  BANK_TRANSFER: 'BANK_TRANSFER' as PaymentMethod,
};

export type PaymentStatus = 'PENDING' | 'APPROVED' | 'FAILED' | 'REFUNDED';
export const PaymentStatus = {
  PENDING: 'PENDING' as PaymentStatus,
  APPROVED: 'APPROVED' as PaymentStatus,
  FAILED: 'FAILED' as PaymentStatus,
  REFUNDED: 'REFUNDED' as PaymentStatus,
};

// Product types
export interface Product {
  id_product: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url?: string;
  status: Status;
  id_category: number;
  category: Category;
  created_at: string;
  updated_at: string;
}

// Category types
export interface Category {
  id_category: number;
  name: string;
  description?: string;
  image_url?: string;
  status: Status;
  created_at: string;
  updated_at: string;
}

// Cart types
export interface CartItem {
  id_cart_item: number;
  id_cart: number;
  id_product: number;
  quantity: number;
  unit_price: number;
  product?: Product;
}

export interface Cart {
  id_cart: number;
  id_user: number;
  items: CartItem[];
  total: number;
  created_at: string;
  updated_at: string;
}

// User types
export interface User {
  id_user: number;
  full_name: string;
  email: string;
  phone?: string;
  role: Role;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  id_user: number;
  email: string;
  full_name: string;
  role: Role;
  access_token: string;
}

// Order types
export interface OrderItem {
  id_order_item: number;
  id_order: number;
  id_product: number;
  quantity: number;
  unit_price: number;
  product?: Product;
}

export interface ShippingInfo {
  id_shipping: number;
  id_order: number;
  full_name: string;
  identification?: string;
  phone: string;
  email: string;
  province: string;
  canton: string;
  district: string;
  address_details: string;
  delivery_notes?: string;
  shipping_method: ShippingMethod;
}

export interface Order {
  id_order: number;
  id_user: number;
  total_amount: number;
  status: OrderStatus;
  items: OrderItem[];
  shipping_info: ShippingInfo;
  payments: Payment[];
  created_at: string;
  updated_at: string;
}

// Payment types
export interface Payment {
  id_payment: number;
  id_order: number;
  payment_method: PaymentMethod;
  amount: number;
  payment_status: PaymentStatus;
  payment_reference?: string;
  created_at: string;
  updated_at: string;
}
