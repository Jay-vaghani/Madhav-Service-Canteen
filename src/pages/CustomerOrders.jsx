import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    CircularProgress,
    Chip,
    Paper,
    Divider,
    IconButton,
    Snackbar,
    Alert,
} from "@mui/material";
import {
    ArrowBack,
    CheckCircle,
    AccessTime,
    Receipt,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { orderService } from "../services/orderService";
import { useAuth } from "../context/AuthContext";

const CustomerOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = await orderService.getCustomerOrders();
            setOrders(data);
        } catch (err) {
            console.error("Failed to fetch orders:", err);
            setError("Failed to load order history");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    if (loading) {
        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                    backgroundColor: "#f8f9fa",
                }}
            >
                <CircularProgress size={60} sx={{ color: "#2d68fe" }} />
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minHeight: "100vh",
                backgroundColor: "#f8f9fa",
            }}
        >
            {/* Header */}
            <Box
                component="header"
                sx={{
                    padding: { xs: "1rem", md: "1.25rem 2rem" },
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    background: "#ffffff",
                    borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                }}
            >
                <IconButton onClick={() => navigate("/")} size="small">
                    <ArrowBack />
                </IconButton>
                <Box sx={{ flex: 1 }}>
                    <Typography
                        variant="h6"
                        sx={{
                            fontFamily: '"Inter", sans-serif',
                            fontWeight: 800,
                            color: "#0f172a",
                            fontSize: "1.2rem",
                        }}
                    >
                        My Orders
                    </Typography>
                    <Typography
                        variant="caption"
                        sx={{ color: "#64748b", fontWeight: 500 }}
                    >
                        Hi, {user?.name || "Customer"}
                    </Typography>
                </Box>
            </Box>

            {/* Orders List */}
            <Box sx={{ padding: { xs: "1rem", md: "2rem" }, maxWidth: 800, mx: "auto" }}>
                {orders.length === 0 ? (
                    <Box sx={{ textAlign: "center", py: 8 }}>
                        <Receipt sx={{ fontSize: 64, color: "#cbd5e1", mb: 2 }} />
                        <Typography variant="h6" sx={{ color: "#64748b", fontWeight: 600 }}>
                            No orders yet
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#94a3b8", mt: 1 }}>
                            Your order history will appear here after your first purchase.
                        </Typography>
                    </Box>
                ) : (
                    orders.map((order) => (
                        <Paper
                            key={order._id}
                            elevation={0}
                            sx={{
                                mb: 2,
                                borderRadius: "16px",
                                border: "1px solid rgba(0,0,0,0.06)",
                                overflow: "hidden",
                                transition: "all 0.2s ease",
                                "&:hover": {
                                    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                                },
                            }}
                        >
                            {/* Order Header */}
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    padding: "1rem 1.25rem",
                                    backgroundColor:
                                        order.deliveryStatus === "DELIVERED"
                                            ? "#f0fdf4"
                                            : "#fffbeb",
                                }}
                            >
                                <Box>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontWeight: 700,
                                            fontFamily: "monospace",
                                            fontSize: "0.9rem",
                                            color: "#0f172a",
                                        }}
                                    >
                                        #{order.orderId}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        sx={{ color: "#64748b" }}
                                    >
                                        {formatDate(order.createdAt)}
                                    </Typography>
                                </Box>
                                <Chip
                                    icon={
                                        order.deliveryStatus === "DELIVERED" ? (
                                            <CheckCircle sx={{ fontSize: 16 }} />
                                        ) : (
                                            <AccessTime sx={{ fontSize: 16 }} />
                                        )
                                    }
                                    label={
                                        order.deliveryStatus === "DELIVERED"
                                            ? "Delivered"
                                            : "Preparing"
                                    }
                                    size="small"
                                    color={
                                        order.deliveryStatus === "DELIVERED"
                                            ? "success"
                                            : "warning"
                                    }
                                    sx={{
                                        fontWeight: 700,
                                        fontSize: "0.75rem",
                                    }}
                                />
                            </Box>

                            {/* Order Items */}
                            <Box sx={{ padding: "0.75rem 1.25rem" }}>
                                {order.items.map((item, idx) => (
                                    <Box
                                        key={idx}
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            py: 0.5,
                                        }}
                                    >
                                        <Typography
                                            variant="body2"
                                            sx={{ color: "#374151", fontWeight: 500 }}
                                        >
                                            {item.name}{" "}
                                            <span style={{ color: "#94a3b8" }}>
                                                ×{item.quantity}
                                            </span>
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{ color: "#64748b", fontWeight: 500 }}
                                        >
                                            ₹{(item.price * item.quantity).toFixed(2)}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>

                            <Divider />

                            {/* Order Footer */}
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    padding: "0.75rem 1.25rem",
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    sx={{ fontWeight: 600, color: "#0f172a" }}
                                >
                                    Total
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{ fontWeight: 800, color: "#2d68fe" }}
                                >
                                    ₹{order.totalAmount.toFixed(2)}
                                </Typography>
                            </Box>

                            {/* Delivery Info */}
                            {order.deliveryStatus === "DELIVERED" && order.deliveredAt && (
                                <Box
                                    sx={{
                                        padding: "0.5rem 1.25rem 0.75rem",
                                        backgroundColor: "#f8fafb",
                                    }}
                                >
                                    <Typography variant="caption" sx={{ color: "#64748b" }}>
                                        Delivered on {formatDate(order.deliveredAt)}
                                    </Typography>
                                </Box>
                            )}
                        </Paper>
                    ))
                )}
            </Box>

            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={() => setError("")}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    onClose={() => setError("")}
                    severity="error"
                    sx={{ width: "100%", borderRadius: "8px" }}
                >
                    {error}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default CustomerOrders;
