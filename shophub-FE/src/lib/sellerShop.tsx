import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export type SellerShopDto = {
  businessName: string;
  logo: string;
  banner: string;
  tagline: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  rating: number;
  totalSales: number;
  productCount: number;
  joinedAt: string | null;
  status: string;
};

type SellerShopContextValue = {
  shop: SellerShopDto | null;
  loading: boolean;
  refresh: () => Promise<void>;
  setShop: (shop: SellerShopDto | null) => void;
};

const SellerShopContext = createContext<SellerShopContextValue | undefined>(undefined);

export function SellerShopProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [shop, setShop] = useState<SellerShopDto | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user || user.role !== 'seller') {
      setShop(null);
      setLoading(false);
      return;
    }
    try {
      const data = await api<SellerShopDto>('/seller/shop');
      setShop({
        ...data,
        logo: data.logo ?? '',
        banner: data.banner ?? '',
        rating: Number(data.rating ?? 0),
        totalSales: Number(data.totalSales ?? 0),
        productCount: Number(data.productCount ?? 0),
      });
    } catch {
      setShop(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ shop, loading, refresh, setShop }),
    [shop, loading, refresh],
  );

  return <SellerShopContext.Provider value={value}>{children}</SellerShopContext.Provider>;
}

export function useSellerShop() {
  const ctx = useContext(SellerShopContext);
  if (!ctx) throw new Error('useSellerShop must be used within SellerShopProvider');
  return ctx;
}
