import { useState, useRef, useEffect } from "react";
import {
  X,
  Bell,
  User,
  Clock,
  Users,
  LogOut,
  Package,
  FileText,
  LayoutDashboard,
} from "lucide-react";
import { axiosInstance } from "../lib/axios";
import {
  Outlet,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { formatRelativeTime, getToken } from "../utils/helper";
import Swal from "sweetalert2";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;
  const notificationRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const token = getToken();
  const userMenuRef = useRef(null);
  const [user, setUser] = useState({});
  const [searchParams] = useSearchParams();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      const { data } = await axiosInstance.get("/api/admin/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(data.data);
    } catch (error) {
      console.error("Gagal memuat data pengguna:", error);
    }
  };

  useEffect(() => {
    if (token) fetchUsers();
  }, [token]);

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
      console.error("Gagal memuat notifikasi:", error);
    } finally {
      setNotificationLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchNotifications();
  }, [token, unreadCount]);

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
      console.error("Gagal membaca notifikasi:", error);
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
      console.error("Gagal membaca semua notifikasi:", error);
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
      console.error("Gagal menghapus notifikasi:", error);
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

  const handleLougout = async () => {
    const swalRegister = await Swal.fire({
      title: "Apakah anda yakin?",
      text: "Anda akan keluar dari halaman ini",
      icon: "warning",
      position: "top",
      showCancelButton: true,
      confirmButtonColor: "#60a5fa",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Keluar",
      cancelButtonText: "Batal",
    });

    if (swalRegister.isConfirmed) {
      try {
        await axiosInstance.delete("/api/users/logout", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        localStorage.removeItem("token");
        localStorage.removeItem("role");

        Swal.fire({
          position: "top",
          icon: "success",
          title: "Sukses",
          text: "Anda berhasil keluar.",
          showConfirmButton: false,
          timer: 1500,
          width: 400,
        });

        navigate("/auth/login");
      } catch (error) {
        console.error("Gagal melakukan logout:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-400 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Left side - Menu button */}
          <div>
            <h1 className="text-lg font-semibold text-gray-800">Barokah</h1>
            <p className="text-sm text-white">Mukti Snack</p>
          </div>

          {/* Right side - User info */}
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

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-gray-800" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 capitalize truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-white">Admin</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex max-w-full">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm min-h-screen flex-shrink-0">
          <div className="p-6">
            <div className="border-b-2 border-blue-400 py-4 text-center">
              <h2 className="text-xl font-medium text-gray-900">MENU</h2>
            </div>
            <nav className="space-y-2">
              <a
                href="/admin/dashboard"
                className={`flex items-center space-x-3 px-4 py-3 ${
                  pathname === "/admin/dashboard"
                    ? "text-blue-400"
                    : "text-gray-500"
                } hover:bg-gray-100 rounded-lg`}
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Dashboard</span>
              </a>
              <a
                href="/admin/manage-products"
                className={`flex items-center space-x-3 px-4 py-3 ${
                  pathname === "/admin/manage-products"
                    ? "text-blue-400"
                    : "text-gray-500"
                } hover:bg-gray-100 rounded-lg`}
              >
                <Package className="w-5 h-5" />
                <span>Produk</span>
              </a>
              <a
                href="/admin/manage-orders"
                className={`flex items-center space-x-3 px-4 py-3 ${
                  pathname === "/admin/manage-orders"
                    ? "text-blue-400"
                    : "text-gray-500"
                } hover:bg-gray-100 rounded-lg`}
              >
                <FileText className="w-5 h-5" />
                <span>Pesanan</span>
              </a>
              <a
                href="/admin/manage-users"
                className={`flex items-center space-x-3 px-4 py-3 ${
                  pathname === "/admin/manage-users"
                    ? "text-blue-400"
                    : "text-gray-500"
                } hover:bg-gray-100 rounded-lg`}
              >
                <Users className="w-5 h-5" />
                <span>Pengguna</span>
              </a>
              <a
                href="/admin/profile"
                className={`flex items-center space-x-3 px-4 py-3 ${
                  pathname === "/admin/profile"
                    ? "text-blue-400"
                    : "text-gray-500"
                } hover:bg-gray-100 rounded-lg`}
              >
                <User className="w-5 h-5" />
                <span>Profil</span>
              </a>
              <button
                onClick={handleLougout}
                className="flex items-center space-x-3 px-4 py-3 text-gray-500 hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                <LogOut className="w-5 h-5" />
                <span>Keluar</span>
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
