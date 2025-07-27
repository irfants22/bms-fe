import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { axiosInstance } from "../../lib/axios";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { transformLoginError } from "../../utils/helper";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: false,
    emailMsgError: "",
    password: false,
    passwordMsgError: "",
  });
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setLoading(true);
    setErrors({
      email: false,
      emailMsgError: "",
      password: false,
      passwordMsgError: "",
    });

    try {
      const { data } = await axiosInstance.post(
        "/api/auth/login",
        {
          email,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const { token, is_admin } = data.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", is_admin);

      if (is_admin) {
        Swal.fire({
          position: "top",
          icon: "success",
          title: "Sukses",
          text: "Anda berhasil masuk.",
          showConfirmButton: false,
          timer: 1500,
          width: 400,
        });
        return navigate("/admin/dashboard");
      }

      Swal.fire({
        position: "top",
        icon: "success",
        title: "Sukses",
        text: "Anda berhasil masuk.",
        showConfirmButton: false,
        timer: 1500,
        width: 400,
      });
      navigate("/");
    } catch (error) {
      if (error) {
        const message = error.response?.data?.errors;
        setErrors(transformLoginError(message));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-10">
      <div className="bg-white rounded-xl shadow-lg p-8">
        {/* Judul Form */}
        <div className="text-left mb-8">
          <h2 className="text-base font-bold text-white bg-blue-400 rounded-lg py-3 px-6">
            Masuk
          </h2>
        </div>

        {/* Form Login */}
        <div className="space-y-6">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@mail.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-colors"
            />
            {errors.email && (
              <p className="text-red-600 text-sm font-medium mt-2">
                {errors.emailMsgError}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-colors pr-12"
              />
              {errors.password && (
                <p className="text-red-600 text-sm font-medium mt-2">
                  {errors.passwordMsgError}
                </p>
              )}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 ${
                  errors.password ? "top-1/3" : "top-1/2"
                } transform -translate-y-1/2 text-gray-500 hover:text-gray-700`}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Tombol Login */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-white hover:bg-blue-400 text-blue-400 hover:text-white ring-1 ring-blue-400 font-semibold py-3 px-6 rounded-lg transition-colors duration-200 cursor-pointer"
          >
            {loading ? (
              <div className="flex items-center justify-center min-h-min">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-blue-400 mx-auto"></div>
                </div>
              </div>
            ) : (
              "Masuk"
            )}
          </button>
        </div>

        {/* Link Register */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Belum punya akun?{" "}
            <Link
              to="/auth/register"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Daftar disini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
