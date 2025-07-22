import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRole, getToken } from "../../utils/helper";

function ProtectedPageAdmin({ children }) {
  const role = getRole();
  const token = getToken();
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate("/auth/login");
      setTimeout(() => {
        alert("Anda harus login terlebih dahulu.");
      }, 100);
    } else {
      setCheckingAuth(false);
    }

    if (role !== "true") {
      navigate("/auth/login");
      setTimeout(() => {
        alert("Anda tidak memiliki akses pada halaman yang dituju.");
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
