import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../../utils/helper";
import Swal from "sweetalert2";

function ProtectedPageUser({ children }) {
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
  }, [navigate]);

  if (checkingAuth) return null;

  return <>{children}</>;
}

export default ProtectedPageUser;
