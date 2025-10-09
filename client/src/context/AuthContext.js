import React, { createContext, useState, useEffect } from "react";
import API from "../api/api"; // ✅ use centralized axios instance

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Load user if token exists
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Token automatically attached via interceptor
      API.get("/auth/me")
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem("token");
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // ✅ Login
  const login = async (email, password) => {
    const res = await API.post("/auth/login", { email, password });
    localStorage.setItem("token", res.data.token);
    const userRes = await API.get("/auth/me");
    setUser(userRes.data);
  };

  // ✅ Register
  const register = async (name, email, password) => {
    const res = await API.post("/auth/register", { name, email, password });
    localStorage.setItem("token", res.data.token);
    const userRes = await API.get("/auth/me");
    setUser(userRes.data);
  };

  // ✅ Logout
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
