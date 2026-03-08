import React, { useState } from "react";
import { Box, Button, Snackbar, Alert } from "@mui/material";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { orderService } from "../services/orderService";

const CartSidebar = () => {
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
              showSnackbar(`Order #${verifyResult.orderId} placed successfully! 🎉`, "success");
              clearCart();
            } else {
              showSnackbar("Payment received but verification pending.", "info");
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
            showSnackbar("Payment cancelled. Your order is saved for 30 minutes.", "warning");
          },
        },
      };
      if (typeof window.Razorpay === "undefined") {
        showSnackbar("Payment system not loaded. Please refresh the page.", "error");
        setIsCheckingOut(false);
        return;
      }
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        showSnackbar(response.error?.description || "Payment failed. Please try again.", "error");
        setIsCheckingOut(false);
      });
      rzp.open();
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Failed to create order. Please try again.";
      showSnackbar(
        error.response?.status === 401 ? "Session expired. Please login again." : errorMsg,
        "error"
      );
      setIsCheckingOut(false);
    }
  };

  return (
    <Box
      sx={{
        width: "360px",
        height: "100%",
        background: "#f8f9fa",
        borderLeft: "1px solid rgba(0,0,0,0.06)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <Box sx={{ padding: "1.5rem", borderBottom: "1px solid rgba(0,0,0,0.04)", background: "#ffffff" }}>
        <h2 style={{ fontFamily: '"Inter", sans-serif', fontSize: "1.25rem", fontWeight: 800, margin: 0, color: "#0f172a" }}>
          Your Order
        </h2>
      </Box>

      {/* Items */}
      <Box sx={{ flex: 1, overflowY: "auto", padding: "1rem" }}>
        {cartItems.length === 0 ? (
          <p style={{ textAlign: "center", color: "#94a3b8", marginTop: "3rem", fontSize: "0.9rem", fontStyle: "italic" }}>
            Select items from the menu to start your order.
          </p>
        ) : (
          cartItems.map((item) => {
            const itemId = item._id || item.id;
            const itemName = item.name || item.title;
            const itemImage = item.imageUrl || item.image;
            return (
              <div
                key={itemId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "#ffffff",
                  padding: "1rem",
                  borderRadius: "12px",
                  marginBottom: "1rem",
                  border: "1px solid rgba(0,0,0,0.06)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                }}
              >
                <img
                  src={itemImage}
                  alt={itemName}
                  style={{ width: "50px", height: "50px", borderRadius: "8px", objectFit: "cover", marginRight: "1rem", background: "#f8f9fa" }}
                />
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: "0.9rem", margin: 0, color: "#0f172a", fontWeight: 600, fontFamily: '"Inter", sans-serif' }}>
                    {itemName}
                  </h4>
                  <div style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 500 }}>₹{item.price.toFixed(2)}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f8f9fa", padding: "4px", borderRadius: "20px", border: "1px solid rgba(0,0,0,0.04)" }}>
                  <button onClick={() => updateQty(itemId, -1)} style={{ width: "24px", height: "24px", borderRadius: "50%", border: "none", background: "#ffffff", color: "#0f172a", fontSize: "1rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>−</button>
                  <span style={{ fontSize: "0.9rem", fontWeight: 700, minWidth: "20px", textAlign: "center", color: "#0f172a" }}>{item.qty}</span>
                  <button onClick={() => updateQty(itemId, 1)} style={{ width: "24px", height: "24px", borderRadius: "50%", border: "none", background: "#2d68fe", color: "#ffffff", fontSize: "1rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                </div>
              </div>
            );
          })
        )}
      </Box>

      {/* Footer */}
      <Box sx={{ padding: "1.5rem", background: "#fff", borderTop: "1px solid rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem", fontSize: "1.1rem", fontWeight: 600 }}>
          <span>Total</span>
          <span style={{ color: "#2d68fe" }}>₹{totalPrice.toFixed(2)}</span>
        </div>
        <Button
          onClick={processCheckout}
          variant="contained"
          fullWidth
          disabled={isCheckingOut || cartItems.length === 0}
          sx={{
            backgroundColor: "#2d68fe",
            color: "#ffffff",
            padding: "1rem",
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
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
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

export default CartSidebar;
