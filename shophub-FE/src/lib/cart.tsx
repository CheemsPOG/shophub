import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { Product } from '@/lib/data';

export type CartItemDto = {
  id: string;
  productId: string;
  title: string;
  image: string;
  price: number;
  qty: number;
  sellerId: string;
  sellerName: string;
  variant: string | null;
};

export type CartDto = {
  items: CartItemDto[];
  couponCode: string | null;
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
};

export type WishlistEntry = {
  productId: string;
  addedAt: string | null;
  product: Product | null;
};

const EMPTY_CART: CartDto = { items: [], couponCode: null, subtotal: 0, discount: 0, tax: 0, shipping: 0, total: 0 };

type CartContextValue = {
  cart: CartDto;
  wishlist: WishlistEntry[];
  cartCount: number;
  wishlistCount: number;
  loading: boolean;
  refreshCart: () => Promise<void>;
  refreshWishlist: () => Promise<void>;
  isWishlisted: (productId: string) => boolean;
  toggleWishlist: (productId: string) => Promise<void>;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

function normalizeCart(data: CartDto): CartDto {
  return {
    ...data,
    subtotal: Number(data.subtotal ?? 0),
    discount: Number(data.discount ?? 0),
    tax: Number(data.tax ?? 0),
    shipping: Number(data.shipping ?? 0),
    total: Number(data.total ?? 0),
    items: (data.items ?? []).map(item => ({ ...item, price: Number(item.price) })),
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartDto>(EMPTY_CART);
  const [wishlist, setWishlist] = useState<WishlistEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart(EMPTY_CART);
      return;
    }
    try {
      const data = await api<CartDto>('/cart');
      setCart(normalizeCart(data));
    } catch {
      setCart(EMPTY_CART);
    }
  }, [user]);

  const refreshWishlist = useCallback(async () => {
    if (!user) {
      setWishlist([]);
      return;
    }
    try {
      const data = await api<WishlistEntry[]>('/wishlist');
      setWishlist(data ?? []);
    } catch {
      setWishlist([]);
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    void Promise.all([refreshCart(), refreshWishlist()]).finally(() => setLoading(false));
  }, [refreshCart, refreshWishlist]);

  const cartCount = useMemo(() => cart.items.reduce((sum, item) => sum + item.qty, 0), [cart]);
  const wishlistCount = wishlist.length;

  const isWishlisted = useCallback(
    (productId: string) => wishlist.some(entry => entry.productId === productId),
    [wishlist],
  );

  const toggleWishlist = useCallback(
    async (productId: string) => {
      if (!user) return;
      if (isWishlisted(productId)) {
        await api(`/wishlist/${productId}`, { method: 'DELETE' });
      } else {
        await api(`/wishlist/${productId}`, { method: 'PUT' });
      }
      await refreshWishlist();
    },
    [user, isWishlisted, refreshWishlist],
  );

  const value = useMemo<CartContextValue>(
    () => ({ cart, wishlist, cartCount, wishlistCount, loading, refreshCart, refreshWishlist, isWishlisted, toggleWishlist }),
    [cart, wishlist, cartCount, wishlistCount, loading, refreshCart, refreshWishlist, isWishlisted, toggleWishlist],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
