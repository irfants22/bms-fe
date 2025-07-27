import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Eye } from "lucide-react";
import { axiosInstance } from "../../lib/axios";
import {
  getToken,
  formatDate,
  formatRupiah,
  getStatusColor,
} from "../../utils/helper";
import ProtectedPageAdmin from "../protected/ProtectedPageAdmin";
import Loader from "../../components/Loader";

function ManageOrderPage() {
  const token = getToken();
  const [orders, setOrders] = useState([]);
  const [paidOrders, setPaidOrders] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchOrders = async (limit = 10, page = 1) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/api/admin/orders", {
        params: {
          limit: limit,
          page: page,
          not: "DIBAYAR",
          sortOrder: "desc",
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const { data } = response.data;
      const { total_orders: total } = response.data.pagination;
      const { total_page: pages } = response.data.pagination;

      setOrders(data || []);
      setTotalOrders(total || 0);
      setTotalPages(pages || 0);
    } catch (error) {
      console.error("Gagal memuat data pesanan:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(itemsPerPage, currentPage);
  }, [itemsPerPage, currentPage]);

  const fetchPaidOrders = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get("/api/admin/orders", {
        params: {
          status: "DIBAYAR",
          limit: 100,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPaidOrders(data.data);
    } catch (error) {
      console.error("Gagal memuat data pesanan:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaidOrders();
  }, []);

  const handleItemsPerPageChange = (e) => {
    const newLimit = parseInt(e.target.value);
    setItemsPerPage(newLimit);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getPaginationNumbers = () => {
    const pages = [];
    const showPages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
    let endPage = Math.min(totalPages, startPage + showPages - 1);
    if (endPage - startPage < showPages - 1) {
      startPage = Math.max(1, endPage - showPages + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <ProtectedPageAdmin>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Kelola Pesanan</h1>

        {/* PaidOrders Table */}
        {paidOrders.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-3 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">
                Pesanan Dibayar
              </h3>
            </div>
            <div className="overflow-x-auto overflow-y-auto max-h-96">
              {loading ? (
                <Loader>Memuat data pesanan...</Loader>
              ) : (
                <table className="w-full min-w-max">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        No
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Penerima
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Waktu Dipesan
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Pesanan
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Jumlah Produk
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Alamat
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Catatan
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paidOrders.length === 0 ? (
                      <tr>
                        <td
                          colSpan="9"
                          className="px-6 py-4 text-center text-gray-500"
                        >
                          Belum ada pesanan
                        </td>
                      </tr>
                    ) : (
                      paidOrders?.map((order, index) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900 capitalize">
                            {order.user?.name}
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                            <div
                              className="max-w-xs truncate"
                              title={order?.address}
                            >
                              {order?.address}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                            <div
                              className="max-w-xs truncate"
                              title={order?.notes}
                            >
                              {order?.notes}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                            <button
                              title="Lihat Pesanan"
                              onClick={() => {
                                navigate(
                                  `/admin/manage-orders/order/${order?.id}`
                                );
                              }}
                              className="text-gray-500 hover:text-gray-700 cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Menampilkan :</span>
              <select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-3 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">
              Semua Pesanan
            </h3>
          </div>
          <div className="overflow-x-auto overflow-y-auto max-h-96">
            {loading ? (
              <Loader>Memuat data pesanan...</Loader>
            ) : (
              <table className="w-full min-w-max">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Penerima
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider ">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Waktu Dipesan
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Pesanan
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jumlah Produk
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Alamat
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Catatan
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider ">
                      Action
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
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900 capitalize">
                          {order.user?.name}
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                          <div
                            className="max-w-xs truncate"
                            title={order?.address}
                          >
                            {order?.address}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                          <div
                            className="max-w-xs truncate"
                            title={order?.notes}
                          >
                            {order?.notes}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                          <button
                            title="Lihat Pesanan"
                            onClick={() => {
                              navigate(
                                `/admin/manage-orders/order/${order?.id}`
                              );
                            }}
                            className="text-gray-500 hover:text-gray-700 cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Menampilkan{" "}
            {orders.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} -{" "}
            {Math.min(currentPage * itemsPerPage, totalOrders)} dari{" "}
            {totalOrders} pesanan
          </div>

          {/* Tampilkan pagination hanya jika totalPages > 1 */}
          {totalPages > 1 && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 text-sm rounded cursor-pointer ${
                  currentPage === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                &lt;
              </button>

              {getPaginationNumbers().map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 text-sm rounded cursor-pointer ${
                    currentPage === page
                      ? "bg-blue-500 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 text-sm rounded cursor-pointer ${
                  currentPage === totalPages
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                &gt;
              </button>
            </div>
          )}
        </div>
      </div>
    </ProtectedPageAdmin>
  );
}

export default ManageOrderPage;
