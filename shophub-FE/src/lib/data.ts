export type UserRole = 'buyer' | 'seller' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  joinedAt: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  compareAt?: number;
  rating: number;
  reviews: number;
  stock: number;
  images: string[];
  sellerId: string;
  sellerName: string;
  brand: string;
  tags: string[];
  status: 'active' | 'draft' | 'pending' | 'rejected';
  createdAt: string;
  sales: number;
  variants?: { name: string; options: string[] }[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  productCount: number;
  subcategories: string[];
}

export interface Order {
  id: string;
  orderNumber: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  items: { productId: string; title: string; image: string; price: number; qty: number; sellerId: string }[];
  total: number;
  subtotal: number;
  shipping: number;
  tax: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded';
  shippingAddress: { name: string; line1: string; city: string; state: string; zip: string; country: string; phone: string };
  commissionRate?: number;
  placedAt: string;
  updatedAt: string;
  trackingNumber?: string;
}

export interface CartItem {
  productId: string;
  title: string;
  image: string;
  price: number;
  qty: number;
  sellerId: string;
  sellerName: string;
  variant?: string;
}

export interface Address {
  id: string;
  label: string;
  name: string;
  line1: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  avatar: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  helpful: number;
  verified: boolean;
}

export interface Dispute {
  id: string;
  orderNumber: string;
  buyerName: string;
  sellerName: string;
  reason: string;
  status: 'open' | 'under_review' | 'resolved' | 'rejected';
  amount: number;
  openedAt: string;
}

