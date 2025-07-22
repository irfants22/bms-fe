import { useState, useEffect } from "react";
import { axiosInstance } from "../../lib/axios";
import { Plus, X, Search, Upload, Image, Edit, Trash2 } from "lucide-react";
import {
  getToken,
  formatRupiah,
  formatWeight,
  formatCategory,
} from "../../utils/helper";
import ProtectedPageAdmin from "../protected/ProtectedPageAdmin";
import Loader from "../../components/Loader";

function ManageProductPage() {
  const token = getToken();
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [showModalCreate, setShowModalCreate] = useState(false);
  const [showModalUpdate, setShowModalUpdate] = useState(false);
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState("");
  const [productDetail, setProductDetail] = useState({});
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
    packaging: "",
    weight: "",
    description: "",
    image: null,
  });

  const fetchProducts = async (query, limit = 10, page = 1) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/api/admin/products", {
        params: {
          query: query || null,
          limit: limit,
          page: page,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const { data } = response.data;
      const { total_products: total } = response.data.pagination;
      const { total_page: pages } = response.data.pagination;

      setProducts(data || []);
      setTotalProducts(total || 0);
      setTotalPages(pages || 0);
    } catch (error) {
      console.error("Gagal memuat data produk:", error);
      alert("Gagal memuat data produk", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(searchTerm, itemsPerPage, currentPage);
  }, [searchTerm, itemsPerPage, currentPage]);

  const fetchProductDetail = async () => {
    try {
      const { data } = await axiosInstance.get(`/api/products/${productId}`);
      setProductDetail(data.data);
    } catch (error) {
      console.error("Gagal memuat data produk:", error);
      alert("Gagal memuat data produk", error);
    }
  };

  useEffect(() => {
    fetchProductDetail();
  }, [productId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validasi tipe file
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
      ];
      if (!allowedTypes.includes(file.type)) {
        alert("Tipe file tidak didukung. Gunakan JPEG, PNG, atau GIF.");
        return;
      }
      // Validasi ukuran file (maksimal 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran file terlalu besar. Maksimal 5MB.");
        return;
      }
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));
      // Buat preview gambar
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({
      ...prev,
      image: null,
    }));
    setImagePreview(null);
    // Reset input file
    const fileInput = document.getElementById("image-upload");
    if (fileInput) {
      fileInput.value = "";
    }
  };

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

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
      try {
        await axiosInstance.delete(`/api/admin/products/${productId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        alert("Produk berhasil dihapus!");
        await fetchProducts(searchTerm, itemsPerPage, currentPage);
      } catch (error) {
        console.error("Gagal menghapus produk:", error);
        alert("Gagal menghapus produk");
      }
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    // Buat FormData untuk mengirim file
    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("price", formData.price);
    formDataToSend.append("stock", formData.stock);
    formDataToSend.append("category", formData.category);
    formDataToSend.append("packaging", formData.packaging);
    formDataToSend.append("weight", formData.weight);
    formDataToSend.append("description", formData.description);
    if (formData.image) {
      formDataToSend.append("image", formData.image);
    }
    try {
      const response = await axiosInstance.post(
        "/api/admin/products",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 201 || response.status === 200) {
        // Reset form
        setFormData({
          name: "",
          price: "",
          stock: "",
          category: "",
          packaging: "",
          weight: "",
          description: "",
          image: null,
        });
        setImagePreview(null);
        setShowModalCreate(false);
        // Refresh data produk
        await fetchProducts(searchTerm, itemsPerPage, currentPage);
        alert("Produk berhasil ditambahkan!");
      }
    } catch (error) {
      console.error("Gagal saat menambahkan produk:", error);
      alert("Gagal saat menambahkan produk:", error.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    // Buat FormData untuk mengirim file
    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name || productDetail.name);
    formDataToSend.append("price", formData.price || productDetail.price);
    formDataToSend.append("stock", formData.stock || productDetail.stock);
    formDataToSend.append(
      "category",
      formData.category || productDetail.category
    );
    formDataToSend.append(
      "packaging",
      formData.packaging || productDetail.packaging
    );
    formDataToSend.append("weight", formData.weight || productDetail.weight);
    formDataToSend.append(
      "description",
      formData.description || productDetail.description
    );
    if (formData.image) {
      formDataToSend.append("image", formData.image);
    } else {
      formDataToSend.append("image", productDetail.image);
    }

    try {
      const response = await axiosInstance.put(
        `/api/admin/products/${productId}`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 201 || response.status === 200) {
        // Reset form
        setFormData({
          name: "",
          price: "",
          stock: "",
          category: "",
          packaging: "",
          weight: "",
          description: "",
          image: null,
        });
        setImagePreview(null);
        setShowModalCreate(false);
        // Refresh data produk
        await fetchProducts(searchTerm, itemsPerPage, currentPage);
        alert("Produk berhasil diperbarui!");
      }
    } catch (error) {
      console.error("Gagal saat memperbarui produk:", error);
      alert(error.response?.data?.message || "Gagal saat memperbarui produk");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <ProtectedPageAdmin>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Kelola Produk</h1>

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
            <button
              onClick={() => setShowModalCreate(true)}
              className="flex items-center gap-2 bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors hover:bg-blue-500 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Tambah baru
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari produk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto overflow-y-auto max-h-96">
            {loading ? (
              <Loader>Memuat data produk...</Loader>
            ) : (
              <table className="w-full min-w-max">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gambar
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-48">
                      Nama Produk
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-32">
                      Harga
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stok
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-32">
                      Kategori
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kemasan
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Berat
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-64">
                      Deskripsi
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.length === 0 ? (
                    <tr>
                      <td
                        colSpan="10"
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        {searchTerm
                          ? "Tidak ada produk yang ditemukan"
                          : "Belum ada produk"}
                      </td>
                    </tr>
                  ) : (
                    products?.map((product, index) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                            {product.image ? (
                              <img
                                src={product?.image}
                                alt={product?.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.nextSibling.style.display = "flex";
                                }}
                              />
                            ) : null}
                            <div
                              className={`w-6 h-6 text-gray-400 ${
                                product?.image ? "hidden" : "flex"
                              }`}
                            >
                              <Image className="w-full h-full" />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900 capitalize">
                          {product?.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                          {formatRupiah(product?.price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                          {product?.stock}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                          {formatCategory(product?.category)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                          {product?.packaging}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                          {formatWeight(product?.weight)}
                        </td>
                        <td className="px-6 py-4 text-sm text-center text-gray-900">
                          <div
                            className="max-w-xs truncate"
                            title={product?.description}
                          >
                            {product?.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setProductId(product?.id);
                                setShowModalUpdate(true);
                              }}
                              className="text-blue-500 hover:text-blue-700 cursor-pointer"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product?.id)}
                              className="text-red-500 hover:text-red-700 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Menampilkan{" "}
            {products.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} -{" "}
            {Math.min(currentPage * itemsPerPage, totalProducts)} dari{" "}
            {totalProducts} produk
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

        {/* Modal Create */}
        {showModalCreate && (
          <div
            className="fixed inset-0 bg-black flex items-center justify-center z-50"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          >
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Tambah Produk
                </h2>
                <button
                  onClick={() => setShowModalCreate(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleCreateProduct} className="space-y-4">
                {/* Upload Gambar */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gambar Produk
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <input
                        type="file"
                        id="image-upload"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="image-upload"
                        className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                      >
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="text-center">
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">
                              Klik untuk upload gambar
                            </p>
                            <p className="text-xs text-gray-400">
                              PNG, JPG, GIF hingga 5MB
                            </p>
                          </div>
                        )}
                      </label>
                    </div>
                    {imagePreview && (
                      <button
                        type="button"
                        onClick={removeImage}
                        className="p-2 text-red-500 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Produk
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kategori
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Pilih Kategori</option>
                      <option value="MAKANAN_RINGAN">Makanan Ringan</option>
                      <option value="KUE_KERING">Kue Kering</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Harga
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kemasan
                    </label>
                    <select
                      name="packaging"
                      value={formData.packaging}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Pilih Kemasan</option>
                      <option value="BAL">Bal</option>
                      <option value="TOPLES">Toples</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stok
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Berat
                    </label>
                    <select
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Pilih Berat</option>
                      <option value="KG_1">1kg</option>
                      <option value="KG_2">2kg</option>
                      <option value="GRAM_250">250gram</option>
                      <option value="GRAM_500">500gram</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deskripsi
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows="3"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModalCreate(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer"
                    disabled={submitLoading}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 cursor-pointer"
                    disabled={submitLoading}
                  >
                    {submitLoading ? "Menyimpan..." : "Tambah"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Update */}
        {showModalUpdate && (
          <div
            className="fixed inset-0 bg-black flex items-center justify-center z-50"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          >
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Perbarui Produk
                </h2>
                <button
                  onClick={() => setShowModalUpdate(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleUpdateProduct} className="space-y-4">
                {/* Upload Gambar */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gambar Produk
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <input
                        type="file"
                        id="image-upload"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="image-upload"
                        className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                      >
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="text-center">
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">
                              Klik untuk upload gambar
                            </p>
                            <p className="text-xs text-gray-400">
                              PNG, JPG, GIF hingga 5MB
                            </p>
                          </div>
                        )}
                      </label>
                    </div>
                    {imagePreview && (
                      <button
                        type="button"
                        onClick={removeImage}
                        className="p-2 text-red-500 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Produk
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      placeholder={productDetail?.name}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kategori
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Pilih Kategori</option>
                      <option value="MAKANAN_RINGAN">Makanan Ringan</option>
                      <option value="KUE_KERING">Kue Kering</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Harga
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      placeholder={productDetail?.price}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kemasan
                    </label>
                    <select
                      name="packaging"
                      value={formData.packaging}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Pilih Kemasan</option>
                      <option value="BAL">Bal</option>
                      <option value="TOPLES">Toples</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stok
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      placeholder={productDetail?.stock}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Berat
                    </label>
                    <select
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Pilih Berat</option>
                      <option value="KG_1">1kg</option>
                      <option value="KG_2">2kg</option>
                      <option value="GRAM_250">250gram</option>
                      <option value="GRAM_500">500gram</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deskripsi
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    placeholder={productDetail?.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModalUpdate(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer"
                    disabled={submitLoading}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 cursor-pointer"
                    disabled={submitLoading}
                  >
                    {submitLoading ? "Menyimpan..." : "Perbarui"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedPageAdmin>
  );
}

export default ManageProductPage;
