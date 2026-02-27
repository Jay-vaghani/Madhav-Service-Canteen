import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Box, CircularProgress } from "@mui/material";

const ProtectedRoute = ({ children, requireAdmin = false, requireCustomer = false, redirectTo = "/login" }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  if (requireAdmin && user.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  if (requireCustomer && user.role !== "student") {
    return <Navigate to="/customer-login" replace />;
  }

  return children;
};

export default ProtectedRoute;
