import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ChevronRight, Home } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { EmptyState } from '@/components/EmptyState';
import { useCart } from '@/lib/cart';

export function WishlistPage() {
  const { wishlist, refreshWishlist, loading } = useCart();
  const items = wishlist.map(w => w.product).filter((p): p is NonNullable<typeof p> => Boolean(p));

  useEffect(() => {
    void refreshWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <nav className="flex items-center gap-1.5 text-sm text-ink-500">
        <Link to="/" className="flex items-center gap-1 hover:text-ink-900"><Home className="h-3.5 w-3.5" /> Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-ink-900">Wishlist</span>
      </nav>

      <div className="mt-4">
        <h1 className="font-display text-2xl font-bold text-ink-900">My wishlist</h1>
        <p className="text-sm text-ink-500">{items.length} items saved</p>
      </div>

      {!loading && items.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-ink-100 bg-white">
          <EmptyState icon={<Heart className="h-7 w-7" />} title="Your wishlist is empty" description="Save items you love by tapping the heart icon." action={{ label: 'Discover products', to: '/shop' }} />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
