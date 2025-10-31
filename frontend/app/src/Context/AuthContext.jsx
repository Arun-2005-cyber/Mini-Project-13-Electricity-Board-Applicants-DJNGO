import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem("token") || null);

  // ✅ Login handler
  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", authToken);
  };

  // ✅ Logout handler
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  // ✅ Check login based on token only (backend handles permission)
  const isAuthenticated = !!token;

  // ✅ Fetch current user after refresh
  useEffect(() => {
    const fetchUser = async () => {
      if (token && !user) {
        try {
          const res = await fetch("http://127.0.0.1:8000/me/", {
            headers: { Authorization: `Token ${token}` },
          });

          if (res.ok) {
            const data = await res.json();
            setUser(data);
            localStorage.setItem("user", JSON.stringify(data));
          } else {
            logout();
          }
        } catch (error) {
          console.error("Auth check failed:", error);
          logout();
        }
      }
    };

    fetchUser();
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
