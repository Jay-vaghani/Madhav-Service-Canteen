import React from "react";
import { Box, Button, Typography, Snackbar, Alert, Checkbox, FormControlLabel } from "@mui/material";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { orderService } from "../services/orderService";
import { useState } from "react";

const CartView = ({ onTabChange }) => {
    const { cart, updateQty, totalPrice, clearCart } = useCart();
    const { user } = useAuth();
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "warning" });
    const [dontShowWarning, setDontShowWarning] = useState(() => localStorage.getItem('hideOrderWarning') === 'true');
    const cartItems = Object.values(cart);

    const handleWarningChange = (e) => {
        setDontShowWarning(e.target.checked);
        localStorage.setItem('hideOrderWarning', e.target.checked);
    };

    const showSnackbar = (message, severity = "warning") => {
        setSnackbar({ open: true, message, severity });
    };

    const processCheckout = async () => {
        if (totalPrice === 0 || cartItems.length === 0) {
            showSnackbar("Please add items first.", "warning");
            return;
        }
        setIsCheckingOut(true);
        try {
            const items = cartItems.map((item) => ({
                menuItemId: item._id || item.id,
                quantity: item.qty,
            }));
            const orderData = await orderService.createOrder(items);
            const options = {
                key: orderData.keyId,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "Madhav Services",
                description: orderData.description,
                order_id: orderData.razorpayOrderId,
                prefill: {
                    name: orderData.customerName || user?.name || "",
                    contact: orderData.customerPhone
                        ? `+91${orderData.customerPhone}`
                        : user?.phone ? `+91${user.phone}` : "",
                },
                theme: { color: "#FF6B00" },
                timeout: 1800,
                handler: async function (response) {
                    try {
                        const verifyResult = await orderService.verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });
                        if (verifyResult.success) {
                            showSnackbar(`Order #${verifyResult.orderId} placed! 🎉`, "success");
                            clearCart();
                            if (onTabChange) onTabChange("orders");
                        } else {
                            showSnackbar("Payment received, verification pending.", "info");
                        }
                    } catch {
                        showSnackbar("Payment received. Confirming shortly.", "info");
                        clearCart();
                    } finally {
                        setIsCheckingOut(false);
                    }
                },
                modal: {
                    ondismiss: function () {
                        setIsCheckingOut(false);
                        showSnackbar("Payment cancelled.", "warning");
                    },
                },
            };
            if (typeof window.Razorpay === "undefined") {
                showSnackbar("Payment system not loaded. Refresh page.", "error");
                setIsCheckingOut(false);
                return;
            }
            const rzp = new window.Razorpay(options);
            rzp.on("payment.failed", function (response) {
                showSnackbar(response.error?.description || "Payment failed.", "error");
                setIsCheckingOut(false);
            });
            rzp.open();
        } catch (error) {
            const errorMsg = error.response?.data?.error || "Failed to create order.";
            showSnackbar(error.response?.status === 401 ? "Session expired. Please login again." : errorMsg, "error");
            setIsCheckingOut(false);
        }
    };

    return (
        <Box sx={{ height: "100%", overflow: "hidden", display: "flex", flexDirection: "column", backgroundColor: "#f8f9fa" }}>
            {/* Header */}
            <Box sx={{ px: 2, py: 2, backgroundColor: "#ffffff", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                <Typography fontFamily='"Inter", sans-serif' fontWeight={800} fontSize="1.25rem" color="#0f172a">
                    Your Order
                </Typography>
                {cartItems.length > 0 && (
                    <Typography fontSize="0.8rem" color="#94a3b8" fontFamily='"Inter", sans-serif'>
                        {cartItems.reduce((s, i) => s + i.qty, 0)} items
                    </Typography>
                )}
            </Box>

            {/* Items list */}
            <Box sx={{ flex: 1, overflowY: "auto", px: 2, py: 2 }}>
                {cartItems.length === 0 ? (
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60%", gap: 1 }}>
                        <Typography fontSize="2.5rem">🛒</Typography>
                        <Typography fontFamily='"Inter", sans-serif' color="#94a3b8" fontWeight={500} textAlign="center">
                            Your cart is empty
                        </Typography>
                        <Typography fontSize="0.8rem" fontFamily='"Inter", sans-serif' color="#c1c9d6" textAlign="center">
                            Add items from the Menu tab to get started
                        </Typography>
                    </Box>
                ) : (
                    cartItems.map((item) => {
                        const itemId = item._id || item.id;
                        const itemName = item.name || item.title;
                        const itemImage = item.imageUrl || item.image;
                        return (
                            <Box
                                key={itemId}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    backgroundColor: "#ffffff",
                                    borderRadius: "16px",
                                    border: "1px solid rgba(0,0,0,0.04)",
                                    boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
                                    p: 1.5,
                                    mb: 1.5,
                                    gap: 1.5,
                                }}
                            >
                                <Box
                                    component="img"
                                    src={itemImage}
                                    alt={itemName}
                                    sx={{ width: 64, height: 64, borderRadius: "12px", objectFit: "cover", flexShrink: 0, backgroundColor: "#f8fafc" }}
                                />
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography
                                        fontFamily='"Inter", sans-serif'
                                        fontWeight={600}
                                        fontSize="0.875rem"
                                        color="#0f172a"
                                        sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                                    >
                                        {itemName}
                                    </Typography>
                                    <Typography fontFamily='"Inter", sans-serif' fontWeight={800} fontSize="0.95rem" color="primary.main">
                                        ₹{(item.price * item.qty).toFixed(0)}
                                    </Typography>
                                </Box>
                                {/* Qty controls */}
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, backgroundColor: "primary.light", borderRadius: "50px", border: "1px solid rgba(255,107,0,0.1)", px: 0.5, py: 0.5 }}>
                                    <Box
                                        component="button"
                                        onClick={() => updateQty(itemId, -1)}
                                        sx={{ width: 28, height: 28, borderRadius: "50%", border: "none", background: "#ffffff", color: "primary.dark", fontSize: "1.2rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.06)", transition: "all 0.2s", "&:hover": { transform: "scale(1.05)" }, "&:active": { transform: "scale(0.95)" } }}
                                    >
                                        −
                                    </Box>
                                    <Typography fontWeight={800} fontSize="0.95rem" color="text.primary" sx={{ minWidth: 20, textAlign: "center", fontFamily: '"Inter", sans-serif' }}>
                                        {item.qty}
                                    </Typography>
                                    <Box
                                        component="button"
                                        onClick={() => updateQty(itemId, 1)}
                                        sx={{ width: 28, height: 28, borderRadius: "50%", border: "none", background: "primary.main", color: "#ffffff", fontSize: "1.2rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(255,107,0,0.2)", transition: "all 0.2s", "&:hover": { background: "primary.dark", transform: "scale(1.05)" }, "&:active": { transform: "scale(0.95)" } }}
                                    >
                                        +
                                    </Box>
                                </Box>
                            </Box>
                        );
                    })
                )}
            </Box>

            {/* Footer */}
            <Box sx={{ p: 2, backgroundColor: "#ffffff", borderTop: "1px solid rgba(0,0,0,0.05)" }}>
                {/* ═══ WARNING BLOCK ═══ */}
                {!dontShowWarning && cartItems.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                        {/* Danger header */}
                        <Box sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.75,
                            backgroundColor: "#dc2626",
                            color: "#fff",
                            px: 1.5,
                            py: 1,
                            borderRadius: "10px 10px 0 0",
                        }}>
                            <span style={{ fontSize: "1.1rem" }}>⚠️</span>
                            <Typography fontFamily='"Inter", sans-serif' fontWeight={800} fontSize="0.8rem" letterSpacing={0.5}>
                                READ BEFORE YOU PAY
                            </Typography>
                        </Box>

                        {/* Warning cards */}
                        <Box sx={{
                            backgroundColor: "#fef2f2",
                            border: "2px solid #dc2626",
                            borderTop: "none",
                            borderRadius: "0 0 10px 10px",
                            p: 1.25,
                            display: "flex",
                            flexDirection: "column",
                            gap: 0.75,
                        }}>
                            {/* Warning 1 — No modifications */}
                            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.75 }}>
                                <span style={{ fontSize: "1rem", lineHeight: 1.3, flexShrink: 0 }}>❌</span>
                                <Typography fontFamily='"Inter", sans-serif' fontSize="0.78rem" color="#7f1d1d" lineHeight={1.4}>
                                    <strong>No modifications</strong> — once placed, your order cannot be changed
                                </Typography>
                            </Box>

                            {/* Warning 2 — No cancellations */}
                            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.75 }}>
                                <span style={{ fontSize: "1rem", lineHeight: 1.3, flexShrink: 0 }}>❌</span>
                                <Typography fontFamily='"Inter", sans-serif' fontSize="0.78rem" color="#7f1d1d" lineHeight={1.4}>
                                    <strong>No cancellations</strong> — orders cannot be cancelled after payment
                                </Typography>
                            </Box>

                            {/* Warning 3 — No refunds */}
                            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.75 }}>
                                <span style={{ fontSize: "1rem", lineHeight: 1.3, flexShrink: 0 }}>❌</span>
                                <Typography fontFamily='"Inter", sans-serif' fontSize="0.78rem" color="#7f1d1d" lineHeight={1.4}>
                                    <strong>No refunds</strong> — refunds are not provided under any circumstances
                                </Typography>
                            </Box>

                            {/* Warning 4 — Collection timing */}
                            <Box sx={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 0.75,
                                mt: 0.25,
                                pt: 0.75,
                                borderTop: "1px dashed #fca5a5",
                            }}>
                                <span style={{ fontSize: "1rem", lineHeight: 1.3, flexShrink: 0 }}>🕐</span>
                                <Typography fontFamily='"Inter", sans-serif' fontSize="0.78rem" color="#7f1d1d" lineHeight={1.4}>
                                    <strong>Collect on time</strong> — if you miss the 30-minute pickup, you must collect the same day before <strong>5:30 PM</strong> (Canteen: 7:30 AM – 5:30 PM)
                                </Typography>
                            </Box>

                            <FormControlLabel
                                control={
                                    <Checkbox
                                        size="small"
                                        checked={dontShowWarning}
                                        onChange={handleWarningChange}
                                        sx={{ color: '#dc2626', '&.Mui-checked': { color: '#dc2626' }, p: 0.5, ml: 0.5 }}
                                    />
                                }
                                label={<Typography fontSize="0.75rem" color="#7f1d1d" fontFamily='"Inter", sans-serif' fontWeight={700}>I understand, don't show this again</Typography>}
                                sx={{ m: 0, mt: 0.5, borderTop: "1px solid rgba(220, 38, 38, 0.1)", pt: 0.5 }}
                            />
                        </Box>
                    </Box>
                )}

                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                    <Typography fontFamily='"Inter", sans-serif' fontWeight={600} fontSize="1rem" color="#0f172a">Total</Typography>
                    <Typography fontFamily='"Inter", sans-serif' fontWeight={800} fontSize="1.2rem" color="primary.main">₹{totalPrice.toFixed(0)}</Typography>
                </Box>
                <Button
                    onClick={processCheckout}
                    variant="contained"
                    fullWidth
                    disabled={isCheckingOut || cartItems.length === 0}
                    sx={{
                        backgroundColor: "primary.main",
                        color: "#ffffff",
                        py: 1.5,
                        borderRadius: "50px",
                        fontSize: "1rem",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        fontFamily: '"Inter", sans-serif',
                        boxShadow: "0 8px 20px rgba(255,107,0,0.3)",
                        "&:hover": { backgroundColor: "primary.dark", boxShadow: "0 10px 24px rgba(255,107,0,0.4)" },
                        "&:disabled": { backgroundColor: "#e2e8f0", boxShadow: "none", color: "#94a3b8" },
                    }}
                >
                    {isCheckingOut ? "Processing..." : "Pay Now"}
                </Button>
            </Box>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert
                    onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
                    severity={snackbar.severity}
                    sx={{ width: "100%", borderRadius: "8px", fontFamily: '"Inter", sans-serif' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default CartView;
