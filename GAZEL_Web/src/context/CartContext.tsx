import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Cart, CartItem, Product } from '../types';
import { cartService } from '../services/api';
import { useAuth } from './AuthContext';

interface LocalCartItem extends CartItem {
  temp_id?: string;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  total: number;
  isLoading: boolean;
  error: string | null;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (cartItemId: number) => Promise<void>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  loadCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

const LOCAL_STORAGE_KEY = 'gazel_local_cart';

// Helper para guardar carrito local
const saveLocalCart = (items: CartItem[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
};

// Helper para cargar carrito local
const loadLocalCart = (): CartItem[] => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cartId, setCartId] = useState<number | null>(null);
  const { isAuthenticated, logout } = useAuth();

  // Calcular número total de items
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Calcular total
  const total = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);

  // Cargar carrito del servidor si está autenticado, o del localStorage si no
  const loadCart = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (isAuthenticated) {
        const cart = await cartService.getCart() as Cart;
        setItems(cart.items || []);
        setCartId(cart.id_cart);
      } else {
        const localItems = loadLocalCart();
        setItems(localItems);
        setCartId(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar el carrito';
      
      // Si es un error de autenticación, limpiar sesión y usar carrito local
      if (errorMessage.includes('Usuario no encontrado') || errorMessage.includes('401')) {
        console.warn('Sesión inválida, limpiando token y usando carrito local');
        logout();
        const localItems = loadLocalCart();
        setItems(localItems);
        setCartId(null);
      } else {
        setError(errorMessage);
        console.error('Error loading cart:', err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar carrito al cambiar estado de autenticación
  useEffect(() => {
    loadCart();
  }, [isAuthenticated]);

  const addToCart = async (product: Product, quantity: number = 1) => {
    setError(null);
    try {
      if (isAuthenticated) {
        // Usuario autenticado: usar API del servidor
        await cartService.addItem({
          id_product: product.id_product,
          quantity,
        });
        await loadCart();
      } else {
        // Usuario no autenticado: usar localStorage
        const localItems = loadLocalCart();
        const existingItem = localItems.find(item => item.id_product === product.id_product);

        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          const newItem: CartItem = {
            id_cart_item: Date.now(), // Usar timestamp como ID temporal
            id_product: product.id_product,
            quantity,
            unit_price: product.price,
            product: product,
          };
          localItems.push(newItem);
        }

        saveLocalCart(localItems);
        setItems(localItems);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al agregar al carrito';
      setError(errorMessage);
      throw err;
    }
  };

  const removeFromCart = async (cartItemId: number) => {
    setError(null);
    try {
      if (isAuthenticated) {
        // Usuario autenticado: usar API del servidor
        await cartService.removeItem(cartItemId);
        setItems((prev) => prev.filter((item) => item.id_cart_item !== cartItemId));
      } else {
        // Usuario no autenticado: usar localStorage
        const localItems = loadLocalCart();
        const filtered = localItems.filter(item => item.id_cart_item !== cartItemId);
        saveLocalCart(filtered);
        setItems(filtered);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar del carrito';
      setError(errorMessage);
      throw err;
    }
  };

  const updateQuantity = async (cartItemId: number, quantity: number) => {
    setError(null);
    try {
      if (isAuthenticated) {
        // Usuario autenticado: usar API del servidor
        if (quantity <= 0) {
          await removeFromCart(cartItemId);
        } else {
          await cartService.updateItem(cartItemId, { quantity });
          await loadCart();
        }
      } else {
        // Usuario no autenticado: usar localStorage
        if (quantity <= 0) {
          await removeFromCart(cartItemId);
        } else {
          const localItems = loadLocalCart();
          const item = localItems.find(i => i.id_cart_item === cartItemId);
          if (item) {
            item.quantity = quantity;
            saveLocalCart(localItems);
            setItems(localItems);
          }
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar cantidad';
      setError(errorMessage);
      throw err;
    }
  };

  const clearCart = async () => {
    setError(null);
    try {
      if (isAuthenticated) {
        // Usuario autenticado: usar API del servidor
        const currentCartId = cartId ?? (await cartService.getCart()).id_cart;
        await cartService.clear(currentCartId);
        setItems([]);
        setCartId(currentCartId);
      } else {
        // Usuario no autenticado: limpiar localStorage
        saveLocalCart([]);
        setItems([]);
        setCartId(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al vaciar el carrito';
      setError(errorMessage);
      throw err;
    }
  };

  const value = {
    items,
    itemCount,
    total,
    isLoading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    loadCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