export interface SellerApplication {
  id: string;
  businessName: string;
  applicant: string;
  email: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export interface Payout {
  id: string;
  sellerId: string;
  sellerName: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  method: string;
  date: string;
}

export interface Notification {
  id: string;
  type: 'order' | 'system' | 'promo' | 'review' | 'payout' | 'dispute';
  title: string;
  body: string;
  date: string;
  read: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  usageLimit: number;
  used: number;
  expiresAt: string;
  status: 'active' | 'expired' | 'disabled';
}

export interface WishlistItem {
  productId: string;
  addedAt: string;
}

export interface Conversation {
  id: string;
  withName: string;
  withAvatar: string;
  role: string;
  lastMessage: string;
  lastAt: string;
  unread: number;
  messages: { id: string; from: 'me' | 'them'; text: string; at: string }[];
}

export const CATEGORIES: Category[] = [
  { id: 'c1', name: 'Electronics', slug: 'electronics', icon: 'Smartphone', productCount: 1284, subcategories: ['Headphones', 'Laptops', 'Phones', 'Cameras', 'Wearables'] },
  { id: 'c2', name: 'Fashion', slug: 'fashion', icon: 'Shirt', productCount: 3421, subcategories: ['Men', 'Women', 'Kids', 'Shoes', 'Accessories'] },
  { id: 'c3', name: 'Home & Garden', slug: 'home-garden', icon: 'Sofa', productCount: 987, subcategories: ['Furniture', 'Decor', 'Kitchen', 'Garden', 'Lighting'] },
  { id: 'c4', name: 'Beauty', slug: 'beauty', icon: 'Sparkles', productCount: 654, subcategories: ['Skincare', 'Makeup', 'Fragrance', 'Hair', 'Tools'] },
  { id: 'c5', name: 'Sports', slug: 'sports', icon: 'Dumbbell', productCount: 812, subcategories: ['Fitness', 'Outdoor', 'Cycling', 'Running', 'Team Sports'] },
  { id: 'c6', name: 'Toys & Games', slug: 'toys-games', icon: 'Gamepad2', productCount: 543, subcategories: ['Board Games', 'Action Figures', 'Puzzles', 'Remote Control', 'Educational'] },
  { id: 'c7', name: 'Books', slug: 'books', icon: 'BookOpen', productCount: 2103, subcategories: ['Fiction', 'Non-Fiction', "Children's", 'Textbooks', 'Comics'] },
  { id: 'c8', name: 'Art & Craft', slug: 'art-craft', icon: 'Palette', productCount: 421, subcategories: ['Painting', 'Drawing', 'Knitting', 'Jewelry', 'Paper Crafts'] },
];

const PRODUCT_SEEDS = [
  { title: 'Aurora Wireless Noise-Cancelling Headphones', category: 'Electronics', sub: 'Headphones', brand: 'Soundwave', price: 248, compareAt: 329, rating: 4.8, reviews: 1247, tags: ['wireless', 'noise-cancelling', 'bluetooth'] },
  { title: 'Linen Blend Oversized Shirt', category: 'Fashion', sub: 'Men', brand: 'Northwind', price: 68, compareAt: 89, rating: 4.6, reviews: 432, tags: ['linen', 'casual', 'summer'] },
  { title: 'Ceramic Pour-Over Coffee Set', category: 'Home & Garden', sub: 'Kitchen', brand: 'Morning Co', price: 54, rating: 4.9, reviews: 892, tags: ['coffee', 'ceramic', 'pour-over'] },
  { title: 'Vitamin C Brightening Serum', category: 'Beauty', sub: 'Skincare', brand: 'Glow Lab', price: 32, compareAt: 42, rating: 4.7, reviews: 2103, tags: ['vitamin-c', 'serum', 'brightening'] },
  { title: 'Adjustable Cast Iron Dumbbell Set', category: 'Sports', sub: 'Fitness', brand: 'IronCore', price: 189, compareAt: 240, rating: 4.5, reviews: 318, tags: ['dumbbell', 'fitness', 'adjustable'] },
  { title: 'Wooden Building Blocks — 120 pcs', category: 'Toys & Games', sub: "Children's", brand: 'Playwood', price: 39, rating: 4.8, reviews: 654, tags: ['wooden', 'educational', 'blocks'] },
  { title: 'The Midnight Library — Hardcover', category: 'Books', sub: 'Fiction', brand: 'Pages', price: 18, compareAt: 26, rating: 4.6, reviews: 5421, tags: ['fiction', 'hardcover', 'bestseller'] },
  { title: 'Watercolor Travel Palette — 24 Colors', category: 'Art & Craft', sub: 'Painting', brand: 'Pigment', price: 28, rating: 4.7, reviews: 287, tags: ['watercolor', 'travel', 'palette'] },
  { title: 'Smart Fitness Watch Series 6', category: 'Electronics', sub: 'Wearables', brand: 'Pulse', price: 199, compareAt: 279, rating: 4.4, reviews: 1832, tags: ['fitness', 'smartwatch', 'wearable'] },
  { title: 'Organic Cotton Crewneck Tee', category: 'Fashion', sub: 'Women', brand: 'Threadly', price: 24, rating: 4.5, reviews: 921, tags: ['cotton', 'organic', 'basic'] },
  { title: 'Mid-Century Accent Chair', category: 'Home & Garden', sub: 'Furniture', brand: 'Loft House', price: 329, compareAt: 450, rating: 4.7, reviews: 156, tags: ['chair', 'mid-century', 'furniture'] },
  { title: 'Matte Liquid Lipstick Set', category: 'Beauty', sub: 'Makeup', brand: 'Glow Lab', price: 36, compareAt: 48, rating: 4.3, reviews: 743, tags: ['lipstick', 'matte', 'set'] },
  { title: 'Trail Running Shoes — Waterproof', category: 'Sports', sub: 'Running', brand: 'IronCore', price: 119, compareAt: 160, rating: 4.6, reviews: 524, tags: ['running', 'waterproof', 'trail'] },
  { title: 'Strategy Board Game Collection', category: 'Toys & Games', sub: 'Board Games', brand: 'Tabletop', price: 45, rating: 4.8, reviews: 412, tags: ['board-game', 'strategy', 'family'] },
  { title: 'Atomic Habits — Paperback', category: 'Books', sub: 'Non-Fiction', brand: 'Pages', price: 14, compareAt: 22, rating: 4.9, reviews: 12453, tags: ['self-help', 'bestseller', 'non-fiction'] },
  { title: 'Calligraphy Pen Set — 8 Nibs', category: 'Art & Craft', sub: 'Drawing', brand: 'Pigment', price: 22, rating: 4.6, reviews: 198, tags: ['calligraphy', 'pen', 'set'] },
  { title: '4K Mirrorless Camera Body', category: 'Electronics', sub: 'Cameras', brand: 'Optix', price: 899, compareAt: 1099, rating: 4.7, reviews: 342, tags: ['camera', 'mirrorless', '4k'] },
  { title: 'Leather Crossbody Bag', category: 'Fashion', sub: 'Accessories', brand: 'Northwind', price: 89, compareAt: 130, rating: 4.6, reviews: 612, tags: ['leather', 'bag', 'crossbody'] },
  { title: 'Indoor Plant Trio — Easy Care', category: 'Home & Garden', sub: 'Garden', brand: 'Greenery', price: 42, rating: 4.5, reviews: 234, tags: ['plants', 'indoor', 'live'] },
  { title: 'Hair Dryer — Ionic 1875W', category: 'Beauty', sub: 'Hair', brand: 'Glow Lab', price: 58, compareAt: 79, rating: 4.4, reviews: 1023, tags: ['hair-dryer', 'ionic'] },
  { title: 'Yoga Mat — Non-Slip 6mm', category: 'Sports', sub: 'Fitness', brand: 'Zenflex', price: 34, rating: 4.7, reviews: 2841, tags: ['yoga', 'mat', 'non-slip'] },
  { title: 'RC Stunt Car — 2.4GHz', category: 'Toys & Games', sub: 'Remote Control', brand: 'ZoomToys', price: 49, compareAt: 69, rating: 4.3, reviews: 187, tags: ['rc', 'stunt', 'car'] },
  { title: 'Illustrated Childrens Atlas', category: 'Books', sub: "Children's", brand: 'Pages', price: 16, rating: 4.8, reviews: 321, tags: ['children', 'atlas', 'illustrated'] },
  { title: 'Acrylic Paint Tube Set — 24 pcs', category: 'Art & Craft', sub: 'Painting', brand: 'Pigment', price: 26, compareAt: 35, rating: 4.6, reviews: 543, tags: ['acrylic', 'paint', 'set'] },
];

const SELLERS = [
  { id: 's1', name: 'Soundwave Store', rating: 4.8 },
  { id: 's2', name: 'Northwind Apparel', rating: 4.6 },
  { id: 's3', name: 'Morning Co', rating: 4.9 },
  { id: 's4', name: 'Glow Lab Beauty', rating: 4.7 },
  { id: 's5', name: 'IronCore Gear', rating: 4.5 },
  { id: 's6', name: 'Playwood Toys', rating: 4.8 },
  { id: 's7', name: 'Pages Bookshop', rating: 4.9 },
  { id: 's8', name: 'Pigment Arts', rating: 4.7 },
];

export const PRODUCTS: Product[] = PRODUCT_SEEDS.map((p, i) => {
  const seller = SELLERS[i % SELLERS.length];
  const slug = p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return {
    id: `p${i + 1}`,
    title: p.title,
    slug,
    description: `${p.title} by ${p.brand}. Crafted with premium materials and backed by a 2-year warranty. This product is designed to deliver outstanding performance and reliability for everyday use. Free shipping on orders over $50.`,
    category: p.category,
    price: p.price,
    compareAt: p.compareAt,
    rating: p.rating,
    reviews: p.reviews,
    stock: [0, 12, 48, 3, 120, 0, 75][i % 7] === 0 ? 0 : Math.floor(Math.random() * 200) + 5,
    images: [],
    sellerId: seller.id,
    sellerName: seller.name,
    brand: p.brand,
    tags: p.tags,
    status: i % 11 === 0 ? 'draft' : i % 13 === 0 ? 'pending' : 'active',
    createdAt: new Date(Date.now() - i * 86400000 * 3).toISOString(),
    sales: Math.floor(Math.random() * 5000) + 50,
    variants: i % 3 === 0 ? [{ name: 'Color', options: ['Black', 'White', 'Blue'] }, { name: 'Size', options: ['S', 'M', 'L'] }] : undefined,
  };
});

export const CURRENT_USER: User = {
  id: 'u1',
  name: 'Alex Morgan',
  email: 'alex@shophub.com',
  role: 'buyer',
  avatar: '',
  joinedAt: '2023-06-15T00:00:00Z',
};

export const SELLER_PROFILE = {
  id: 's1',
  userId: 'u1',
  businessName: 'Soundwave Store',
  logo: '',
  banner: '',
  tagline: 'Premium audio gear for music lovers',
  description: 'We specialize in high-quality audio equipment including headphones, speakers, and accessories. Founded in 2019, we have served over 50,000 happy customers worldwide.',
  email: 'support@soundwave.store',
  phone: '+1 (555) 123-4567',
  address: '123 Market St, San Francisco, CA 94103',
  rating: 4.8,
  totalSales: 12847,
  productCount: 48,
  joinedAt: '2019-03-20T00:00:00Z',
  commissionRate: 8,
  status: 'verified' as const,
};

export const BUYER_ORDERS: Order[] = Array.from({ length: 8 }).map((_, i) => {
  const product = PRODUCTS[i * 3];
  const statuses: Order['status'][] = ['delivered', 'shipped', 'processing', 'pending', 'delivered', 'cancelled', 'delivered', 'refunded'];
  const payStatuses: Order['paymentStatus'][] = ['paid', 'paid', 'paid', 'pending', 'paid', 'failed', 'paid', 'refunded'];
  return {
    id: `o${i + 1}`,
    orderNumber: `SH-2024-${10032 + i}`,
    buyerId: 'u1',
    buyerName: 'Alex Morgan',
    sellerId: product.sellerId,
    sellerName: product.sellerName,
    items: [
      { productId: product.id, title: product.title, image: '', price: product.price, qty: i % 3 + 1, sellerId: product.sellerId },
      ...(i % 2 === 0 ? [{ productId: PRODUCTS[(i * 3 + 1) % PRODUCTS.length].id, title: PRODUCTS[(i * 3 + 1) % PRODUCTS.length].title, image: '', price: PRODUCTS[(i * 3 + 1) % PRODUCTS.length].price, qty: 1, sellerId: PRODUCTS[(i * 3 + 1) % PRODUCTS.length].sellerId }] : []),
    ],
    total: product.price * (i % 3 + 1) + 8 + 4,
    subtotal: product.price * (i % 3 + 1),
    shipping: 8,
    tax: 4,
    status: statuses[i],
    paymentStatus: payStatuses[i],
    shippingAddress: { name: 'Alex Morgan', line1: '123 Main St', city: 'San Francisco', state: 'CA', zip: '94102', country: 'USA', phone: '+1 (555) 999-0000' },
    placedAt: new Date(Date.now() - i * 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - i * 86400000 * 2).toISOString(),
    trackingNumber: i < 4 ? `1Z${999999999 - i}123` : undefined,
  };
});

export const SELLER_ORDERS: Order[] = Array.from({ length: 12 }).map((_, i) => {
  const product = PRODUCTS[i % PRODUCTS.length];
  const statuses: Order['status'][] = ['pending', 'processing', 'shipped', 'delivered', 'delivered', 'processing', 'pending', 'shipped', 'delivered', 'cancelled', 'delivered', 'processing'];
  return {
    id: `so${i + 1}`,
    orderNumber: `SH-2024-${20015 + i}`,
    buyerId: `b${i + 1}`,
    buyerName: ['Jamie Lee', 'Chris Park', 'Sam Rivera', 'Taylor Quinn', 'Jordan Blake', 'Casey Wu', 'Morgan Hall', 'Riley Chen', 'Drew Adams', 'Sage Wells', 'Reese Cole', 'Avery Stone'][i],
    sellerId: 's1',
    sellerName: 'Soundwave Store',
    items: [{ productId: product.id, title: product.title, image: '', price: product.price, qty: (i % 4) + 1, sellerId: 's1' }],
    total: product.price * ((i % 4) + 1) + 8,
    subtotal: product.price * ((i % 4) + 1),
    shipping: 8,
    tax: product.price * ((i % 4) + 1) * 0.08,
    status: statuses[i],
    paymentStatus: 'paid',
    shippingAddress: { name: 'Customer', line1: `${100 + i} Elm St`, city: 'Portland', state: 'OR', zip: '97201', country: 'USA', phone: '+1 (555) 000-1234' },
    placedAt: new Date(Date.now() - i * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - i * 3600000 * 6).toISOString(),
  };
});

export const SELLER_PRODUCTS: Product[] = PRODUCTS.filter(p => p.sellerId === 's1').concat(
  Array.from({ length: 6 }).map((_, i) => ({
    id: `sp${i + 1}`,
    title: ['Pro Studio Monitor Headphones', 'Bluetooth Earbuds Pro', 'USB-C DAC Adapter', 'Vinyl Record Cleaning Kit', 'Headphone Stand — Walnut', 'Audio Cable 3.5mm — Braided'][i],
    slug: `seller-product-${i}`,
    description: 'Premium audio accessory.',
    category: 'Electronics',
    price: [89, 129, 19, 24, 45, 12][i],
    compareAt: [120, 169, 25, 30, 60, 18][i],
    rating: [4.7, 4.5, 4.6, 4.8, 4.9, 4.4][i],
    reviews: [234, 567, 123, 89, 45, 312][i],
    stock: [34, 0, 120, 56, 12, 200][i],
    images: [],
    sellerId: 's1',
    sellerName: 'Soundwave Store',
    brand: 'Soundwave',
    tags: ['audio'],
    status: i % 4 === 0 ? 'draft' : 'active',
    createdAt: new Date(Date.now() - i * 86400000 * 5).toISOString(),
    sales: [890, 1200, 450, 230, 120, 980][i],
  })),
);

export const ADDRESSES: Address[] = [
  { id: 'a1', label: 'Home', name: 'Alex Morgan', line1: '123 Main St', city: 'San Francisco', state: 'CA', zip: '94102', country: 'USA', phone: '+1 (555) 999-0000', isDefault: true },
  { id: 'a2', label: 'Work', name: 'Alex Morgan', line1: '500 Market St, Suite 200', city: 'San Francisco', state: 'CA', zip: '94105', country: 'USA', phone: '+1 (555) 999-0000', isDefault: false },
];

export const REVIEWS: Review[] = [
  { id: 'r1', productId: 'p1', author: 'Jamie Lee', avatar: '', rating: 5, title: 'Excellent sound quality', body: 'These headphones exceeded my expectations. The noise cancelling is top-tier and battery lasts forever.', date: '2024-07-15', helpful: 34, verified: true },
  { id: 'r2', productId: 'p1', author: 'Chris Park', avatar: '', rating: 4, title: 'Great but pricey', body: 'Sound is amazing but I wish the case was more durable. Overall a solid purchase.', date: '2024-07-10', helpful: 12, verified: true },
  { id: 'r3', productId: 'p1', author: 'Sam Rivera', avatar: '', rating: 5, title: 'Best headphones I own', body: 'Use them daily for work calls and music. Cannot imagine going back to wired.', date: '2024-07-01', helpful: 8, verified: true },
];

export const DISPUTES: Dispute[] = [
  { id: 'd1', orderNumber: 'SH-2024-20018', buyerName: 'Sam Rivera', sellerName: 'Soundwave Store', reason: 'Item not as described', status: 'open', amount: 248, openedAt: '2024-08-08' },
  { id: 'd2', orderNumber: 'SH-2024-20015', buyerName: 'Jamie Lee', sellerName: 'Soundwave Store', reason: 'Damaged on arrival', status: 'under_review', amount: 89, openedAt: '2024-08-05' },
  { id: 'd3', orderNumber: 'SH-2024-10036', buyerName: 'Taylor Quinn', sellerName: 'Northwind Apparel', reason: 'Wrong size received', status: 'resolved', amount: 68, openedAt: '2024-07-28' },
  { id: 'd4', orderNumber: 'SH-2024-10041', buyerName: 'Morgan Hall', sellerName: 'Glow Lab Beauty', reason: 'Never arrived', status: 'rejected', amount: 32, openedAt: '2024-07-20' },
];

export const SELLER_APPLICATIONS: SellerApplication[] = [
  { id: 'sa1', businessName: 'EcoBags Co', applicant: 'Nina Patel', email: 'nina@ecobags.co', category: 'Fashion', status: 'pending', submittedAt: '2024-08-10' },
  { id: 'sa2', businessName: 'TechGizmo', applicant: 'Mark Lee', email: 'mark@techgizmo.com', category: 'Electronics', status: 'pending', submittedAt: '2024-08-09' },
  { id: 'sa3', businessName: 'GreenThumb Plants', applicant: 'Lisa Wong', email: 'lisa@greenthumb.io', category: 'Home & Garden', status: 'approved', submittedAt: '2024-08-01' },
  { id: 'sa4', businessName: 'Toy Universe', applicant: 'Bob Chen', email: 'bob@toyuniverse.com', category: 'Toys & Games', status: 'rejected', submittedAt: '2024-07-25' },
];

export const PAYOUTS: Payout[] = [
  { id: 'pa1', sellerId: 's1', sellerName: 'Soundwave Store', amount: 3450, status: 'completed', method: 'Bank Transfer', date: '2024-08-01' },
  { id: 'pa2', sellerId: 's1', sellerName: 'Soundwave Store', amount: 2890, status: 'processing', method: 'Bank Transfer', date: '2024-08-08' },
  { id: 'pa3', sellerId: 's1', sellerName: 'Soundwave Store', amount: 1675, status: 'pending', method: 'PayPal', date: '2024-08-12' },
];

export const NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'order', title: 'Order delivered', body: 'Your order SH-2024-10032 has been delivered.', date: '2024-08-11', read: false },
  { id: 'n2', type: 'promo', title: 'Flash sale — 40% off electronics', body: 'Limited time offer on selected headphones and speakers.', date: '2024-08-10', read: false },
  { id: 'n3', type: 'review', title: 'Review your purchase', body: 'Share your thoughts on Aurora Wireless Headphones.', date: '2024-08-09', read: true },
  { id: 'n4', type: 'system', title: 'Welcome to ShopHub', body: 'Complete your profile to get personalized recommendations.', date: '2024-08-01', read: true },
];

