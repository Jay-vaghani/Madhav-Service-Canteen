import React from "react";
import { Box, Button, Typography, Snackbar, Alert } from "@mui/material";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { orderService } from "../services/orderService";
import { useState } from "react";

const CartView = () => {
    const { cart, updateQty, totalPrice, clearCart } = useCart();
    const { user } = useAuth();
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "warning" });
    const cartItems = Object.values(cart);

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
                theme: { color: "#2d68fe" },
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
                                    borderRadius: "14px",
                                    border: "1px solid rgba(0,0,0,0.06)",
                                    p: 1.5,
                                    mb: 1.5,
                                    gap: 1.5,
                                }}
                            >
                                <Box
                                    component="img"
                                    src={itemImage}
                                    alt={itemName}
                                    sx={{ width: 52, height: 52, borderRadius: "10px", objectFit: "cover", flexShrink: 0, backgroundColor: "#f1f5f9" }}
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
                                    <Typography fontFamily='"Inter", sans-serif' fontWeight={700} fontSize="0.85rem" color="#2d68fe">
                                        ₹{(item.price * item.qty).toFixed(2)}
                                    </Typography>
                                </Box>
                                {/* Qty controls */}
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, backgroundColor: "#f8f9fa", borderRadius: "20px", border: "1px solid rgba(0,0,0,0.06)", px: 0.75, py: 0.5 }}>
                                    <Box
                                        component="button"
                                        onClick={() => updateQty(itemId, -1)}
                                        sx={{ width: 26, height: 26, borderRadius: "50%", border: "none", background: "#ffffff", color: "#0f172a", fontSize: "1rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
                                    >
                                        −
                                    </Box>
                                    <Typography fontWeight={700} fontSize="0.9rem" color="#0f172a" sx={{ minWidth: 20, textAlign: "center" }}>
                                        {item.qty}
                                    </Typography>
                                    <Box
                                        component="button"
                                        onClick={() => updateQty(itemId, 1)}
                                        sx={{ width: 26, height: 26, borderRadius: "50%", border: "none", background: "#2d68fe", color: "#ffffff", fontSize: "1rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
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
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                    <Typography fontFamily='"Inter", sans-serif' fontWeight={600} fontSize="1rem" color="#0f172a">Total</Typography>
                    <Typography fontFamily='"Inter", sans-serif' fontWeight={800} fontSize="1.1rem" color="#2d68fe">₹{totalPrice.toFixed(2)}</Typography>
                </Box>
                <Button
                    onClick={processCheckout}
                    variant="contained"
                    fullWidth
                    disabled={isCheckingOut || cartItems.length === 0}
                    sx={{
                        backgroundColor: "#2d68fe",
                        color: "#ffffff",
                        py: 1.5,
                        borderRadius: "12px",
                        fontSize: "1rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        fontFamily: '"Inter", sans-serif',
                        boxShadow: "0 4px 14px rgba(45, 104, 254, 0.3)",
                        "&:hover": { backgroundColor: "#2251cd", boxShadow: "0 6px 20px rgba(45, 104, 254, 0.4)" },
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
