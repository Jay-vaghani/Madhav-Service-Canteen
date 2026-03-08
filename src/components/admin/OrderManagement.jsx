import React, { useState, useEffect, useCallback, useRef } from "react";
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
    TextField,
    InputAdornment,
    IconButton,
    Tooltip,
    Badge,
} from "@mui/material";
import {
    CheckCircle,
    Refresh,
    Receipt,
    Person,
    Tag,
    Close,
} from "@mui/icons-material";
import { orderService } from "../../services/orderService";

/* ─── tiny styled pill ──────────────────────────────────────── */
const StatusPill = ({ status }) => {
    const isPending = status === "PENDING";
    return (
        <Box
            sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                px: 1.5,
                py: 0.5,
                borderRadius: "20px",
                fontSize: "0.72rem",
                fontWeight: 700,
                letterSpacing: 0.4,
                backgroundColor: isPending ? "#fff7ed" : "#f0fdf4",
                color: isPending ? "#c2410c" : "#15803d",
                border: `1px solid ${isPending ? "#fed7aa" : "#bbf7d0"}`,
            }}
        >
            <Box
                sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    backgroundColor: isPending ? "#f97316" : "#22c55e",
                }}
            />
            {isPending ? "Pending" : "Delivered"}
        </Box>
    );
};

/* ─── filter tab button ─────────────────────────────────────── */
const FilterTab = ({ label, value, active, count, onClick }) => (
    <Button
        onClick={() => onClick(value)}
        variant={active ? "contained" : "text"}
        size="small"
        sx={{
            textTransform: "none",
            fontWeight: 700,
            fontSize: "0.82rem",
            borderRadius: "8px",
            px: 2,
            py: 0.75,
            color: active ? "#fff" : "#64748b",
            backgroundColor: active ? "#1e293b" : "transparent",
            "&:hover": {
                backgroundColor: active ? "#0f172a" : "rgba(0,0,0,0.04)",
            },
            minWidth: "unset",
        }}
    >
        {label}
        {count != null && (
            <Box
                component="span"
                sx={{
                    ml: 1,
                    px: 0.8,
                    py: 0.1,
                    borderRadius: "6px",
                    fontSize: "0.7rem",
                    fontWeight: 800,
                    backgroundColor: active ? "rgba(255,255,255,0.2)" : "#e2e8f0",
                    color: active ? "#fff" : "#475569",
                }}
            >
                {count}
            </Box>
        )}
    </Button>
);

