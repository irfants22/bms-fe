import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRole, getToken } from "../../utils/helper";
import Swal from "sweetalert2";

function ProtectedPageAdmin({ children }) {
  const role = getRole();
  const token = getToken();
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate("/auth/login");
      setTimeout(() => {
        Swal.fire({
          position: "top",
          icon: "warning",
          title: "Peringatan!",
          text: "Anda harus login terlebih dahulu.",
          showConfirmButton: false,
          timer: 1500,
          width: 400,
        });
      }, 100);
    } else {
      setCheckingAuth(false);
    }

    if (role !== "true") {
      navigate("/auth/login");
      setTimeout(() => {
        Swal.fire({
          position: "top",
          icon: "warning",
          title: "Peringatan!",
          text: "Anda tidak memiliki akses pada halaman yang dituju.",
          showConfirmButton: false,
          timer: 1500,
          width: 400,
        });
      }, 100);
    } else {
      setCheckingAuth(false);
    }

    if (role === "true") return;
  }, [navigate]);

  if (checkingAuth) return null;

  return <>{children}</>;
}

export default ProtectedPageAdmin;
