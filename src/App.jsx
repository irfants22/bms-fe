import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/user/HomePage";
import ProductPage from "./pages/user/ProductPage";
import ProductDetailPage from "./pages/user/ProductDetailPage";
import LoginPage from "./pages/auth/LoginPage";
import CartPage from "./pages/user/CartPage";
import OrderPage from "./pages/user/OrderPage";
import MyOrderPage from "./pages/user/MyOrderPage";
import HelpPage from "./pages/user/HelpPage";
import RegisterPage from "./pages/auth/RegisterPage";
import DashboardAdminPage from "./pages/admin/DashboardAdminPage";
import ManageProductPage from "./pages/admin/ManageProductPage";
import ManageOrderPage from "./pages/admin/ManageOrderPage";
import ManageUserPage from "./pages/admin/ManageUserPage";
import AdminLayout from "./layouts/AdminLayout";
import AuthLayout from "./layouts/AuthLayout";
import UserLayout from "./layouts/UserLayout";
import ProfileAdminPage from "./pages/admin/ProfileAdminPage";
import ProfileUserPage from "./pages/user/ProfileUserPage";
import NotFoundPage from "./pages/notfound/NotFoundPage";
import AboutUsPage from "./pages/user/AboutUsPage";
import OrderDetailUserPage from "./pages/user/OrderDetailUserPage";
import OrderDetailAdminPage from "./pages/admin/OrderDetailAdminPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* User */}
        <Route path="/" element={<UserLayout />}>
          <Route index element={<HomePage />} />
          <Route path="profile" element={<ProfileUserPage />} />
          <Route path="products" element={<ProductPage />} />
          <Route path="products/:productId" element={<ProductDetailPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="order" element={<OrderPage />} />
          <Route path="my-order" element={<MyOrderPage />} />
          <Route
            path="my-order/order/:orderId"
            element={<OrderDetailUserPage />}
          />
          <Route path="about-us" element={<AboutUsPage />} />
          <Route path="help" element={<HelpPage />} />
        </Route>

        {/* Auth */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>

        {/* Admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="profile" element={<ProfileAdminPage />} />
          <Route path="dashboard" element={<DashboardAdminPage />} />
          <Route path="manage-products" element={<ManageProductPage />} />
          <Route path="manage-orders" element={<ManageOrderPage />} />
          <Route path="manage-users" element={<ManageUserPage />} />
          <Route
            path="manage-orders/order/:orderId"
            element={<OrderDetailAdminPage />}
          />
        </Route>

        {/* NotFound */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
