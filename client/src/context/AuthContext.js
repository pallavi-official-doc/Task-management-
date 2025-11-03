// import React, { createContext, useState, useEffect } from "react";
// import API from "../api/api";

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // Load user profile if token exists
//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       API.get("/auth/me")
//         .then((res) => setUser(res.data))
//         .catch(() => {
//           localStorage.removeItem("token");
//           setUser(null);
//         })
//         .finally(() => setLoading(false));
//     } else {
//       setLoading(false);
//     }
//   }, []);

//   // Login
//   const login = async (email, password) => {
//     try {
//       const res = await API.post("/auth/login", { email, password });
//       localStorage.setItem("token", res.data.token);
//       const userRes = await API.get("/auth/me");
//       setUser(userRes.data);
//       return true;
//     } catch (err) {
//       console.error("Login error:", err.response?.data || err.message);
//       throw new Error(err.response?.data?.msg || "Login failed");
//     }
//   };

//   // Register
//   const register = async (name, email, password) => {
//     try {
//       const res = await API.post("/auth/register", { name, email, password });
//       localStorage.setItem("token", res.data.token);
//       const userRes = await API.get("/auth/me");
//       setUser(userRes.data);
//       return true;
//     } catch (err) {
//       console.error("Registration error:", err.response?.data || err.message);
//       throw new Error(err.response?.data?.msg || "Registration failed");
//     }
//   };

//   // Logout
//   const logout = () => {
//     localStorage.removeItem("token");
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider value={{ user, loading, login, register, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export default AuthContext;
import React, { createContext, useState, useEffect } from "react";
import API from "../api/api";
import { socket } from "../socket"; // ✅ import socket
import { toast } from "react-toastify";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Load user on refresh & validate token
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("userInfo");

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    if (token) {
      API.get("/auth/me")
        .then((res) => {
          setUser(res.data);
          localStorage.setItem("userInfo", JSON.stringify(res.data));

          // ✅ Register user socket
          socket.emit("addUser", res.data._id);
        })
        .catch(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("userInfo");
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // ✅ Sync across tabs
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedUser = JSON.parse(localStorage.getItem("userInfo"));
      if (updatedUser) setUser(updatedUser);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // ✅ Login
  const login = async (email, password) => {
    try {
      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);

      const userRes = await API.get("/auth/me");
      setUser(userRes.data);
      localStorage.setItem("userInfo", JSON.stringify(userRes.data));

      // ✅ Add to active socket users
      socket.emit("addUser", userRes.data._id);

      return true;
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      throw new Error(err.response?.data?.msg || "Login failed");
    }
  };

  // ✅ Register
  const register = async (name, email, password) => {
    try {
      const res = await API.post("/auth/register", { name, email, password });
      localStorage.setItem("token", res.data.token);

      const userRes = await API.get("/auth/me");
      setUser(userRes.data);
      localStorage.setItem("userInfo", JSON.stringify(userRes.data));

      // ✅ Add new user to socket
      socket.emit("addUser", userRes.data._id);

      return true;
    } catch (err) {
      console.error("Registration error:", err.response?.data || err.message);
      throw new Error(err.response?.data?.msg || "Registration failed");
    }
  };

  // ✅ Logout
  const logout = async () => {
    try {
      await API.post("/auth/logout"); // update lastSeen on backend
    } catch (err) {
      console.warn("Logout API failed");
    }

    // ✅ Remove user from socket server
    if (user?._id) {
      socket.emit("removeUser", user._id);
    }

    socket.disconnect(); // ✅ close socket

    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    setUser(null);
  };
  // ✅ Handle real-time ticket notifications
  useEffect(() => {
    if (!user) return;

    // ✅ Listen for new ticket assigned
    socket.on("newTicketAlert", ({ ticketId, message }) => {
      console.info("📩 New Ticket Notification:", message);

      // Optional toast (if using react-toastify)
      if (window?.toast) {
        window.toast.info(message);
      }
    });

    // ✅ Live ticket comments refresh
    socket.on("ticketCommentUpdate", ({ ticketId }) => {
      console.info("💬 Ticket comment update:", ticketId);

      // Optional: refresh UI only if user is on ticket page
      if (window.location.pathname.includes(`/tickets/${ticketId}`)) {
        // Let TicketDetails page pick this up
        window.dispatchEvent(new Event("ticketCommentRefresh"));
      }
    });

    return () => {
      socket.off("newTicketAlert");
      socket.off("ticketCommentUpdate");
    };
  }, [user]);
  socket.on("eventNotification", (data) => {
    toast.info(data.message);
  });

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
