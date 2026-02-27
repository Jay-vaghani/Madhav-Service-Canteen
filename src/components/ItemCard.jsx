import React from "react";
import { Box, Paper, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useCart } from "../context/CartContext";

const ItemCard = ({ item }) => {
  const { addToCart } = useCart();

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: "16px",
        overflow: "hidden",
        border: "1px solid rgba(0, 0, 0, 0.06)",
        background: "#ffffff",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.2s ease",
        height: "100%",
        "&:hover": {
          boxShadow: "0 12px 24px rgba(0, 0, 0, 0.06)",
          transform: "translateY(-4px)",
        },
        "&:active": {
          transform: "translateY(0)",
        },
      }}
      onClick={() => addToCart(item)}
    >
      <Box
        component="img"
        src={item.imageUrl || item.image}
        alt={item.name || item.title}
        sx={{
          height: 160,
          width: "100%",
          objectFit: "cover",
          backgroundColor: "#f8f9fa",
        }}
      />
      <Box
        sx={{
          padding: "1.25rem",
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h3
          style={{
            fontFamily: '"Inter", sans-serif',
            fontSize: "1.05rem",
            marginBottom: "0.25rem",
            fontWeight: 700,
            marginTop: 0,
            color: "#0f172a",
            lineHeight: 1.3,
          }}
        >
          {item.name || item.title}
        </h3>
        <p
          style={{
            fontSize: "0.85rem",
            color: "#64748b",
            marginBottom: "1rem",
            lineHeight: 1.5,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            margin: "0 0 1rem 0",
            flex: 1,
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
              fontWeight: 800,
              color: "#0f172a",
              fontSize: "1.1rem",
            }}
          >
            ₹{(item.price || 0).toFixed(2)}
          </span>
          <IconButton
            size="small"
            sx={{
              backgroundColor: "#2d68fe",
              color: "#ffffff",
              "&:hover": {
                backgroundColor: "#2251cd",
              },
            }}
            onClick={(e) => {
              e.stopPropagation();
              addToCart(item);
            }}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
};

export default ItemCard;
