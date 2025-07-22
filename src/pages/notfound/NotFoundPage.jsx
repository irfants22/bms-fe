import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft, Search } from "lucide-react";
import { getRole, getToken } from "../../utils/helper";

const NotFoundPage = () => {
  const role = getRole();
  const token = getToken();
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    if (token && role === "true") {
      navigate("/admin/dashboard");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Animated 404 Number */}
        <div className="relative mb-8">
          <div className="text-9xl md:text-[12rem] font-bold text-blue-400 opacity-20 select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent animate-pulse">
              404
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="relative mb-8">
          <div className="absolute -top-4 -left-4 w-16 h-16 bg-blue-400 rounded-full opacity-20 animate-bounce"></div>
          <div
            className="absolute -top-8 -right-8 w-8 h-8 bg-gray-300 rounded-full opacity-30 animate-bounce"
            style={{ animationDelay: "0.5s" }}
          ></div>
          <div
            className="absolute -bottom-4 left-1/3 w-12 h-12 bg-blue-300 rounded-full opacity-25 animate-bounce"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        {/* Main Content */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8 md:p-12 mb-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
              <Search className="w-10 h-10 text-white" />
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Halaman Tidak Ditemukan
          </h1>

          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Maaf, halaman yang Anda cari tidak dapat ditemukan. Mungkin halaman
            telah dipindahkan atau URL yang dimasukkan salah.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGoHome}
              className="group inline-flex items-center px-6 py-3 bg-blue-400 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <Home className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Kembali ke Beranda
            </button>

            <button
              onClick={handleGoBack}
              className="group inline-flex items-center px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <ArrowLeft className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Halaman Sebelumnya
            </button>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-sm text-gray-500">
          <p>Jika masalah berlanjut, silakan hubungi tim support kami.</p>
        </div>

        {/* Decorative Elements */}
        <div className="mt-12 flex justify-center space-x-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          <div
            className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"
            style={{ animationDelay: "0.2s" }}
          ></div>
          <div
            className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"
            style={{ animationDelay: "0.4s" }}
          ></div>
        </div>
      </div>

      {/* Background Decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full opacity-5 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gray-300 rounded-full opacity-5 animate-pulse"></div>
      </div>
    </div>
  );
};

export default NotFoundPage;
