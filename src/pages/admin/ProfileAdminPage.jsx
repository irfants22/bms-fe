import { getToken } from "../../utils/helper";
import { axiosInstance } from "../../lib/axios";
import { useState, useEffect, useRef } from "react";
import { Camera, User, Save, X, Edit3 } from "lucide-react";
import ProtectedPageAdmin from "../protected/ProtectedPageAdmin";
import Swal from "sweetalert2";

function ProfileAdminPage() {
  const token = getToken();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tempData, setTempData] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    address: "",
    image: "",
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get("/api/admin/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProfileData(data.data);
      setTempData(data.data);

      if (data.data.image) {
        setPreviewImage(data.data.image);
      }
    } catch (error) {
      console.error("Gagal memuat data pengguna:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTempData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        Swal.fire({
          position: "top",
          icon: "warning",
          title: "Periksa Kembali",
          text: "Pilih file gambar yang valid.",
          showConfirmButton: false,
          timer: 1500,
          width: 400,
        });
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          position: "top",
          icon: "warning",
          title: "Periksa Kembali",
          text: "Ukuran gambar maksimal 5MB.",
          showConfirmButton: false,
          timer: 1500,
          width: 400,
        });
        return;
      }

      setSelectedImage(file);
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - restore original data
      setTempData(profileData);
      setSelectedImage(null);
      setPreviewImage(profileData.image);
      setIsEditing(false);
    } else {
      // Start editing
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Create FormData for multipart/form-data
      const formData = new FormData();
      formData.append("name", tempData.name || "");
      formData.append("email", tempData.email || "");
      formData.append("phone", tempData.phone || "");
      formData.append("gender", tempData.gender || "");
      formData.append("address", tempData.address || "");

      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      const { data } = await axiosInstance.put(
        "/api/admin/users/me",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Update local state with response data
      setProfileData(data.data);
      setTempData(data.data);
      setSelectedImage(null);
      setIsEditing(false);

      if (data.data.image) {
        setPreviewImage(data.data.image);
      }

      Swal.fire({
        position: "top",
        icon: "success",
        title: "Sukses",
        text: "Profil berhasil diperbarui.",
        showConfirmButton: false,
        timer: 1500,
        width: 400,
      });
    } catch (error) {
      console.error("Gagal memperbarui profil:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data profil...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedPageAdmin>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Profil Admin</h1>
            <p className="text-gray-600 mt-1">Kelola informasi pribadi Anda</p>
          </div>

          {!isEditing && (
            <button
              onClick={handleEditToggle}
              className="flex items-center space-x-2 bg-blue-400 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Profil</span>
            </button>
          )}
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            {/* Profile Image Section */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-4 border-white shadow-lg">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-gray-400" />
                  )}
                </div>

                {isEditing && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 bg-blue-400 hover:bg-blue-500 text-white p-2 rounded-full shadow-lg transition-colors"
                    type="button"
                  >
                    <Camera className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  {profileData.name || "Nama Admin"}
                </h3>
                <p className="text-sm text-gray-600">Administrator</p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Nama */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  name="name"
                  value={tempData.name || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent focus:outline-none disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={tempData.email || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent focus:outline-none disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                  placeholder="Masukkan alamat email"
                />
              </div>

              {/* No Telepon */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  No Telepon
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={tempData.phone || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent focus:outline-none disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                  placeholder="Masukkan nomor telepon"
                />
              </div>

              {/* Jenis Kelamin */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Jenis Kelamin
                </label>
                <select
                  name="gender"
                  value={tempData.gender || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                >
                  <option value="">Pilih Jenis Kelamin</option>
                  <option value="LAKI_LAKI">Laki-laki</option>
                  <option value="PEREMPUAN">Perempuan</option>
                </select>
              </div>
            </div>

            {/* Alamat */}
            <div className="mt-6 space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Alamat Lengkap
              </label>
              <textarea
                name="address"
                value={tempData.address || ""}
                onChange={handleInputChange}
                disabled={!isEditing}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent focus:outline-none disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                placeholder="Masukkan alamat lengkap"
              />
            </div>

            {/* Action Buttons - Only show when editing */}
            {isEditing && (
              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={handleEditToggle}
                  disabled={saving}
                  className="flex items-center space-x-2 bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <span>Batal</span>
                </button>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center space-x-2 bg-blue-400 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <span>Simpan Perubahan</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedPageAdmin>
  );
}

export default ProfileAdminPage;
