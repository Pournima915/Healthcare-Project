import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const RootRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role");

    if (!role) {
      navigate("/home/public", { replace: true });
      return;
    }

    if (role === "patient") {
      navigate("/patient/dashboard", { replace: true });
    } else if (role === "doctor") {
      navigate("/doctor/dashboard", { replace: true });
    } else if (role === "admin") {
      navigate("/admin/dashboard", { replace: true });
    } else {
      navigate("/home/public", { replace: true });
    }
  }, [navigate]);

  return null;
};

export default RootRedirect;