export const COUPONS: Coupon[] = [
  { id: 'cp1', code: 'WELCOME10', type: 'percent', value: 10, usageLimit: 1000, used: 342, expiresAt: '2024-12-31', status: 'active' },
  { id: 'cp2', code: 'FREESHIP', type: 'fixed', value: 8, usageLimit: 5000, used: 1247, expiresAt: '2024-09-30', status: 'active' },
  { id: 'cp3', code: 'SUMMER25', type: 'percent', value: 25, usageLimit: 500, used: 500, expiresAt: '2024-08-15', status: 'expired' },
];

export const WISHLIST: WishlistItem[] = [
  { productId: 'p3', addedAt: '2024-08-10' },
  { productId: 'p5', addedAt: '2024-08-08' },
  { productId: 'p9', addedAt: '2024-08-05' },
  { productId: 'p11', addedAt: '2024-07-28' },
];

export const CONVERSATIONS: Conversation[] = [
  {
    id: 'cv1',
    withName: 'Soundwave Store',
    withAvatar: '',
    role: 'Seller',
    lastMessage: 'Your order has been shipped! Tracking: 1Z999...',
    lastAt: '2h ago',
    unread: 2,
    messages: [
      { id: 'm1', from: 'them', text: 'Hi Alex! Thanks for your order.', at: '10:30 AM' },
      { id: 'm2', from: 'me', text: 'Great, when will it arrive?', at: '10:32 AM' },
      { id: 'm3', from: 'them', text: 'Your order has been shipped! Tracking: 1Z999...', at: '11:45 AM' },
    ],
  },
  {
    id: 'cv2',
    withName: 'ShopHub Support',
    withAvatar: '',
    role: 'Support',
    lastMessage: 'Is there anything else I can help you with?',
    lastAt: '1d ago',
    unread: 0,
    messages: [
      { id: 'm4', from: 'me', text: 'I have a question about returns.', at: 'Yesterday' },
      { id: 'm5', from: 'them', text: 'Is there anything else I can help you with?', at: 'Yesterday' },
    ],
  },
];

