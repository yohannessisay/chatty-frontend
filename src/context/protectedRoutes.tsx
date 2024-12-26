import { useAuth } from "@/services/contexts";
import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";

export const ProtectedRoute = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  return isAuthenticated() ? <Outlet /> : null;
};
