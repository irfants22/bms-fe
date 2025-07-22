import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../../utils/helper";

function ProtectedPageUser({ children }) {
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
  }, [navigate]);

  if (checkingAuth) return null;

  return <>{children}</>;
}

export default ProtectedPageUser;
