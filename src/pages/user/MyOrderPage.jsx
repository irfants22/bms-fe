import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Package, Eye, Truck, CheckCircle, XCircle } from "lucide-react";
import {
  getToken,
  formatDate,
  formatRupiah,
  getStatusColor,
} from "../../utils/helper";
import { axiosInstance } from "../../lib/axios";
import ProtectedPageUser from "../protected/ProtectedPageUser";
import Loader from "../../components/Loader";

function MyOrderPage() {
  const token = getToken();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusValue, setStatusValue] = useState("DIPROSES");

  const tabs = [
    { id: 1, value: "DIPROSES", label: "DIPROSES", icon: Package },
    { id: 2, value: "DIBAYAR", label: "DIBAYAR", icon: CheckCircle },
    { id: 3, value: "DIKIRIM", label: "DIKIRIM", icon: Truck },
    { id: 4, value: "SELESAI", label: "SELESAI", icon: CheckCircle },
    { id: 5, value: "DIBATALKAN", label: "DIBATALKAN", icon: XCircle },
  ];

  const fetchOrders = async (status) => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get("/api/orders/me", {
        params: {
          status: status || "DIPROSES",
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOrders(data.data);
    } catch (error) {
      console.error("Gagal memuat data pesanan:", error);
      alert("Gagal memuat data pesanan", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(statusValue);
  }, [statusValue]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("status");
    navigate(`/my-order?${params.toString()}`, { replace: true });
  }, []);

  const handleDataOrderByStatus = async (status) => {
    setStatusValue(status);
    const params = new URLSearchParams(searchParams.toString());
    if (statusValue) {
      params.set("status", status);
    } else {
      setStatusValue("DIPROSES");
      params.delete("status");
    }
    navigate(`/my-order?${params.toString()}`, { replace: true });
  };

  return (
    <ProtectedPageUser>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-8">
            Pesanan Saya
          </h1>

          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="flex">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      handleDataOrderByStatus(tab.value);
                    }}
                    className={`flex-1 px-4 py-4 text-center font-medium transition-colors cursor-pointer ${
                      statusValue === tab.value
                        ? "text-blue-400 border-b-2 border-blue-400 bg-blue-50"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Order List */}
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Tidak ada pesanan</p>
              </div>
            ) : loading ? (
              <Loader>Memuat data pesanan...</Loader>
            ) : (
              orders?.map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow-sm">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm text-gray-600">
                          {formatDate(order.order_time)} - Pesanan{" "}
                          <span className="text-sm text-gray-600">
                            #{order.id}
                          </span>{" "}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-gray-300 pt-2">
                      <h2 className="text-base text-gray-600 font-medium">
                        Produk
                      </h2>
                      <div className="flex items-center space-x-4 max-w-full overflow-x-auto p-2">
                        {order?.order_items?.map((item) => (
                          <div
                            key={item.id}
                            className="flex w-44 items-center space-x-2 bg-gray-100 ring-1 ring-gray-300 p-2 rounded-lg"
                          >
                            {/* Product Image */}
                            <div className="w-fit justify-center items-center">
                              <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                                <img
                                  src={item.product.image}
                                  alt={item.product.name}
                                  className="w-full h-full bg-cover rounded-lg"
                                />
                              </div>
                            </div>

                            {/* Product Details */}
                            <div className="flex-1 min-w-0">
                              <h3
                                className="font-medium text-gray-800 mb-1 truncate capitalize"
                                title={item.product.name}
                              >
                                {item.product.name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                x{item.quantity}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-300">
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="font-medium">
                            Total Pesanan:{" "}
                            <span className="font-semibold text-lg text-black">
                              {formatRupiah(order.total_price)}
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() =>
                              navigate(`/my-order/order/${order.id}`)
                            }
                            className="px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50 cursor-pointer"
                          >
                            Lihat Pesanan
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </ProtectedPageUser>
  );
}

export default MyOrderPage;
