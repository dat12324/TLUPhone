import { Navigate, Routes, Route } from 'react-router-dom'
import HomePage from '../pages/HomePage'
import ProductsPage from '../pages/ProductsPage'
import ProductDetailPage from '../pages/ProductDetailPage'
import CartPage from '../pages/CartPage'
import CheckoutPage from '../pages/CheckoutPage'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import ForgotPasswordPage from '../pages/ForgotPasswordPage'
import ProfilePage from '../pages/ProfilePage'
import OrdersPage from '../pages/OrdersPage'
import NotFoundPage from '../pages/NotFoundPage'
import AdminLayout from '../layouts/AdminLayout'
import AdminPlaceholderPage from '../pages/admin/AdminPlaceholderPage'
import DashboardPage from '../pages/admin/DashboardPage'
import BrandsPage from '../pages/admin/BrandsPage'
import CategoriesPage from '../pages/admin/CategoriesPage'
import FlashSalesPage from '../pages/admin/FlashSalesPage'
import { adminPages } from '../config/adminNavigation'

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/products" element={<ProductsPage />} />
    <Route path="/products/:slug" element={<ProductDetailPage />} />
    <Route path="/cart" element={<CartPage />} />
    <Route path="/checkout" element={<CheckoutPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/profile" element={<ProfilePage />} />
    <Route path="/orders" element={<OrdersPage />} />
    <Route path="/admin" element={<AdminLayout />}>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="brands" element={<BrandsPage />} />
      <Route path="categories" element={<CategoriesPage />} />
      <Route path="flash-sales" element={<FlashSalesPage />} />
      {adminPages.filter((page) => !['dashboard', 'brands', 'categories', 'flash-sales'].includes(page.segment)).map((page) => (
        <Route
          key={page.path}
          path={page.segment}
          element={<AdminPlaceholderPage />}
        />
      ))}
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Route>
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
)

export default AppRoutes
