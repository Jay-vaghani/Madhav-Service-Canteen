import React, { useState } from "react";
import { Box, Button, useMediaQuery, SwipeableDrawer, Snackbar, Alert } from "@mui/material";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { orderService } from "../services/orderService";

const drawerBleeding = 80;

const CartSidebar = () => {
  const { cart, updateQty, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "warning",
  });
  const isMobile = useMediaQuery("(max-width:900px)");

  const cartItems = Object.values(cart);

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const showSnackbar = (message, severity = "warning") => {
    setSnackbar({ open: true, message, severity });
  };

  // ═══════════════════════════════════════════════════════════
  //  RAZORPAY CHECKOUT FLOW
  // ═══════════════════════════════════════════════════════════
  const processCheckout = async () => {
    if (totalPrice === 0 || cartItems.length === 0) {
      showSnackbar("Please add items first.", "warning");
      return;
    }

    setIsCheckingOut(true);

    try {
      // ── Step 1: Create order on backend (server calculates amount) ──
      const items = cartItems.map((item) => ({
        menuItemId: item._id || item.id,
        quantity: item.qty,
      }));

      const orderData = await orderService.createOrder(items);

      // ── Step 2: Open Razorpay Standard Checkout ──
      const options = {
        key: orderData.keyId,
        amount: orderData.amount, // in paise, from server
        currency: orderData.currency,
        name: "Madhav Services",
        description: orderData.description,
        order_id: orderData.razorpayOrderId,

        // UPI-first: Prefill phone for UPI intent flow
        prefill: {
          name: orderData.customerName || user?.name || "",
          contact: orderData.customerPhone
            ? `+91${orderData.customerPhone}`
            : user?.phone
              ? `+91${user.phone}`
              : "",
        },

        // Theme matching app's primary color
        theme: {
          color: "#2d68fe",
        },

        // 30-minute timeout matches backend order expiry
        timeout: 1800,

        // ── Payment Success Handler ──
        handler: async function (response) {
          try {
            // Step 3: Verify payment signature on backend
            const verifyResult = await orderService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyResult.success) {
              showSnackbar(
                `Order #${verifyResult.orderId} placed successfully! 🎉`,
                "success"
              );
              clearCart();
              if (isMobile) setOpen(false);
            } else {
              showSnackbar(
                "Payment received but verification pending. Please check order status.",
                "info"
              );
            }
          } catch (verifyError) {
            console.error("Payment verification error:", verifyError);
            showSnackbar(
              "Payment was received. If amount was deducted, it will be confirmed shortly.",
              "info"
            );
            clearCart();
            if (isMobile) setOpen(false);
          } finally {
            setIsCheckingOut(false);
          }
        },

        modal: {
          // ── User dismissed the checkout modal ──
          ondismiss: function () {
            setIsCheckingOut(false);
            showSnackbar(
              "Payment cancelled. Your order is saved for 30 minutes.",
              "warning"
            );
          },
        },
      };

      // Check if Razorpay script is loaded
      if (typeof window.Razorpay === "undefined") {
        showSnackbar(
          "Payment system not loaded. Please refresh the page.",
          "error"
        );
        setIsCheckingOut(false);
        return;
      }

      const rzp = new window.Razorpay(options);

      // ── Payment failure handler ──
      rzp.on("payment.failed", function (response) {
        console.error("Payment failed:", response.error);
        showSnackbar(
          response.error?.description ||
          "Payment failed. Please try again.",
          "error"
        );
        setIsCheckingOut(false);
      });

      rzp.open();
      // isCheckingOut stays true until success/dismiss/failure
    } catch (error) {
      console.error("Checkout error:", error);
      const errorMsg =
        error.response?.data?.error ||
        "Failed to create order. Please try again.";

      if (error.response?.status === 401) {
        showSnackbar("Session expired. Please login again.", "error");
      } else {
        showSnackbar(errorMsg, "error");
      }
      setIsCheckingOut(false);
    }
  };

  const CartContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ flex: 1, overflowY: "auto", padding: "1rem" }}>
        {cartItems.length === 0 ? (
          <p
            style={{
              textAlign: "center",
              color: "#999",
              marginTop: "3rem",
              fontSize: "0.9rem",
              fontStyle: "italic",
            }}
          >
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
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "8px",
                    objectFit: "cover",
                    marginRight: "1rem",
                    background: "#f8f9fa",
                  }}
                />
                <div style={{ flex: 1 }}>
                  <h4
                    style={{
                      fontSize: "0.95rem",
                      marginBottom: "4px",
                      margin: 0,
                      color: "#0f172a",
                      fontWeight: 600,
                      fontFamily: '"Inter", sans-serif',
                    }}
                  >
                    {itemName}
                  </h4>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "#64748b",
                      fontWeight: 500,
                    }}
                  >
                    ₹{item.price.toFixed(2)}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "#f8f9fa",
                    padding: "4px",
                    borderRadius: "20px",
                    border: "1px solid rgba(0,0,0,0.04)",
                  }}
                >
                  <button
                    onClick={() => updateQty(itemId, -1)}
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      border: "none",
                      background: "#ffffff",
                      color: "#0f172a",
                      fontSize: "1rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    }}
                  >
                    −
                  </button>
                  <span
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: 700,
                      minWidth: "20px",
                      textAlign: "center",
                      color: "#0f172a",
                    }}
                  >
                    {item.qty}
                  </span>
                  <button
                    onClick={() => updateQty(itemId, 1)}
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      border: "none",
                      background: "#2d68fe",
                      color: "#ffffff",
                      fontSize: "1rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 1px 3px rgba(45,104,254,0.3)",
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })
        )}
      </Box>

      {/* Footer */}
      <Box
        sx={{
          padding: "1.5rem",
          background: "#fff",
          borderTop: "1px solid rgba(0, 0, 0, 0.05)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "1rem",
            fontSize: "1.1rem",
            fontWeight: 600,
          }}
        >
          <span>Total</span>
          <span style={{ color: "#2d68fe" }}>₹{totalPrice.toFixed(2)}</span>
        </div>
        <Button
          loading={isCheckingOut}
          loadingPosition="start"
          onClick={processCheckout}
          variant="contained"
          fullWidth
          disabled={isCheckingOut}
          sx={{
            backgroundColor: "#2d68fe",
            color: "#ffffff",
            padding: "1rem",
            border: "none",
            borderRadius: "12px",
            fontSize: "1rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "1px",
            fontFamily: '"Inter", sans-serif',
            boxShadow: "0 4px 14px rgba(45, 104, 254, 0.3)",
            "&:hover": {
              backgroundColor: "#2251cd",
              boxShadow: "0 6px 20px rgba(45, 104, 254, 0.4)",
            },
            "&:disabled": {
              backgroundColor: "#94a3b8",
              boxShadow: "none",
            },
          }}
        >
          {isCheckingOut ? "Processing..." : "Pay Now"}
        </Button>
      </Box>
    </Box>
  );

  if (isMobile) {
    return (
      <>
        <SwipeableDrawer
          anchor="bottom"
          open={open}
          onClose={toggleDrawer(false)}
          onOpen={toggleDrawer(true)}
          swipeAreaWidth={drawerBleeding}
          disableSwipeToOpen={false}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              height: `calc(80% - ${drawerBleeding}px)`,
              overflow: "visible",
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
            },
          }}
          id="cartSidebar"
        >
          <Box
            sx={{
              position: "absolute",
              top: -drawerBleeding,
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
              visibility: "visible",
              right: 0,
              left: 0,
              backgroundColor: "#ffffff",
              color: "#0f172a",
              height: drawerBleeding,
              display: "flex",
              alignItems: "center",
              padding: "0 1.5rem",
              justifyContent: "space-between",
              boxShadow: "0 -4px 24px rgba(0,0,0,0.08)",
              borderTop: "1px solid rgba(0,0,0,0.04)",
            }}
            onClick={toggleDrawer(!open)}
          >
            <Box>
              <Box
                sx={{
                  width: 40,
                  height: 4,
                  bgcolor: "rgba(0,0,0,0.1)",
                  borderRadius: 3,
                  position: "absolute",
                  top: 8,
                  left: "calc(50% - 20px)",
                }}
              />
              <span
                style={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  fontFamily: '"Inter", sans-serif',
                }}
              >
                Your Order
              </span>
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Box
                sx={{
                  fontSize: "0.75rem",
                  color: "#64748b",
                  fontWeight: 500,
                  marginBottom: "2px",
                }}
              >
                Total
              </Box>
              <Box
                sx={{ fontSize: "1.1rem", fontWeight: 800, color: "#2d68fe" }}
              >
                ₹{totalPrice.toFixed(2)}
              </Box>
            </Box>
          </Box>
          {CartContent}
        </SwipeableDrawer>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
            severity={snackbar.severity}
            sx={{
              width: "100%",
              borderRadius: "8px",
              fontFamily: '"Inter", sans-serif',
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </>
    );
  }

  return (
    <Box
      sx={{
        width: "380px",
        height: "100%",
        position: "relative",
        background: "#f8f9fa",
        borderLeft: "1px solid rgba(0,0,0,0.06)",
        boxShadow: "-4px 0 24px rgba(0,0,0,0.02)",
        display: "flex",
        flexDirection: "column",
      }}
      id="cartSidebar"
    >
      <Box
        sx={{
          padding: "1.5rem",
          borderBottom: "1px solid rgba(0, 0, 0, 0.04)",
          background: "#ffffff",
          color: "#0f172a",
        }}
      >
        <h2
          style={{
            fontFamily: '"Inter", sans-serif',
            fontSize: "1.25rem",
            fontWeight: 800,
            margin: 0,
          }}
        >
          Your Order
        </h2>
      </Box>
      <Box
        sx={{
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {CartContent}
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
          sx={{
            width: "100%",
            borderRadius: "8px",
            fontFamily: '"Inter", sans-serif',
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CartSidebar;
