import React, { useState } from "react";
import { Box, Button, useMediaQuery, SwipeableDrawer } from "@mui/material";
import { useCart } from "../context/CartContext";

const drawerBleeding = 80;

const CartSidebar = () => {
  const { cart, updateQty, totalPrice, clearCart } = useCart();
  const [open, setOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width:900px)");

  const cartItems = Object.values(cart);

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const processCheckout = () => {
    if (totalPrice === 0) {
      alert("Please add items first.");
    } else {
      // Direct checkout without payment gateway
      clearCart();
      if (isMobile) setOpen(false);
    }
  };

  const CartContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Mobile-only internal header or spacer if needed, or just list */}
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
                  background: "#f5f5f7",
                  padding: "1rem",
                  borderRadius: "8px",
                  marginBottom: "1rem",
                }}
              >
                <img
                  src={itemImage}
                  alt={itemName}
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "6px",
                    objectFit: "cover",
                    marginRight: "1rem",
                  }}
                />
                <div style={{ flex: 1 }}>
                  <h4
                    style={{
                      fontSize: "0.9rem",
                      marginBottom: "4px",
                      margin: 0,
                    }}
                  >
                    {itemName}
                  </h4>
                  <div style={{ fontSize: "0.8rem", color: "#666" }}>
                    ₨. {item.price.toFixed(2)}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "#fff",
                    padding: "4px",
                    borderRadius: "20px",
                    border: "1px solid #ddd",
                  }}
                >
                  <button
                    onClick={() => updateQty(itemId, -1)}
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      border: "none",
                      background: "#fff",
                      fontSize: "1rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    −
                  </button>
                  <span
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      minWidth: "20px",
                      textAlign: "center",
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
                      background: "#1b1b1b",
                      color: "#fff",
                      fontSize: "1rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
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
          <span>₨. {totalPrice.toFixed(2)}</span>
        </div>
        <button
          onClick={processCheckout}
          style={{
            width: "100%",
            backgroundColor: "#1b1b1b",
            color: "#d4af37",
            padding: "1.2rem",
            border: "none",
            borderRadius: "8px",
            fontSize: "1rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "1px",
            fontFamily: '"Inter", sans-serif',
            cursor: "pointer",
          }}
        >
          Place Order
        </button>
      </Box>
    </Box>
  );

  if (isMobile) {
    return (
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
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
          },
        }}
        id="cartSidebar"
      >
        <Box
          sx={{
            position: "absolute",
            top: -drawerBleeding,
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            visibility: "visible",
            right: 0,
            left: 0,
            backgroundColor: "#1b1b1b",
            color: "#d4af37",
            height: drawerBleeding,
            display: "flex",
            alignItems: "center",
            padding: "0 1.5rem",
            justifyContent: "space-between",
            boxShadow: "0 -2px 10px rgba(0,0,0,0.1)",
          }}
          onClick={toggleDrawer(!open)}
        >
          <Box>
            <Box
              sx={{
                width: 30,
                height: 4,
                bgcolor: "rgba(255,255,255,0.3)",
                borderRadius: 3,
                position: "absolute",
                top: 8,
                left: "calc(50% - 15px)",
              }}
            />
            <span
              style={{
                fontSize: "0.9rem",
                fontWeight: 600,
                fontFamily: '"Inter", sans-serif',
              }}
            >
              Your Order
            </span>
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Box
              sx={{ fontSize: "0.75rem", opacity: 0.7, marginBottom: "2px" }}
            >
              Total
            </Box>
            <Box sx={{ fontSize: "1.1rem", fontWeight: 700 }}>
              ₨. {totalPrice.toFixed(2)}
            </Box>
          </Box>
        </Box>
        {CartContent}
      </SwipeableDrawer>
    );
  }

  return (
    <Box
      sx={{
        width: "350px",
        height: "100vh",
        position: "fixed",
        right: 0,
        top: 0,
        background: "#fafafa",
        borderLeft: "1px solid rgba(0,0,0,0.05)",
      }}
      id="cartSidebar"
    >
      <Box
        sx={{
          padding: "1.5rem",
          borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
          background: "#fff",
          color: "#1b1b1b",
        }}
      >
        <h2
          style={{
            fontFamily: '"Playfair Display", serif',
            fontSize: "1.5rem",
            margin: 0,
          }}
        >
          Your Order
        </h2>
      </Box>
      {CartContent}
    </Box>
  );
};

export default CartSidebar;
