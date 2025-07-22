import { useEffect, useState } from "react";
import {
  User,
  Clock,
  Phone,
  MapPin,
  ArrowLeft,
  CreditCard,
} from "lucide-react";
import {
  getToken,
  formatDate,
  formatRupiah,
  getStatusColor,
  calculateTotalPrice,
} from "../../utils/helper";
import { axiosInstance } from "../../lib/axios";
import { useNavigate, useParams } from "react-router-dom";
import ProtectedPageUser from "../protected/ProtectedPageUser";
import { useUnpaidOrders } from "../../context/UnpaidOrdersContext";

function OrderDetailUser() {
  const token = getToken();
  const [order, setOrder] = useState({});
  const [orderItems, setOrderItems] = useState([]);
  const { orderId } = useParams();
  const [loading, setLoading] = useState(false);
  const allowPaymentInformation = ["DIBAYAR", "DIKIRIM", "SELESAI"];
  const { removeUnpaidOrder } = useUnpaidOrders();
  const navigate = useNavigate();

  const fetchOrderDetail = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get(`/api/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOrder(data.data);
      setOrderItems(data.data.order_items);
    } catch (error) {
      console.error("Gagal memuat data pesanan:", error);
      alert("Gagal memuat data pesanan", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
  }, [orderId]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleSuccessfulOrder = async () => {
    try {
      if (window.confirm("Konfirmasi pesanan sekarang?")) {
        await axiosInstance.put(
          `/api/orders/${orderId}/status`,
          { status: "SELESAI" },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
      navigate("/my-order");
      alert("Pesanan telah dikonfirmasi");
    } catch (error) {
      console.error("Gagal memperbarui status pesanan:", error);
      alert(
        "Gagal memperbarui status pesanan:",
        error.response.message || error.response.data.errors
      );
    }
  };

  const handleFailedOrder = async () => {
    try {
      if (window.confirm("Yakin ingin membatalkan pesanan?")) {
        await axiosInstance.put(
          `/api/orders/${orderId}/status`,
          { status: "DIBATALKAN" },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
      navigate("/my-order");
      alert("Pesanan telah dibatalkan");
    } catch (error) {
      console.error("Gagal memperbarui status pesanan:", error);
      alert(
        "Gagal memperbarui status pesanan:",
        error.response.message || error.response.data.errors
      );
    }
  };

  const handlePayNow = async () => {
    if (!window.snap) {
      alert(
        "Payment gateway sedang dibuat, silakan coba lagi dalam beberapa detik"
      );
      return;
    }
    try {
      const stored = localStorage.getItem("unpaidOrders");
      const unpaidOrders = stored ? JSON.parse(stored) : [];
      const unpaid = unpaidOrders.find((order) => order.order_id === orderId);

      if (!unpaid) {
        alert(
          "Data pembayaran tidak ditemukan. Silakan periksa kembali pesanan anda."
        );
        return;
      }

      if (window.confirm("Apakah anda ingin melakukan pembayaran sekarang?")) {
        window.snap.pay(unpaid.snap_token, {
          onSuccess: function (result) {
            removeUnpaidOrder(orderId);
            console.log("Pembayaran berhasil", result);
            alert("Pembayaran berhasil!");
          },
          onPending: function (result) {
            console.log("Menunggu pembayaran", result);
            alert("Menunggu pembayaran.");
          },
          onError: function (result) {
            console.error("Pembayaran gagal", result);
            alert("Pembayaran gagal!");
          },
          onClose: function () {
            alert("Kamu menutup pop-up tanpa menyelesaikan pembayaran.");
          },
        });
      }
    } catch (error) {
      console.error("Error handling payment:", error);
      alert("Terjadi kesalahan saat memproses pembayaran.");
    }
  };

  useEffect(() => {
    const midtransScriptUrl = "https://app.sandbox.midtrans.com/snap/snap.js";
    const clientKey = "SB-Mid-client-ODf6Ipmxtk6_ylSy";

    const script = document.createElement("script");
    script.src = midtransScriptUrl;
    script.setAttribute("data-client-key", clientKey);
    script.async = true;

    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <ProtectedPageUser>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="w-full flex items-center space-x-4 justify-between">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Detail Pesanan - #{orderId}
                </h1>
                <div className="flex items-center justify-end space-x-2 mt-2">
                  <span className="text-sm">Pesanan</span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      order?.status
                    )}`}
                  >
                    {order?.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Informasi Penerima
            </h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">
                    {order?.user?.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-500" />
                <p className="text-gray-700">{order?.user?.phone}</p>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-500 mt-1" />
                <p className="text-gray-700 leading-relaxed">
                  {order?.address}
                </p>
              </div>
            </div>

            {order.notes && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Catatan</h3>
                <p className="text-gray-700 text-sm">{order?.notes}</p>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Informasi Pesanan
            </h2>
            <div className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-gray-500">Memuat data...</div>
                </div>
              ) : (
                orderItems?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center">
                        <img
                          src={item?.product?.image}
                          alt={item?.product?.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 capitalize">
                          {item?.product?.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          x{item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatRupiah(item.price)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Informasi Pembayaran
            </h2>
            <div className="space-y-4">
              {/* Payment Method */}
              {allowPaymentInformation.includes(order.status) && (
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-5 h-5 text-gray-500" />
                      <span className="font-medium text-gray-900">BCA VA</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2 text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>
                        {formatDate(order?.transaction?.paid_at)} - DIBAYAR
                      </span>
                    </div>
                  </div>
                </div>
              )}
              {/* Payment Breakdown */}
              <div className="border-t border-gray-300 pt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subtotal Pesanan</span>
                  <span className="text-gray-900">
                    {formatRupiah(calculateTotalPrice(orderItems))}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subtotal Pengiriman</span>
                  <span className="text-gray-900">{formatRupiah(4000)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Biaya Layanan</span>
                  <span className="text-gray-900">{formatRupiah(2000)}</span>
                </div>
                <div className="border-t border-gray-300 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">
                      Total
                    </span>
                    <span className="text-2xl font-bold text-blue-500">
                      {formatRupiah(
                        calculateTotalPrice(orderItems) + 4000 + 2000
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          {order?.status === "DIKIRIM" ? (
            <div className="flex justify-end">
              <button
                onClick={handleSuccessfulOrder}
                className="px-5 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors flex items-center space-x-2 cursor-pointer"
              >
                <span>Konfirmasi Pesanan</span>
              </button>
            </div>
          ) : order?.status === "DIPROSES" ? (
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleFailedOrder}
                className="px-5 py-3 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors flex items-center space-x-2 cursor-pointer"
              >
                <span>Batalkan Pesanan</span>
              </button>
              <button
                onClick={handlePayNow}
                className="px-5 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors flex items-center space-x-2 cursor-pointer"
              >
                <span>Bayar Sekarang</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </ProtectedPageUser>
  );
}

export default OrderDetailUser;
