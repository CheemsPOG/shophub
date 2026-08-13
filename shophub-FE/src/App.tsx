import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BuyerLayout } from '@/layouts/BuyerLayout';
import { SellerLayout } from '@/layouts/SellerLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { RequireRole } from '@/components/RequireRole';

import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';

import { HomePage } from '@/pages/buyer/HomePage';
import { ShopPage } from '@/pages/buyer/ShopPage';
import { ProductDetailPage } from '@/pages/buyer/ProductDetailPage';
import { CartPage } from '@/pages/buyer/CartPage';
import { CheckoutPage } from '@/pages/buyer/CheckoutPage';
import { OrdersPage } from '@/pages/buyer/OrdersPage';
import { OrderDetailPage } from '@/pages/buyer/OrderDetailPage';
import { WishlistPage } from '@/pages/buyer/WishlistPage';
import { AccountPage, AccountProfile, AccountSettingsPage } from '@/pages/buyer/AccountPage';
import { AddressesPage } from '@/pages/buyer/AddressesPage';
import { NotificationsPage } from '@/pages/buyer/NotificationsPage';
import { MessagesPage } from '@/pages/buyer/MessagesPage';
import { HelpCenterPage } from '@/pages/buyer/HelpCenterPage';

import { SellerDashboardPage } from '@/pages/seller/SellerDashboardPage';
import { SellerProductsPage } from '@/pages/seller/SellerProductsPage';
import { SellerAddProductPage } from '@/pages/seller/SellerAddProductPage';
import { SellerOrdersPage, SellerOrderDetailPage } from '@/pages/seller/SellerOrdersPage';
import { SellerAnalyticsPage } from '@/pages/seller/SellerAnalyticsPage';
import { SellerPayoutsPage } from '@/pages/seller/SellerPayoutsPage';
import { SellerSettingsPage, SellerStoreProfile } from '@/pages/seller/SellerSettingsPage';
import { SellerMessagesPage } from '@/pages/seller/SellerMessagesPage';

import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage';
import { AdminSellersPage } from '@/pages/admin/AdminSellersPage';
import { AdminProductsPage, AdminCategoriesPage } from '@/pages/admin/AdminProductsPage';
import { AdminOrdersPage } from '@/pages/admin/AdminOrdersPage';
import { AdminDisputesPage } from '@/pages/admin/AdminDisputesPage';
import { AdminCouponsPage } from '@/pages/admin/AdminCouponsPage';
import { AdminSettingsPage } from '@/pages/admin/AdminSettingsPage';

import { NotFoundPage } from '@/pages/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth — three separate account entry points */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/login/:role" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/register/:role" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        {/* Buyer storefront */}
        <Route element={<BuyerLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<RequireRole role="buyer"><CartPage /></RequireRole>} />
          <Route path="/checkout" element={<RequireRole role="buyer"><CheckoutPage /></RequireRole>} />
          <Route path="/orders" element={<RequireRole role="buyer"><OrdersPage /></RequireRole>} />
          <Route path="/orders/:id" element={<RequireRole role="buyer"><OrderDetailPage /></RequireRole>} />
          <Route path="/wishlist" element={<RequireRole role="buyer"><WishlistPage /></RequireRole>} />
          <Route path="/messages" element={<RequireRole role="buyer"><MessagesPage /></RequireRole>} />
          <Route path="/notifications" element={<RequireRole role="buyer"><NotificationsPage /></RequireRole>} />
          <Route path="/addresses" element={<RequireRole role="buyer"><AddressesPage /></RequireRole>} />
          <Route path="/help" element={<HelpCenterPage />} />
          <Route path="/account" element={<RequireRole role="buyer"><AccountPage /></RequireRole>}>
            <Route index element={<AccountProfile />} />
            <Route path="settings" element={<AccountSettingsPage />} />
          </Route>
        </Route>

        {/* Seller portal */}
        <Route path="/seller" element={<RequireRole role="seller"><SellerLayout /></RequireRole>}>
          <Route index element={<SellerDashboardPage />} />
          <Route path="products" element={<SellerProductsPage />} />
          <Route path="products/new" element={<SellerAddProductPage />} />
          <Route path="products/:id/edit" element={<SellerAddProductPage />} />
          <Route path="orders" element={<SellerOrdersPage />} />
          <Route path="orders/:id" element={<SellerOrderDetailPage />} />
          <Route path="analytics" element={<SellerAnalyticsPage />} />
          <Route path="payouts" element={<SellerPayoutsPage />} />
          <Route path="messages" element={<SellerMessagesPage />} />
          <Route path="settings" element={<SellerSettingsPage />}>
            <Route index element={<SellerStoreProfile />} />
          </Route>
        </Route>

        {/* Admin console */}
        <Route path="/admin" element={<RequireRole role="admin"><AdminLayout /></RequireRole>}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="sellers" element={<AdminSellersPage />} />
          <Route path="applications" element={<AdminSellersPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="disputes" element={<AdminDisputesPage />} />
          <Route path="coupons" element={<AdminCouponsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
