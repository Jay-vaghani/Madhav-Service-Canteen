import React, { createContext, useState, useContext } from "react";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({});

  const addToCart = (item) => {
    setCart((prevCart) => {
      const newCart = { ...prevCart };
      const itemId = item._id || item.id; // Support both backend (_id) and old mock data (id)
      if (newCart[itemId]) {
        newCart[itemId] = { ...newCart[itemId], qty: newCart[itemId].qty + 1 };
      } else {
        newCart[itemId] = { ...item, qty: 1 };
      }
      return newCart;
    });
  };

  const updateQty = (id, change) => {
    setCart((prevCart) => {
      const newCart = { ...prevCart };
      if (newCart[id]) {
        newCart[id] = { ...newCart[id], qty: newCart[id].qty + change };
        if (newCart[id].qty <= 0) {
          delete newCart[id];
        }
      }
      return newCart;
    });
  };

  const clearCart = () => {
    setCart({});
  };

  const totalItems = Object.values(cart).reduce(
    (acc, item) => acc + item.qty,
    0
  );
  const totalPrice = Object.values(cart).reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );

  return (
    <CartContext.Provider
      value={{ cart, addToCart, updateQty, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
};
