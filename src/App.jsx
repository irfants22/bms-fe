import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/user/HomePage";
import ProductPage from "./pages/user/ProductPage";
import ProductDetailPage from "./pages/user/ProductDetailPage";
import LoginPage from "./pages/auth/LoginPage";
import CartPage from "./pages/user/CartPage";
import OrderPage from "./pages/user/OrderPage";
import MyOrderPage from "./pages/user/MyOrderPage";
import AboutUsPage from "./pages/user/AboutUs";
import HelpPage from "./pages/user/HelpPage";
import RegisterPage from "./pages/auth/RegisterPage";
import DashboardAdminPage from "./pages/admin/DashboardAdminPage";
import ManageProductPage from "./pages/admin/ManageProductPage";
import ManageOrderPage from "./pages/admin/ManageOrdePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* User */}
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductPage />} />
        <Route path="/products/:productId" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/order" element={<OrderPage />} />
        <Route path="/my-order" element={<MyOrderPage />} />
        <Route path="/about-us" element={<AboutUsPage />} />
        <Route path="/help" element={<HelpPage />} />

        {/* Auth */}
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />

        {/* Admin */}
        <Route path="/admin/dashboard" element={<DashboardAdminPage />} />
        <Route path="/admin/manage-products" element={<ManageProductPage />} />
        <Route path="/admin/manage-orders" element={<ManageOrderPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
