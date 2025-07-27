import { useEffect, useState } from "react";
import { axiosInstance } from "../../lib/axios";
import {
  formatRupiah,
  formatWeight,
  getShippingCost,
  calculateTotalPrice,
  getToken,
} from "../../utils/helper";
import ProtectedPageUser from "../protected/ProtectedPageUser";
import { useUnpaidOrders } from "../../context/UnpaidOrdersContext";
import Loader from "../../components/Loader";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

function OrderPage() {
  const token = getToken();
  const serviceFee = 2000;
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [payload, setPayload] = useState({});
  const [cartItems, setCartItems] = useState([]);
  const [shippingCost, setShippingCost] = useState(0);
  const [loadingItems, setLoadingItems] = useState(false);
  const { addUnpaidOrder, removeUnpaidOrder } = useUnpaidOrders();

  const fetchUser = async () => {
    try {
      const { data } = await axiosInstance.get("/api/users/me", {
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
    if (token) {
      fetchUser();
    }
  }, [token]);

  const fetchCartItems = async () => {
    setLoadingItems(true);
    try {
      const { data } = await axiosInstance.get("/api/carts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCartItems(data.data);
    } catch (error) {
      console.error("Gagal memuat keranjang belanja:", error);
    } finally {
      setLoadingItems(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCartItems();
    }
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "city") {
      setPayload((prev) => ({
        ...prev,
        other_costs: serviceFee + getShippingCost(value),
      }));
      setShippingCost(getShippingCost(value));
      return;
    }

    setPayload((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const fetchCreateOrder = async () => {
    try {
      const { address, notes, other_costs } = payload;
      if (
        !address ||
        !notes ||
        other_costs === undefined ||
        other_costs === null
      ) {
        Swal.fire({
          position: "top",
          icon: "warning",
          title: "Periksa Kembali",
          text: "Mohon lengkapi semua data sebelum membuat pesanan!",
          showConfirmButton: false,
          timer: 1500,
          width: 400,
        });
        return;
      }
      if (shippingCost === 0) {
        Swal.fire({
          position: "top",
          icon: "warning",
          title: "Periksa Kembali",
          text: "Pilih kota pengiriman anda terlebih dahulu!",
          showConfirmButton: false,
          timer: 1500,
          width: 400,
        });
        return;
      }
      const { data } = await axiosInstance.post("/api/orders", payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const { order_id, snap_token } = data.data;

      addUnpaidOrder({ order_id, snap_token });

      // Panggil Midtrans Snap UI
      window.snap.pay(snap_token, {
        onSuccess: function (result) {
          removeUnpaidOrder(order_id);
          console.log("Pembayaran berhasil", result);
          Swal.fire({
            position: "top",
            icon: "success",
            title: "Sukses",
            text: "Pembayaran berhasil.",
            showConfirmButton: false,
            timer: 1500,
            width: 400,
          });
        },
        onPending: function (result) {
          console.log("Menunggu pembayaran", result);
          Swal.fire({
            position: "top",
            icon: "info",
            title: "Perhatian",
            text: "Menunggu pembayaran.",
            showConfirmButton: false,
            timer: 1500,
            width: 400,
          });
        },
        onError: function (result) {
          console.error("Pembayaran gagal!", result);
          Swal.fire({
            position: "top",
            icon: "error",
            title: "Gagal",
            text: "Pembayaran gagal!",
            showConfirmButton: false,
            timer: 1500,
            width: 400,
          });
        },
        onClose: function () {
          navigate("/my-order");
          Swal.fire({
            position: "top",
            icon: "warning",
            title: "Hati-hati",
            text: "Kamu menutup pop-up tanpa menyelesaikan pembayaran.",
            showConfirmButton: false,
            timer: 1500,
            width: 400,
          });
        },
      });
    } catch (error) {
      Swal.fire({
        position: "top",
        icon: "error",
        title: "Gagal",
        text: "Gagal membuat pesanan.",
        showConfirmButton: false,
        timer: 1500,
        width: 400,
      });
      console.error("Gagal membuat pesanan:", error);
    }
  };

  const handleSubmit = () => {
    if (token) {
      fetchCreateOrder();
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
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-8">Buat Pesanan</h1>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">
            Informasi Penerima
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                {user.name}
              </p>
              <p className="text-sm text-gray-600">{user.phone}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Alamat
              </label>
              <textarea
                id="address"
                name="address"
                rows="3"
                value={payload.address}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none resize-none"
                placeholder="Masukkan alamat lengkap"
              />
            </div>

            <div>
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Catatan
              </label>
              <textarea
                id="notes"
                name="notes"
                rows="3"
                value={payload.notes}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none resize-none"
                placeholder="Catatan tambahan (opsional)"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">
            Informasi Produk
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-500"></th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-500"></th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-500"></th>
                  <th className="text-center py-3 px-2 text-sm font-medium text-gray-500">
                    Harga Satuan
                  </th>
                  <th className="text-center py-3 px-2 text-sm font-medium text-gray-500">
                    Kuantitas
                  </th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-gray-500">
                    Subtotal Produk
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Cart Items */}
                {loadingItems ? (
                  <tr>
                    <td colSpan={6} className="text-center">
                      <Loader>Memuat informasi produk...</Loader>
                    </td>
                  </tr>
                ) : (
                  cartItems.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100">
                      <td className="py-4 px-2">
                        <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                          <img
                            alt="Gambar Produk"
                            src={item.product?.image}
                            className="w-full h-full bg-cover"
                          ></img>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <div className="font-medium text-gray-800 capitalize">
                          {item.product?.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatWeight(item.product?.weight)}
                        </div>
                      </td>
                      <td className="py-4 px-2"></td>
                      <td className="py-4 px-2 text-center">
                        {formatRupiah(item.product?.price)}
                      </td>
                      <td className="py-4 px-2 text-center">{item.quantity}</td>
                      <td className="py-4 px-2 text-right font-medium">
                        {formatRupiah(item.price)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">
            Pembayaran
          </h2>

          <div className="mb-6">
            <label
              htmlFor="city"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Kota Pengiriman
            </label>
            <select
              id="city"
              name="city"
              value={payload.city}
              onChange={handleInputChange}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"
            >
              <option value="">Pilih Kota</option>
              <option value="Jakarta">Jakarta</option>
              <option value="Bogor">Bogor</option>
              <option value="Depok">Depok</option>
              <option value="Tangerang">Tangerang</option>
              <option value="Bekasi">Bekasi</option>
            </select>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Subtotal Pesanan</span>
              <span className="font-medium">
                {formatRupiah(calculateTotalPrice(cartItems))}
              </span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Subtotal Pengiriman</span>
              <span className="font-medium">{formatRupiah(shippingCost)}</span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Biaya Pelayanan</span>
              <span className="font-medium">{formatRupiah(serviceFee)}</span>
            </div>

            <hr className="border-gray-300 my-4" />

            <div className="flex justify-between items-center py-2">
              <span className="text-lg font-semibold text-gray-800">
                Total Pembayaran
              </span>
              <span className="text-xl font-bold text-gray-800">
                {formatRupiah(
                  calculateTotalPrice(cartItems) + shippingCost + serviceFee
                )}
              </span>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSubmit}
              className="px-8 py-3 bg-blue-400 text-white font-medium rounded-lg hover:bg-blue-500 transition-colors cursor-pointer"
            >
              Buat Pesanan
            </button>
          </div>
        </div>
      </div>
    </ProtectedPageUser>
  );
}

export default OrderPage;
