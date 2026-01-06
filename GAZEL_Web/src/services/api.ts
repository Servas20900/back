// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Helper para hacer requests
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: Record<string, string> = {};

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // Agregar headers adicionales
  Object.assign(headers, options.headers || {});

  // Agregar token si existe
  const token = localStorage.getItem('access_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  return response.json();
}

// AUTH SERVICE
export const authService = {
  register: (data: { full_name: string; email: string; password: string; phone?: string }) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getProfile: () => apiRequest('/auth/profile'),

  updateProfile: (data: { full_name?: string; phone?: string; avatar?: string }) =>
    apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiRequest('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// PRODUCTS SERVICE
export const productsService = {
  getAll: () =>
    apiRequest('/products', {
      method: 'GET',
    }),

  getById: (id: number) => apiRequest(`/products/${id}`),

  getByCategory: (categoryId: number) =>
    apiRequest(`/products?id_category=${categoryId}`),

  search: (query: string) =>
    apiRequest(`/products/search?q=${encodeURIComponent(query)}`),

  create: (formData: FormData) =>
    apiRequest('/products', {
      method: 'POST',
      body: formData,
    }),

  update: (id: number, formData: FormData) =>
    apiRequest(`/products/${id}`, {
      method: 'PUT',
      body: formData,
    }),

  delete: (id: number) =>
    apiRequest(`/products/${id}`, {
      method: 'DELETE',
    }),
};

// CATEGORIES SERVICE
export const categoriesService = {
  getAll: () => apiRequest('/categories'),

  getById: (id: number) => apiRequest(`/categories/${id}`),

  create: (data: FormData | { name: string; description?: string }) =>
    apiRequest('/categories', {
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),

  update: (id: number, data: FormData | { name?: string; description?: string; status?: string }) =>
    apiRequest(`/categories/${id}`, {
      method: 'PUT',
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),

  delete: (id: number) =>
    apiRequest(`/categories/${id}`, {
      method: 'DELETE',
    }),
};

// CART SERVICE
export const cartService = {
  getCart: () => apiRequest('/cart'),

  addItem: (data: { id_product: number; quantity: number }) =>
    apiRequest('/cart/items', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateItem: (cartItemId: number, data: { quantity?: number }) =>
    apiRequest(`/cart/items/${cartItemId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  removeItem: (cartItemId: number) =>
    apiRequest(`/cart/items/${cartItemId}`, {
      method: 'DELETE',
    }),

  clear: (cartId: number) =>
    apiRequest(`/cart/${cartId}/clear`, {
      method: 'DELETE',
    }),
};

// ORDERS SERVICE
export const ordersService = {
  create: (data: any) =>
    apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  createGuest: (data: {
    full_name: string;
    phone: string;
    email: string;
    address: string;
    items: Array<{ id_product: number; quantity: number; unit_price: number }>;
    total_amount: number;
  }) =>
    apiRequest('/orders/guest', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getById: (id: number) => apiRequest(`/orders/${id}`),

  getUserOrders: () => apiRequest('/orders/user'),

  getAllOrders: () => apiRequest('/orders/admin/all'),

  updateStatus: (id: number, status: string) =>
    apiRequest(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

// PAYMENTS SERVICE
export const paymentsService = {
  getByOrder: (orderId: number) =>
    apiRequest(`/payments/order/${orderId}`),

  process: (data: { id_order: number; payment_method: string; amount: string }) =>
    apiRequest('/payments/process', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateStatus: (paymentId: number, status: string) =>
    apiRequest(`/payments/${paymentId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ payment_status: status }),
    }),
};

// Exportar todo bajo el namespace api para facilitar el uso
export const api = {
  auth: authService,
  products: productsService,
  categories: categoriesService,
  cart: cartService,
  orders: ordersService,
  payments: paymentsService,
};