// Admin analytics data
export const ADMIN_STATS = {
  totalRevenue: 1284530,
  totalOrders: 18432,
  totalUsers: 24891,
  totalSellers: 1247,
  totalProducts: 12840,
  pendingSellers: 34,
  openDisputes: 12,
  conversionRate: 3.4,
  monthlyRevenue: [
    { month: 'Jan', value: 89000 },
    { month: 'Feb', value: 95000 },
    { month: 'Mar', value: 102000 },
    { month: 'Apr', value: 98000 },
    { month: 'May', value: 115000 },
    { month: 'Jun', value: 128000 },
    { month: 'Jul', value: 134000 },
    { month: 'Aug', value: 142000 },
  ],
  topCategories: [
    { name: 'Electronics', revenue: 412000, share: 32 },
    { name: 'Fashion', revenue: 298000, share: 23 },
    { name: 'Home & Garden', revenue: 187000, share: 15 },
    { name: 'Beauty', revenue: 142000, share: 11 },
    { name: 'Sports', revenue: 98000, share: 8 },
  ],
  recentSignups: [
    { name: 'Emma Davis', email: 'emma@email.com', role: 'buyer', date: '2024-08-11' },
    { name: 'GreenThumb Plants', email: 'lisa@greenthumb.io', role: 'seller', date: '2024-08-10' },
    { name: 'Noah Wilson', email: 'noah@email.com', role: 'buyer', date: '2024-08-09' },
    { name: 'EcoBags Co', email: 'nina@ecobags.co', role: 'seller', date: '2024-08-08' },
  ],
};

export const SELLER_STATS = {
  totalRevenue: 84520,
  totalOrders: 1284,
  totalProducts: 54,
  conversionRate: 4.2,
  avgOrderValue: 65.9,
  pendingOrders: 8,
  monthlyRevenue: [
    { month: 'Mar', value: 5200 },
    { month: 'Apr', value: 6100 },
    { month: 'May', value: 7400 },
    { month: 'Jun', value: 8900 },
    { month: 'Jul', value: 9800 },
    { month: 'Aug', value: 11200 },
  ],
  topProducts: [
    { name: 'Aurora Wireless Headphones', sales: 890, revenue: 22072 },
    { name: 'Smart Fitness Watch Series 6', sales: 412, revenue: 81988 },
    { name: '4K Mirrorless Camera Body', sales: 78, revenue: 70122 },
  ],
  trafficSources: [
    { name: 'Organic Search', value: 42 },
    { name: 'Direct', value: 28 },
    { name: 'Social Media', value: 18 },
    { name: 'Referral', value: 12 },
  ],
};
