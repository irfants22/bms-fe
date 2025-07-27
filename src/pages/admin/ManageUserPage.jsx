import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { axiosInstance } from "../../lib/axios";
import { formatGender, getToken } from "../../utils/helper";
import ProtectedPageAdmin from "../protected/ProtectedPageAdmin";
import Loader from "../../components/Loader";

function ManageUserPage() {
  const token = getToken();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchUsers = async (query, limit = 10, page = 1) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/api/admin/users", {
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
      const { total_users: total } = response.data.pagination;
      const { total_page: pages } = response.data.pagination;

      setUsers(data || []);
      setTotalUsers(total || 0);
      setTotalPages(pages || 0);
    } catch (error) {
      console.error("Gagal memuat data pengguna:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(searchTerm, itemsPerPage, currentPage);
  }, [searchTerm, itemsPerPage, currentPage]);

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
        <h1 className="text-2xl font-bold text-gray-900">Kelola Pengguna</h1>

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

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari pengguna..."
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
              <Loader>Memuat pengguna...</Loader>
            ) : (
              <table className="w-full min-w-max">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-48">
                      Email
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-32">
                      Nomor Telepon
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jenis Kelamin
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Alamat
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.length === 0 ? (
                    <tr>
                      <td
                        colSpan="10"
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        {searchTerm
                          ? "Tidak ada pengguna yang ditemukan"
                          : "Belum ada pengguna"}
                      </td>
                    </tr>
                  ) : (
                    users?.map((user, index) => (
                      <tr key={user?.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900 capitalize">
                          {user?.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                          {user?.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                          {user?.phone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                          {formatGender(user?.gender || "-")}
                        </td>
                        <td className="px-6 py-4 text-sm text-center text-gray-900">
                          <div
                            className="max-w-xs truncate"
                            title={user?.address}
                          >
                            {user?.address || "-"}
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
            {users.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} -{" "}
            {Math.min(currentPage * itemsPerPage, totalUsers)} dari {totalUsers}{" "}
            pengguna
          </div>
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
        </div>
      </div>
    </ProtectedPageAdmin>
  );
}

export default ManageUserPage;
