import { Users, Package, DollarSign, ShoppingCart } from "lucide-react";
import ProtectedPageAdmin from "../protected/ProtectedPageAdmin";
import { useEffect, useState } from "react";
import {
  getToken,
  formatDate,
  formatRupiah,
  getStatusColor,
  calculateTotalPaidOrderPrice,
} from "../../utils/helper";
import { axiosInstance } from "../../lib/axios";
import Loader from "../../components/Loader";

function DashboardAdminPage() {
  const token = getToken();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [paidOrders, setPaidOrders] = useState([]);
  const [sentOrders, setSentOrders] = useState([]);
  const [successfulOrders, setSuccessfulOrders] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalSuccessfulOrders, setTotalSuccessfulOrders] = useState(0);
  const [totalFailedOrders, setTotalFailedOrders] = useState(0);
  const [totalWaitingOrders, setTotalWaitingOrders] = useState(0);

  const fetchUsers = async () => {
    try {
      const { data } = await axiosInstance.get("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTotalUsers(data.pagination?.total_users);
    } catch (error) {
      console.error("Gagal memuat data pengguna:", error);
      alert("Gagal memuat data pengguna", error.message);
    }
  };

  useEffect(() => {
    if (token) fetchUsers();
  }, [token]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get("/api/admin/orders", {
        params: {
          sortOrder: "desc",
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOrders(data.data);
      setTotalOrders(data.pagination?.total_orders);
    } catch (error) {
      console.error("Gagal memuat data pesanan:", error);
      alert("Gagal memuat data pesanan", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchOrders();
  }, [token]);

  const fetchSuccessfulOrders = async () => {
    try {
      const { data } = await axiosInstance.get("/api/admin/orders", {
        params: {
          status: "SELESAI",
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSuccessfulOrders(data.data);
      setTotalSuccessfulOrders(data.pagination?.total_orders);
    } catch (error) {
      console.error("Gagal memuat data pesanan selesai:", error);
      alert("Gagal memuat data pesanan selesai", error.message);
    }
  };

  useEffect(() => {
    if (token) fetchSuccessfulOrders();
  }, [token]);

  const fetchFailedOrders = async () => {
    try {
      const { data } = await axiosInstance.get("/api/admin/orders", {
        params: {
          status: "DIBATALKAN",
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTotalFailedOrders(data.pagination?.total_orders);
    } catch (error) {
      console.error("Gagal memuat data pesanan dibatalkan:", error);
      alert("Gagal memuat data pesanan dibatalkan", error.message);
    }
  };

  useEffect(() => {
    if (token) fetchFailedOrders();
  }, [token]);

  const fetchWaitingOrders = async () => {
    try {
      const { data } = await axiosInstance.get("/api/admin/orders", {
        params: {
          status: "DIPROSES",
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTotalWaitingOrders(data.pagination?.total_orders);
    } catch (error) {
      console.error("Gagal memuat data pesanan ditunggu:", error);
      alert("Gagal memuat data pesanan ditunggu", error.message);
    }
  };

  useEffect(() => {
    if (token) fetchWaitingOrders();
  }, [token]);

  const fetchPaidOrders = async () => {
    try {
      const { data } = await axiosInstance.get("/api/admin/orders", {
        params: {
          status: "DIBAYAR",
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPaidOrders(data.data);
    } catch (error) {
      console.error("Gagal memuat data pesanan dibayar:", error);
      alert("Gagal memuat data pesanan dibayar", error.message);
    }
  };

  useEffect(() => {
    if (token) fetchPaidOrders();
  }, [token]);

  const fetchSentOrders = async () => {
    try {
      const { data } = await axiosInstance.get("/api/admin/orders", {
        params: {
          status: "DIKIRIM",
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSentOrders(data.data);
    } catch (error) {
      console.error("Gagal memuat data pesanan dikirim:", error);
      alert("Gagal memuat data pesanan dikirim", error.message);
    }
  };

  useEffect(() => {
    if (token) fetchSentOrders();
  }, [token]);

  return (
    <ProtectedPageAdmin>
      <div>
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          {/* Users Card */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pengguna</p>
                <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Orders Card */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pesanan</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalOrders}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Revenue Card */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total pesanan dibayar</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatRupiah(
                    calculateTotalPaidOrderPrice(paidOrders) +
                      calculateTotalPaidOrderPrice(sentOrders) +
                      calculateTotalPaidOrderPrice(successfulOrders)
                  )}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Completed Orders Card */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pesanan Selesai</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalSuccessfulOrders}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Cancelled Orders Card */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pesanan Dibatalkan</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalFailedOrders}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          {/* Pending Orders Card */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pesanan Menunggu</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalWaitingOrders}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Pesanan</h2>
          </div>
          <div className="overflow-x-auto overflow-y-auto max-h-96">
            {loading ? (
              <Loader>Memuat data pesanan...</Loader>
            ) : (
              <table className="w-full min-w-max">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Penerima
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-48">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-32">
                      Waktu Dipesan
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Pesanan
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-32">
                      Jumlah Produk
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Alamat
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Catatan
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.length === 0 ? (
                    <tr>
                      <td
                        colSpan="9"
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        Belum ada pesanan
                      </td>
                    </tr>
                  ) : (
                    orders?.map((order, index) => (
                      <tr key={order?.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900 capitalize">
                          {order?.user?.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                              order?.status
                            )}`}
                          >
                            {order?.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                          {formatDate(order?.order_time)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                          {formatRupiah(order?.total_price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                          {order?.order_items.length}
                        </td>
                        <td className="px-6 py-4 text-sm text-center text-gray-900">
                          <div
                            className="max-w-xs truncate"
                            title={order?.address}
                          >
                            {order?.address}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-center text-gray-900">
                          <div
                            className="max-w-xs truncate"
                            title={order?.notes}
                          >
                            {order?.notes}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </ProtectedPageAdmin>
  );
}

export default DashboardAdminPage;
