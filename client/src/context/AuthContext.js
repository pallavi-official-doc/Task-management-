import React, { createContext, useState, useEffect } from "react";
import API from "../api/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user profile if token exists
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
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

  // Login
  const login = async (email, password) => {
    try {
      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      const userRes = await API.get("/auth/me");
      setUser(userRes.data);
      return true;
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      throw new Error(err.response?.data?.msg || "Login failed");
    }
  };

  // Register
  const register = async (name, email, password) => {
    try {
      const res = await API.post("/auth/register", { name, email, password });
      localStorage.setItem("token", res.data.token);
      const userRes = await API.get("/auth/me");
      setUser(userRes.data);
      return true;
    } catch (err) {
      console.error("Registration error:", err.response?.data || err.message);
      throw new Error(err.response?.data?.msg || "Registration failed");
    }
  };

  // Logout
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
