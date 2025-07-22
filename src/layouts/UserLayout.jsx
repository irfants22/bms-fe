import { axiosInstance } from "../lib/axios";
import { useEffect, useRef, useState } from "react";
import { formatRelativeTime, getToken } from "../utils/helper";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";
import { User, Search, ShoppingCart, Bell, X, Clock } from "lucide-react";
import { Link, Outlet, useNavigate, useSearchParams } from "react-router-dom";

function UserLayout() {
  const token = getToken();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [searchParams] = useSearchParams();
  const userMenuRef = useRef(null);
  const notificationRef = useRef(null);
  const navigate = useNavigate();

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set("query", query);
    } else {
      params.delete("query");
    }
    navigate(`/products?${params.toString()}`, { replace: true });
  };

  const fetchNotifications = async () => {
    try {
      setNotificationLoading(true);
      const { data } = await axiosInstance.get("/api/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotifications(data.data);
      setUnreadCount(data.data.filter((n) => !n.is_read).length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setNotificationLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchNotifications();
  }, [token]);

  const markAsRead = async (id) => {
    try {
      await axiosInstance.put(
        `/api/notifications/${id}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const updated = notifications.map((n) =>
        n.id === id ? { ...n, is_read: true } : n
      );
      setNotifications(updated);
      setUnreadCount(updated.filter((n) => !n.is_read).length);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axiosInstance.put(
        "/api/notifications/read-all",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const updated = notifications.map((n) => ({ ...n, is_read: true }));
      setNotifications(updated);
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await axiosInstance.delete(`/api/notifications/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const updated = notifications.filter((n) => n.id !== id);
      setNotifications(updated);
      setUnreadCount(updated.filter((n) => !n.is_read).length);
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target)
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLougout = () => {
    if (window.confirm("Ingin keluar sekarang?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      navigate("/auth/login");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header/Navbar */}
      <header className="bg-blue-400 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-14 h-14 bg-gray-300 rounded-full flex items-center justify-center">
                <img
                  className="w-full h-full object-cover rounded-full"
                  alt="logo"
                  src="https://res.cloudinary.com/dtscrzs6m/image/upload/v1752108376/BMS_qwhbcc.jpg"
                ></img>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-800">Barokah</h1>
                <p className="text-sm text-white">Mukti Snack</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari produk..."
                  className="w-full px-4 py-2 pl-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 w-12 h-8 rounded-md bg-blue-400 hover:bg-blue-500 p-3 flex justify-center items-center cursor-pointer"
                  onClick={handleSearch}
                >
                  <Search className="w-1/2 h-1/2 text-white absolute top-1/2 transform -translate-y-1/2" />
                </button>
              </div>
            </div>

            {/* Icon Menu Section */}
            <div className="flex items-center space-x-4">
              {/* Notification Button */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 hover:bg-gray-100 rounded-lg relative group cursor-pointer"
                >
                  <Bell className="w-6 h-6 text-white group-hover:text-blue-400" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Notifikasi
                        </h3>
                        {unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Tandai semua dibaca
                          </button>
                        )}
                        <button
                          onClick={() => setShowNotifications(false)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                      {notificationLoading ? (
                        <div className="p-8 text-center text-gray-500">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                          <p>Memuat notifikasi...</p>
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p>Tidak ada notifikasi</p>
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                              !n.is_read ? "bg-blue-50" : ""
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <Bell className="w-5 h-5 text-blue-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-600 mt-1">
                                  {n.message}
                                </p>
                                <div className="flex items-center justify-between mt-2">
                                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                                    <Clock className="w-3 h-3" />
                                    <span>
                                      {formatRelativeTime(n.created_at)}
                                    </span>
                                  </div>
                                  {!n.is_read && (
                                    <button
                                      onClick={() => markAsRead(n.id)}
                                      className="text-xs text-blue-600 hover:text-blue-800"
                                    >
                                      Tandai dibaca
                                    </button>
                                  )}
                                </div>
                              </div>
                              <div className="flex-shrink-0 w-min">
                                <button
                                  onClick={() => deleteNotification(n.id)}
                                  className="text-red-400 hover:text-red-600 ml-2"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Cart */}
              <Link
                to="/cart"
                className="p-2 hover:bg-gray-100 rounded-lg group"
              >
                <ShoppingCart className="w-6 h-6 text-white group-hover:text-blue-400" />
              </Link>

              {/* User Menu */}
              {token ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="p-2 hover:bg-gray-100 rounded-lg group cursor-pointer"
                  >
                    <User className="w-6 h-6 text-white group-hover:text-blue-400" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <ul className="py-2">
                        <li>
                          <Link
                            to="/profile"
                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                          >
                            Profil
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/my-order"
                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                          >
                            Pesanan Saya
                          </Link>
                        </li>
                        <li>
                          <button
                            onClick={handleLougout}
                            className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
                          >
                            Keluar
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/auth/login"
                  className="p-2 hover:bg-gray-100 rounded-lg group cursor-pointer"
                >
                  <User className="w-6 h-6 text-white group-hover:text-blue-400" />
                </Link>
              )}
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="mt-2 flex justify-center items-center space-x-8">
            <Link to="/" className="text-white font-medium">
              Beranda
            </Link>
            <Link to="/products" className="text-white font-medium">
              Produk
            </Link>
            <Link to="/help" className="text-white font-medium">
              Bantuan
            </Link>
            <Link to="/about-us" className="text-white font-medium">
              Tentang Kami
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-blue-200 mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo Section */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-14 h-14 bg-gray-300 rounded-full flex items-center justify-center">
                  <img
                    className="w-full h-full object-cover rounded-full"
                    alt="logo"
                    src="https://res.cloudinary.com/dtscrzs6m/image/upload/v1752108376/BMS_qwhbcc.jpg"
                  ></img>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Barokah
                  </h3>
                  <p className="text-sm text-gray-600">Mukti Snack</p>
                </div>
              </div>
            </div>

            {/* Kategori */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-4">Kategori</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/products?category=MAKANAN_RINGAN"
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Makanan Ringan
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products?category=KUE_KERING"
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Kue Kering
                  </Link>
                </li>
              </ul>
            </div>

            {/* Bantuan */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-4">Bantuan</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/help"
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Cara Pesan
                  </Link>
                </li>
                <li>
                  <Link
                    to="/help"
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Kontak Kami
                  </Link>
                </li>
                <li>
                  <Link
                    to="/help"
                    className="text-gray-600 hover:text-gray-800"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            {/* Ikuti Kami */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-4">Ikuti Kami</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <FaInstagram className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-600">Instagram</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaFacebook className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-600">Facebook</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaTwitter className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-600">Twitter</span>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-300 mt-8 pt-8 text-center">
            <p className="text-gray-600 text-sm">
              © 2018 Barokah Mukti Snack. All right reserved
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default UserLayout;
