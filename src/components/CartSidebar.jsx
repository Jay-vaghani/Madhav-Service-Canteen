import React, { useState } from "react";
import { Box, Button, Snackbar, Alert, Checkbox, FormControlLabel } from "@mui/material";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { orderService } from "../services/orderService";

const CartSidebar = ({ onTabChange }) => {
  const { cart, updateQty, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
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
              showSnackbar(`Order #${verifyResult.orderId} placed successfully! 🎉`, "success");
              clearCart();
              if (onTabChange) onTabChange("orders");
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
                  <button onClick={() => updateQty(itemId, 1)} style={{ width: "24px", height: "24px", borderRadius: "50%", border: "none", background: "#FF6B00", color: "#ffffff", fontSize: "1rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                </div>
              </div>
            );
          })
        )}
      </Box>

      {/* Footer */}
      <Box sx={{ padding: "1.5rem", background: "#fff", borderTop: "1px solid rgba(0,0,0,0.05)" }}>
        {/* ═══ WARNING BLOCK ═══ */}
        {!dontShowWarning && cartItems.length > 0 && (
          <Box sx={{ mb: 1.5 }}>
            <Box sx={{
              display: "flex", alignItems: "center", gap: 0.75,
              backgroundColor: "#dc2626", color: "#fff",
              px: 1.5, py: 0.75,
              borderRadius: "10px 10px 0 0",
            }}>
              <span style={{ fontSize: "1rem" }}>⚠️</span>
              <span style={{ fontWeight: 800, fontSize: "0.75rem", letterSpacing: 0.5, fontFamily: '"Inter", sans-serif' }}>READ BEFORE YOU PAY</span>
            </Box>
            <Box sx={{
              backgroundColor: "#fef2f2", border: "2px solid #dc2626", borderTop: "none",
              borderRadius: "0 0 10px 10px", p: 1.25,
              display: "flex", flexDirection: "column", gap: 0.5,
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                <span style={{ fontSize: "0.9rem", lineHeight: 1.3, flexShrink: 0 }}>❌</span>
                <span style={{ fontSize: "0.75rem", color: "#7f1d1d", lineHeight: 1.4, fontFamily: '"Inter", sans-serif' }}><strong>No modifications</strong> — order cannot be changed</span>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                <span style={{ fontSize: "0.9rem", lineHeight: 1.3, flexShrink: 0 }}>❌</span>
                <span style={{ fontSize: "0.75rem", color: "#7f1d1d", lineHeight: 1.4, fontFamily: '"Inter", sans-serif' }}><strong>No cancellations</strong> — cannot cancel after payment</span>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                <span style={{ fontSize: "0.9rem", lineHeight: 1.3, flexShrink: 0 }}>❌</span>
                <span style={{ fontSize: "0.75rem", color: "#7f1d1d", lineHeight: 1.4, fontFamily: '"Inter", sans-serif' }}><strong>No refunds</strong> — under any circumstances</span>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 6, marginTop: 2, paddingTop: 6, borderTop: "1px dashed #fca5a5" }}>
                <span style={{ fontSize: "0.9rem", lineHeight: 1.3, flexShrink: 0 }}>🕐</span>
                <span style={{ fontSize: "0.75rem", color: "#7f1d1d", lineHeight: 1.4, fontFamily: '"Inter", sans-serif' }}><strong>Collect on time</strong> — missed pickup? Collect same day before <strong>5:30 PM</strong></span>
              </div>

              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={dontShowWarning}
                    onChange={handleWarningChange}
                    sx={{ color: '#dc2626', '&.Mui-checked': { color: '#dc2626' }, p: 0.5, ml: 0.2 }}
                  />
                }
                label={<span style={{ fontSize: "0.7rem", color: "#7f1d1d", fontWeight: 700, fontFamily: '"Inter", sans-serif' }}>I understand, don't show this again</span>}
                style={{ margin: 0, marginTop: "4px", borderTop: "1px solid rgba(220, 38, 38, 0.1)", paddingTop: "4px" }}
              />
            </Box>
          </Box>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem", fontSize: "1.1rem", fontWeight: 600 }}>
          <span>Total</span>
          <span style={{ color: "#FF6B00", fontWeight: 800 }}>₹{totalPrice.toFixed(0)}</span>
        </div>
        <Button
          onClick={processCheckout}
          variant="contained"
          fullWidth
          disabled={isCheckingOut || cartItems.length === 0}
          sx={{
            backgroundColor: "primary.main",
            color: "#ffffff",
            padding: "1rem",
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
