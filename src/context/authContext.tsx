import React, { createContext, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { isTokenExpired } from "@/services/utils";
interface AuthContextType {
  isAuthenticated: () => boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const isAuthenticated = () => {
    const token = localStorage.getItem("accessToken") ?? "";
    if (token.length !== 0 && !isTokenExpired(token)) {
      return true;
    } else {
      return false;
    }
  };
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("accessToken") ?? "";
    if (token.length !== 0 && isTokenExpired(token)) {
      login(token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = (token: string) => {
    localStorage.setItem("accessToken", token);
    navigate("/");
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
