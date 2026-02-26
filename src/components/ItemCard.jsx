import React from "react";
import { Box, Paper } from "@mui/material";
import { useCart } from "../context/CartContext";

const ItemCard = ({ item }) => {
  const { addToCart } = useCart();

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.2s",
        "&:active": {
          transform: "scale(0.98)",
        },
        height: "100%",
      }}
      onClick={() => addToCart(item)}
    >
      <Box
        component="img"
        src={item.imageUrl || item.image}
        alt={item.name || item.title}
        sx={{
          height: 180,
          width: "100%",
          objectFit: "cover",
          backgroundColor: "#eee",
        }}
      />
      <Box
        sx={{
          padding: "1rem",
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h3
          style={{
            fontFamily: '"Playfair Display", serif',
            fontSize: "1.1rem",
            marginBottom: "0.2rem",
            fontWeight: 600,
            marginTop: 0,
            color: "#1b1b1b",
          }}
        >
          {item.name || item.title}
        </h3>
        <p
          style={{
            fontSize: "0.8rem",
            color: "#666",
            marginBottom: "1rem",
            lineHeight: 1.4,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            margin: "0 0 1rem 0",
          }}
        >
          {item.description || item.desc}
        </p>
        <Box
          sx={{
            marginTop: "auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontWeight: 700,
              color: "#1b1b1b",
            }}
          >
            ₹{item.price.toFixed(2)}
          </span>
          <button
            style={{
              backgroundColor: "#1b1b1b",
              color: "#d4af37",
              border: "none",
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.2rem",
              cursor: "pointer",
            }}
            onClick={(e) => {
              e.stopPropagation();
              addToCart(item);
            }}
          >
            +
          </button>
        </Box>
      </Box>
    </Paper>
  );
};

export default ItemCard;
