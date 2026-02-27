import React, { useState, useEffect, useCallback } from "react";
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Chip,
    CircularProgress,
    Typography,
    ToggleButton,
    ToggleButtonGroup,
    Snackbar,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    Divider,
} from "@mui/material";
import {
    CheckCircle,
    LocalShipping,
    Visibility,
    Refresh,
} from "@mui/icons-material";
import { orderService } from "../../services/orderService";

const OrderManagement = ({ isAdmin = false }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("pending");
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
    });
    const [detailOrder, setDetailOrder] = useState(null);
    const [deliveringId, setDeliveringId] = useState(null);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const data = await orderService.getPaidOrders(filter);
            setOrders(data);
        } catch (error) {
            console.error("Failed to fetch orders:", error);
            setSnackbar({
                open: true,
                message: "Failed to load orders",
                severity: "error",
            });
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchOrders();
        // Auto-refresh every 15 seconds for pending orders
        const interval = setInterval(fetchOrders, 15000);
        return () => clearInterval(interval);
    }, [fetchOrders]);

    const handleDeliver = async (orderId) => {
        setDeliveringId(orderId);
        try {
            await orderService.markDelivered(orderId);
            setSnackbar({
                open: true,
                message: "Order marked as delivered! ✅",
                severity: "success",
            });
            // Remove from list if filter is "pending", else refresh
            if (filter === "pending") {
                setOrders((prev) => prev.filter((o) => o._id !== orderId));
            } else {
                fetchOrders();
            }
        } catch (error) {
            const msg =
                error.response?.data?.error || "Failed to mark as delivered";
            setSnackbar({ open: true, message: msg, severity: "error" });
        } finally {
            setDeliveringId(null);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        const d = new Date(dateStr);
        return d.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        const diff = Math.floor((Date.now() - d.getTime()) / 60000);
        if (diff < 1) return "Just now";
        if (diff < 60) return `${diff}m ago`;
        if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
        return formatDate(dateStr);
    };

    return (
        <Box>
            {/* Header with filter and refresh */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                    flexWrap: "wrap",
                    gap: 2,
                }}
            >
                <ToggleButtonGroup
                    value={filter}
                    exclusive
                    onChange={(e, v) => v && setFilter(v)}
                    size="small"
                    sx={{
                        "& .MuiToggleButton-root": {
                            textTransform: "none",
                            fontWeight: 600,
                            px: 3,
                        },
                    }}
                >
                    <ToggleButton value="pending">
                        <LocalShipping sx={{ mr: 1, fontSize: 18 }} />
                        Pending
                    </ToggleButton>
                    <ToggleButton value="delivered">
                        <CheckCircle sx={{ mr: 1, fontSize: 18 }} />
                        Delivered
                    </ToggleButton>
                    <ToggleButton value="all">All Orders</ToggleButton>
                </ToggleButtonGroup>

                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        {orders.length} order{orders.length !== 1 ? "s" : ""}
                    </Typography>
                    <Button
                        size="small"
                        startIcon={<Refresh />}
                        onClick={fetchOrders}
                        variant="outlined"
                    >
                        Refresh
                    </Button>
                </Box>
            </Box>

            {/* Orders Table */}
            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : orders.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 8, color: "text.secondary" }}>
                    <Typography variant="h6">
                        {filter === "pending"
                            ? "No pending orders 🎉"
                            : filter === "delivered"
                                ? "No delivered orders yet"
                                : "No orders found"}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                        {filter === "pending"
                            ? "All orders have been delivered!"
                            : "Orders will appear here when customers place them."}
                    </Typography>
                </Box>
            ) : (
                <TableContainer component={Paper} elevation={1}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: "#f5f5f7" }}>
                                <TableCell sx={{ fontWeight: 700 }}>Order #</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Items</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700 }}>
                                    Amount
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Time</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                {isAdmin && filter !== "pending" && (
                                    <TableCell sx={{ fontWeight: 700 }}>Delivered By</TableCell>
                                )}
                                <TableCell align="center" sx={{ fontWeight: 700 }}>
                                    Actions
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {orders.map((order) => (
                                <TableRow
                                    key={order._id}
                                    hover
                                    sx={{
                                        backgroundColor:
                                            order.deliveryStatus === "PENDING"
                                                ? "#fffde7"
                                                : "inherit",
                                        "&:hover": {
                                            backgroundColor:
                                                order.deliveryStatus === "PENDING"
                                                    ? "#fff9c4"
                                                    : undefined,
                                        },
                                    }}
                                >
                                    <TableCell>
                                        <Typography
                                            variant="body2"
                                            sx={{ fontWeight: 700, fontFamily: "monospace" }}
                                        >
                                            #{order.orderId}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {order.customerName}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            {order.customerPhone}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                                            {order.items
                                                .map((i) => `${i.name} ×${i.quantity}`)
                                                .join(", ")}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                            ₹{order.totalAmount.toFixed(2)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {formatTime(order.createdAt)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={order.deliveryStatus}
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
                                    </TableCell>
                                    {isAdmin && filter !== "pending" && (
                                        <TableCell>
                                            <Typography variant="body2">
                                                {order.deliveredByName || "—"}
                                            </Typography>
                                            {order.deliveredAt && (
                                                <Typography variant="caption" color="text.secondary">
                                                    {formatDate(order.deliveredAt)}
                                                </Typography>
                                            )}
                                        </TableCell>
                                    )}
                                    <TableCell align="center">
                                        <Box
                                            sx={{
                                                display: "flex",
                                                gap: 1,
                                                justifyContent: "center",
                                            }}
                                        >
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                startIcon={<Visibility />}
                                                onClick={() => setDetailOrder(order)}
                                                sx={{ textTransform: "none", fontSize: "0.75rem" }}
                                            >
                                                View
                                            </Button>
                                            {order.deliveryStatus === "PENDING" && (
                                                <Button
                                                    size="small"
                                                    variant="contained"
                                                    color="success"
                                                    startIcon={<CheckCircle />}
                                                    loading={deliveringId === order._id}
                                                    onClick={() => handleDeliver(order._id)}
                                                    sx={{
                                                        textTransform: "none",
                                                        fontSize: "0.75rem",
                                                        fontWeight: 700,
                                                    }}
                                                >
                                                    Delivered
                                                </Button>
                                            )}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Order Detail Dialog */}
            <Dialog
                open={!!detailOrder}
                onClose={() => setDetailOrder(null)}
                maxWidth="sm"
                fullWidth
            >
                {detailOrder && (
                    <>
                        <DialogTitle sx={{ fontWeight: 700 }}>
                            Order #{detailOrder.orderId}
                            <Chip
                                label={detailOrder.deliveryStatus}
                                size="small"
                                color={
                                    detailOrder.deliveryStatus === "DELIVERED"
                                        ? "success"
                                        : "warning"
                                }
                                sx={{ ml: 2 }}
                            />
                        </DialogTitle>
                        <DialogContent>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Customer
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    {detailOrder.customerName} — {detailOrder.customerPhone}
                                </Typography>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 1 }}
                            >
                                Items
                            </Typography>
                            <List dense disablePadding>
                                {detailOrder.items.map((item, idx) => (
                                    <ListItem key={idx} disableGutters>
                                        <ListItemText
                                            primary={item.name}
                                            secondary={`₹${item.price.toFixed(2)} × ${item.quantity}`}
                                        />
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            ₹{(item.price * item.quantity).toFixed(2)}
                                        </Typography>
                                    </ListItem>
                                ))}
                            </List>

                            <Divider sx={{ my: 2 }} />

                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                            >
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    Total
                                </Typography>
                                <Typography
                                    variant="h6"
                                    sx={{ fontWeight: 700, color: "primary.main" }}
                                >
                                    ₹{detailOrder.totalAmount.toFixed(2)}
                                </Typography>
                            </Box>

                            <Box sx={{ mt: 2 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Paid: {formatDate(detailOrder.paidAt)}
                                </Typography>
                                {detailOrder.deliveredByName && (
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        display="block"
                                    >
                                        Delivered by: {detailOrder.deliveredByName} at{" "}
                                        {formatDate(detailOrder.deliveredAt)}
                                    </Typography>
                                )}
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            {detailOrder.deliveryStatus === "PENDING" && (
                                <Button
                                    variant="contained"
                                    color="success"
                                    startIcon={<CheckCircle />}
                                    onClick={() => {
                                        handleDeliver(detailOrder._id);
                                        setDetailOrder(null);
                                    }}
                                >
                                    Mark Delivered
                                </Button>
                            )}
                            <Button onClick={() => setDetailOrder(null)}>Close</Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
                    severity={snackbar.severity}
                    sx={{ width: "100%", borderRadius: "8px" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default OrderManagement;
