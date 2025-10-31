import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  // ✅ also check token in localStorage
  const token = localStorage.getItem("token");

  return isAuthenticated || token ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