/* ════════════════════════════════════════════════════════════════
   ORDER MANAGEMENT
════════════════════════════════════════════════════════════════ */
const OrderManagement = ({ isAdmin = false }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false); // separate spinner for search
    const [filter, setFilter] = useState("pending");

    // Two independent search fields
    const [orderSearch, setOrderSearch] = useState(""); // order number suffix
    const [customerSearch, setCustomerSearch] = useState(""); // name or phone

    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
    const [detailOrder, setDetailOrder] = useState(null);
    const [deliveringId, setDeliveringId] = useState(null);

    const debounceRef = useRef(null);  // debounce timer
    const intervalRef = useRef(null);  // auto-refresh interval

    const hasSearch = orderSearch.trim() !== "" || customerSearch.trim() !== "";

    /* ── base fetch (no search) — used for auto-refresh ─────── */
    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const data = await orderService.getPaidOrders(filter);
            setOrders(data);
        } catch {
            setSnackbar({ open: true, message: "Failed to load orders", severity: "error" });
        } finally {
            setLoading(false);
        }
    }, [filter]);

    /* ── server-side search — called after debounce ──────────── */
    const runSearch = useCallback(async (orderNum, customer, status) => {
        setSearching(true);
        try {
            const data = await orderService.searchOrders({ orderNum, customer, status });
            setOrders(data);
        } catch {
            setSnackbar({ open: true, message: "Search failed", severity: "error" });
        } finally {
            setSearching(false);
        }
    }, []);

    /* ── auto-refresh: runs only when no search is active ────── */
    useEffect(() => {
        // Clear any old interval
        if (intervalRef.current) clearInterval(intervalRef.current);

        if (!hasSearch) {
            // Normal mode: fetch immediately + auto-refresh every 15s
            fetchOrders();
            intervalRef.current = setInterval(fetchOrders, 15000);
        } else {
            // Search mode: stop auto-refresh (debounce handles it)
            // results are stale but search is intent-driven
        }

        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter, hasSearch, fetchOrders]);

    /* ── debounce: fire search 400ms after user stops typing ─── */
    useEffect(() => {
        if (!hasSearch) return; // non-search path handled above

        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            runSearch(orderSearch, customerSearch, filter);
        }, 400);

        return () => clearTimeout(debounceRef.current);
    }, [orderSearch, customerSearch, filter, hasSearch, runSearch]);

    /* ── visibleOrders: server already filtered, just use as-is  */
    const visibleOrders = orders;

    /* ── counts: from current visible list ───────────────────── */
    const pendingCount = orders.filter((o) => o.deliveryStatus === "PENDING").length;
    const deliveredCount = orders.filter((o) => o.deliveryStatus === "DELIVERED").length;

    /* ── deliver action ─────────────────────────────────────── */
    const handleDeliver = async (orderId) => {
        setDeliveringId(orderId);
        try {
            await orderService.markDelivered(orderId);
            setSnackbar({ open: true, message: "Order marked as delivered! ✅", severity: "success" });
            // Optimistic remove from pending view, then re-fetch
            setOrders((prev) => prev.filter((o) => o._id !== orderId));
            // Re-sync after short delay
            setTimeout(() => {
                if (hasSearch) runSearch(orderSearch, customerSearch, filter);
                else fetchOrders();
            }, 800);
        } catch (error) {
            setSnackbar({
                open: true,
                message: error.response?.data?.error || "Failed to mark as delivered",
                severity: "error",
            });
        } finally {
            setDeliveringId(null);
        }
    };

    /* ── helpers ────────────────────────────────────────────── */
    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleString("en-IN", {
            day: "2-digit", month: "short",
            hour: "2-digit", minute: "2-digit", hour12: true,
        });
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return "";
        const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
        if (diff < 1) return "Just now";
        if (diff < 60) return `${diff}m ago`;
        if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
        return formatDate(dateStr);
    };

    const clearSearches = () => { setOrderSearch(""); setCustomerSearch(""); };

    /* ── render ─────────────────────────────────────────────── */
    return (
        <Box>
            {/* ── Top toolbar ────────────────────────────────────── */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 2.5,
                    flexWrap: "wrap",
                    gap: 1.5,
                }}
            >
                {/* Filter tabs */}
                <Box
                    sx={{
                        display: "flex",
                        gap: 0.5,
                        backgroundColor: "#f1f5f9",
                        borderRadius: "10px",
                        p: 0.5,
                    }}
                >
                    <FilterTab label="Pending" value="pending" active={filter === "pending"} count={filter === "pending" ? pendingCount : undefined} onClick={setFilter} />
                    <FilterTab label="Delivered" value="delivered" active={filter === "delivered"} count={filter === "delivered" ? deliveredCount : undefined} onClick={setFilter} />
                    <FilterTab label="All" value="all" active={filter === "all"} count={filter === "all" ? orders.length : undefined} onClick={setFilter} />
                </Box>

                {/* Right side: count + refresh */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    {searching ? (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                            <CircularProgress size={14} thickness={5} sx={{ color: "#3b82f6" }} />
                            <Typography variant="body2" sx={{ color: "#3b82f6", fontWeight: 600 }}>Searching…</Typography>
                        </Box>
                    ) : (
                        <Typography variant="body2" sx={{ color: "#94a3b8", fontWeight: 600 }}>
                            {visibleOrders.length} order{visibleOrders.length !== 1 ? "s" : ""}
                            {hasSearch && " found"}
                        </Typography>
                    )}
                    <Tooltip title="Refresh orders">
                        <IconButton
                            size="small"
                            onClick={fetchOrders}
                            sx={{
                                backgroundColor: "#f1f5f9",
                                border: "1px solid #e2e8f0",
                                borderRadius: "8px",
                                "&:hover": { backgroundColor: "#e2e8f0" },
                            }}
                        >
                            <Refresh sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* ── Dual search bar ───────────────────────────────── */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    gap: 1.5,
                    mb: 2.5,
                    p: 2,
                    backgroundColor: "#f8fafc",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                }}
            >
                {/* Order number search */}
                <Box>
                    <Typography
                        variant="caption"
                        sx={{ fontWeight: 700, color: "#64748b", letterSpacing: 0.5, mb: 0.5, display: "block" }}
                    >
                        SEARCH BY ORDER #
                    </Typography>
                    <TextField
                        size="small"
                        fullWidth
                        placeholder="e.g. 17 or 08032026-17"
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Tag sx={{ fontSize: 18, color: "#94a3b8" }} />
                                </InputAdornment>
                            ),
                            endAdornment: orderSearch && (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => setOrderSearch("")}>
                                        <Close sx={{ fontSize: 16 }} />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                borderRadius: "10px",
                                backgroundColor: "#fff",
                                fontSize: "0.875rem",
                                "& fieldset": { borderColor: orderSearch ? "#3b82f6" : "#e2e8f0" },
                            },
                        }}
                    />
                </Box>

                {/* Customer name / phone search */}
                <Box>
                    <Typography
                        variant="caption"
                        sx={{ fontWeight: 700, color: "#64748b", letterSpacing: 0.5, mb: 0.5, display: "block" }}
                    >
                        SEARCH BY CUSTOMER
                    </Typography>
                    <TextField
                        size="small"
                        fullWidth
                        placeholder="Name or phone number"
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Person sx={{ fontSize: 18, color: "#94a3b8" }} />
                                </InputAdornment>
                            ),
                            endAdornment: customerSearch && (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => setCustomerSearch("")}>
                                        <Close sx={{ fontSize: 16 }} />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                borderRadius: "10px",
                                backgroundColor: "#fff",
                                fontSize: "0.875rem",
                                "& fieldset": { borderColor: customerSearch ? "#3b82f6" : "#e2e8f0" },
                            },
                        }}
                    />
                </Box>

                {/* Clear all button — only shown when there's active search */}
                {hasSearch && (
                    <Box sx={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="caption" sx={{ color: "#64748b" }}>
                            Showing {visibleOrders.length} result{visibleOrders.length !== 1 ? "s" : ""} for current filters
                        </Typography>
                        <Button
                            size="small"
                            onClick={clearSearches}
                            sx={{ textTransform: "none", color: "#3b82f6", fontWeight: 600, fontSize: "0.75rem", p: 0, minWidth: "unset" }}
                        >
                            Clear all
                        </Button>
                    </Box>
                )}
            </Box>

            {/* ── Orders table ─────────────────────────────────── */}
            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                    <CircularProgress size={36} />
                </Box>
            ) : visibleOrders.length === 0 ? (
                <Box
                    sx={{
                        textAlign: "center",
                        py: 8,
                        backgroundColor: "#f8fafc",
                        borderRadius: "16px",
                        border: "1px dashed #cbd5e1",
                    }}
                >
                    <Receipt sx={{ fontSize: 48, color: "#cbd5e1", mb: 1.5 }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#64748b" }}>
                        {hasSearch ? "No orders match your search" : filter === "pending" ? "All caught up! 🎉" : "No orders found"}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#94a3b8", mt: 0.5 }}>
                        {hasSearch
                            ? "Try adjusting your search terms"
                            : filter === "pending"
                                ? "All orders have been delivered."
                                : "Orders will appear here when customers pay."}
                    </Typography>
                    {hasSearch && (
                        <Button onClick={clearSearches} sx={{ mt: 2, textTransform: "none" }} variant="outlined" size="small">
                            Clear search
                        </Button>
                    )}
                </Box>
            ) : (
                <TableContainer
                    component={Paper}
                    elevation={0}
                    sx={{
                        border: "1px solid #e2e8f0",
                        borderRadius: "16px",
                        overflowX: "auto",   // horizontal scroll on mobile
                    }}
                >
                    <Table>
                        <TableHead>
                            <TableRow
                                sx={{
                                    backgroundColor: "#f8fafc",
                                    "& th": {
                                        fontWeight: 700,
                                        fontSize: "0.72rem",
                                        letterSpacing: 0.8,
                                        color: "#64748b",
                                        textTransform: "uppercase",
                                        borderBottom: "1px solid #e2e8f0",
                                        py: 1.5,
                                    },
                                }}
                            >
                                <TableCell>Order #</TableCell>
                                <TableCell>Customer</TableCell>
                                <TableCell>Items</TableCell>
                                <TableCell align="right">Amount</TableCell>
                                <TableCell>Time</TableCell>
                                <TableCell>Status</TableCell>
                                {isAdmin && filter !== "pending" && <TableCell>Delivered By</TableCell>}
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {visibleOrders.map((order, idx) => {
                                const isPending = order.deliveryStatus === "PENDING";
                                return (
                                    <TableRow
                                        key={order._id}
                                        sx={{
                                            backgroundColor: isPending ? "#fffbeb" : "#fff",
                                            borderLeft: isPending ? "3px solid #f59e0b" : "3px solid transparent",
                                            transition: "background 0.15s",
                                            "&:hover": { backgroundColor: isPending ? "#fef3c7" : "#f8fafc" },
                                            "&:last-child td": { borderBottom: 0 },
                                            "& td": { py: 2, borderBottom: idx === visibleOrders.length - 1 ? "none" : "1px solid #f1f5f9" },
                                        }}
                                    >
                                        {/* Order ID */}
                                        <TableCell>
                                            <Typography
                                                sx={{
                                                    fontFamily: "'Courier New', monospace",
                                                    fontWeight: 700,
                                                    fontSize: "0.82rem",
                                                    color: "#1e293b",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                #{order.orderId}
                                            </Typography>
                                        </TableCell>

                                        {/* Customer */}
                                        <TableCell>
                                            <Typography sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#1e293b" }}>
                                                {order.customerName}
                                            </Typography>
                                            <Typography sx={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 500 }}>
                                                {order.customerPhone}
                                            </Typography>
                                        </TableCell>

                                        {/* Items */}
                                        <TableCell sx={{ maxWidth: 220 }}>
                                            <Typography
                                                sx={{ fontSize: "0.82rem", color: "#475569", lineHeight: 1.5 }}
                                                title={order.items.map((i) => `${i.name} ×${i.quantity}`).join(", ")}
                                            >
                                                {order.items.map((i) => `${i.name} ×${i.quantity}`).join(", ")}
                                            </Typography>
                                        </TableCell>

                                        {/* Amount */}
                                        <TableCell align="right">
                                            <Typography sx={{ fontWeight: 800, fontSize: "0.9rem", color: "#1e293b" }}>
                                                ₹{order.totalAmount.toFixed(2)}
                                            </Typography>
                                        </TableCell>

                                        {/* Time */}
                                        <TableCell>
                                            <Typography sx={{ fontSize: "0.82rem", color: "#64748b", whiteSpace: "nowrap" }}>
                                                {formatTime(order.createdAt)}
                                            </Typography>
                                        </TableCell>

                                        {/* Status */}
                                        <TableCell>
                                            <StatusPill status={order.deliveryStatus} />
                                        </TableCell>

                                        {/* Delivered By (admin only, non-pending) */}
                                        {isAdmin && filter !== "pending" && (
                                            <TableCell>
                                                <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151" }}>
                                                    {order.deliveredByName || "—"}
                                                </Typography>
                                                {order.deliveredAt && (
                                                    <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                                                        {formatDate(order.deliveredAt)}
                                                    </Typography>
                                                )}
                                            </TableCell>
                                        )}

                                        {/* Actions */}
                                        <TableCell align="center">
                                            <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    onClick={() => setDetailOrder(order)}
                                                    sx={{
                                                        textTransform: "none",
                                                        fontSize: "0.75rem",
                                                        borderRadius: "8px",
                                                        border: "1px solid #e2e8f0",
                                                        color: "#475569",
                                                        fontWeight: 600,
                                                        "&:hover": { backgroundColor: "#f1f5f9", borderColor: "#cbd5e1" },
                                                    }}
                                                >
                                                    View
                                                </Button>
                                                {isPending && (
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        disabled={deliveringId === order._id}
                                                        onClick={() => handleDeliver(order._id)}
                                                        startIcon={
                                                            deliveringId === order._id
                                                                ? null
                                                                : <CheckCircle sx={{ fontSize: "14px !important" }} />
                                                        }
                                                        sx={{
                                                            textTransform: "none",
                                                            fontSize: "0.75rem",
                                                            fontWeight: 700,
                                                            borderRadius: "8px",
                                                            backgroundColor: "#16a34a",
                                                            boxShadow: "0 2px 8px rgba(22,163,74,0.3)",
                                                            "&:hover": { backgroundColor: "#15803d", boxShadow: "0 4px 12px rgba(22,163,74,0.4)" },
                                                            "&:disabled": { backgroundColor: "#d1fae5", color: "#6ee7b7" },
                                                        }}
                                                    >
                                                        {deliveringId === order._id ? "Saving…" : "Delivered"}
                                                    </Button>
                                                )}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* ── Order Detail Dialog ──────────────────────────── */}
            <Dialog
                open={!!detailOrder}
                onClose={() => setDetailOrder(null)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: "20px" } }}
            >
                {detailOrder && (
                    <>
                        <DialogTitle
                            sx={{
                                fontWeight: 800,
                                fontSize: "1.1rem",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                pb: 1,
                            }}
                        >
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                <Box
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: "10px",
                                        backgroundColor: "#f1f5f9",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Receipt sx={{ fontSize: 20, color: "#475569" }} />
                                </Box>
                                #{detailOrder.orderId}
                            </Box>
                            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                                <StatusPill status={detailOrder.deliveryStatus} />
                                <IconButton size="small" onClick={() => setDetailOrder(null)}>
                                    <Close fontSize="small" />
                                </IconButton>
                            </Box>
                        </DialogTitle>

                        <DialogContent sx={{ pt: 0 }}>
                            {/* Customer */}
                            <Box
                                sx={{
                                    p: 1.5,
                                    backgroundColor: "#f8fafc",
                                    borderRadius: "12px",
                                    mb: 2,
                                    border: "1px solid #e2e8f0",
                                }}
                            >
                                <Typography variant="caption" sx={{ fontWeight: 700, color: "#94a3b8", letterSpacing: 0.5 }}>
                                    CUSTOMER
                                </Typography>
                                <Typography sx={{ fontWeight: 700, mt: 0.25 }}>{detailOrder.customerName}</Typography>
                                <Typography variant="body2" color="text.secondary">{detailOrder.customerPhone}</Typography>
                            </Box>

                            {/* Items */}
                            <Typography variant="caption" sx={{ fontWeight: 700, color: "#94a3b8", letterSpacing: 0.5 }}>
                                ITEMS
                            </Typography>
                            <List dense disablePadding sx={{ mt: 0.5 }}>
                                {detailOrder.items.map((item, idx) => (
                                    <ListItem
                                        key={idx}
                                        disableGutters
                                        sx={{
                                            py: 1,
                                            borderBottom: idx < detailOrder.items.length - 1 ? "1px solid #f1f5f9" : "none",
                                        }}
                                    >
                                        <ListItemText
                                            primary={item.name}
                                            secondary={`₹${item.price.toFixed(2)} × ${item.quantity}`}
                                            primaryTypographyProps={{ fontWeight: 600, fontSize: "0.875rem" }}
                                            secondaryTypographyProps={{ fontSize: "0.78rem" }}
                                        />
                                        <Typography sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#1e293b" }}>
                                            ₹{(item.price * item.quantity).toFixed(2)}
                                        </Typography>
                                    </ListItem>
                                ))}
                            </List>

                            <Divider sx={{ my: 1.5 }} />

                            {/* Total */}
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Typography sx={{ fontWeight: 700, fontSize: "1rem" }}>Total</Typography>
                                <Typography sx={{ fontWeight: 800, fontSize: "1.2rem", color: "#2563eb" }}>
                                    ₹{detailOrder.totalAmount.toFixed(2)}
                                </Typography>
                            </Box>

                            {/* Timestamps */}
                            <Box sx={{ mt: 2, p: 1.5, backgroundColor: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                                <Typography variant="caption" sx={{ color: "#94a3b8", display: "block" }}>
                                    Paid: {formatDate(detailOrder.paidAt)}
                                </Typography>
                                {detailOrder.deliveredByName && (
                                    <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", mt: 0.5 }}>
                                        Delivered by <strong>{detailOrder.deliveredByName}</strong> at {formatDate(detailOrder.deliveredAt)}
                                    </Typography>
                                )}
                            </Box>
                        </DialogContent>

                        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                            {detailOrder.deliveryStatus === "PENDING" && (
                                <Button
                                    variant="contained"
                                    startIcon={<CheckCircle />}
                                    onClick={() => { handleDeliver(detailOrder._id); setDetailOrder(null); }}
                                    sx={{
                                        textTransform: "none",
                                        fontWeight: 700,
                                        borderRadius: "10px",
                                        backgroundColor: "#16a34a",
                                        "&:hover": { backgroundColor: "#15803d" },
                                    }}
                                >
                                    Mark Delivered
                                </Button>
                            )}
                            <Button
                                onClick={() => setDetailOrder(null)}
                                sx={{ textTransform: "none", fontWeight: 600, borderRadius: "10px" }}
                            >
                                Close
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* ── Snackbar ─────────────────────────────────────── */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
                    severity={snackbar.severity}
                    sx={{ width: "100%", borderRadius: "10px", fontWeight: 600 }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default OrderManagement;
