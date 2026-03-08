import React, { useState } from "react";
import {
  Box,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Button,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CloseIcon from "@mui/icons-material/Close";
import { useCart } from "../context/CartContext";

const ItemCard = ({ item }) => {
  const { addToCart } = useCart();
  const [infoOpen, setInfoOpen] = useState(false);

  const categories = Array.isArray(item.category)
    ? item.category
    : item.category
      ? [item.category]
      : [];

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          borderRadius: "14px",
          overflow: "hidden",
          border: "1px solid rgba(0, 0, 0, 0.07)",
          background: "#ffffff",
          display: "flex",
          flexDirection: "column",
          transition: "all 0.2s ease",
          height: "100%",
          position: "relative",
          cursor: "pointer",
          "&:hover": {
            boxShadow: "0 8px 20px rgba(0, 0, 0, 0.08)",
            transform: "translateY(-2px)",
          },
          "&:active": {
            transform: "translateY(0)",
          },
        }}
        onClick={() => addToCart(item)}
      >
        {/* IMAGE */}
        <Box
          sx={{
            position: "relative",
            flexShrink: 0,
          }}
        >
          <Box
            component="img"
            src={item.imageUrl || item.image}
            alt={item.name || item.title}
            sx={{
              height: { xs: 110, sm: 140, md: 160 },
              width: "100%",
              objectFit: "cover",
              display: "block",
              backgroundColor: "#f1f5f9",
            }}
          />
          {/* Info button (mobile: top-right corner of image) */}
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setInfoOpen(true);
            }}
            sx={{
              position: "absolute",
              top: 6,
              right: 6,
              backgroundColor: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(4px)",
              width: 26,
              height: 26,
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.95)",
              },
            }}
          >
            <InfoOutlinedIcon sx={{ fontSize: 15, color: "#2d68fe" }} />
          </IconButton>
        </Box>

        {/* CONTENT */}
        <Box
          sx={{
            padding: { xs: "0.5rem 0.6rem 0.6rem", sm: "0.75rem 0.875rem 0.875rem" },
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: "0.35rem",
          }}
        >
          {/* Item Name */}
          <Box
            component="h3"
            sx={{
              fontFamily: '"Inter", sans-serif',
              fontSize: { xs: "0.82rem", sm: "0.95rem", md: "1.05rem" },
              fontWeight: 700,
              margin: 0,
              color: "#0f172a",
              lineHeight: 1.25,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {item.name || item.title}
          </Box>

          {/* Price + Add button row */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: "auto",
            }}
          >
            <Box
              component="span"
              sx={{
                fontWeight: 800,
                color: "#0f172a",
                fontSize: { xs: "0.875rem", sm: "1rem" },
                fontFamily: '"Inter", sans-serif',
              }}
            >
              ₹{(item.price || 0).toFixed(0)}
            </Box>
            <IconButton
              size="small"
              sx={{
                backgroundColor: "#2d68fe",
                color: "#ffffff",
                width: { xs: 28, sm: 32 },
                height: { xs: 28, sm: 32 },
                "&:hover": {
                  backgroundColor: "#2251cd",
                },
              }}
              onClick={(e) => {
                e.stopPropagation();
                addToCart(item);
              }}
            >
              <AddIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />
            </IconButton>
          </Box>
        </Box>
      </Paper>

      {/* DESCRIPTION DIALOG */}
      <Dialog
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            overflow: "hidden",
          },
        }}
      >
        <Box
          component="img"
          src={item.imageUrl || item.image}
          alt={item.name}
          sx={{
            width: "100%",
            height: 200,
            objectFit: "cover",
          }}
        />
        <IconButton
          onClick={() => setInfoOpen(false)}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            backgroundColor: "rgba(0,0,0,0.4)",
            color: "#fff",
            width: 32,
            height: 32,
            "&:hover": { backgroundColor: "rgba(0,0,0,0.6)" },
          }}
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
        <DialogContent sx={{ pt: 2, pb: 1 }}>
          <Typography
            variant="h6"
            fontWeight={800}
            fontFamily='"Inter", sans-serif'
            color="#0f172a"
            gutterBottom
          >
            {item.name}
          </Typography>
          {categories.length > 0 && (
            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mb: 1.5 }}>
              {categories.map((cat, idx) => (
                <Chip
                  key={idx}
                  label={cat}
                  size="small"
                  sx={{
                    fontSize: "0.7rem",
                    backgroundColor: "rgba(45, 104, 254, 0.1)",
                    color: "#2d68fe",
                    fontWeight: 600,
                    textTransform: "capitalize",
                    borderRadius: "6px",
                  }}
                />
              ))}
            </Box>
          )}
          <Typography
            variant="body2"
            color="text.secondary"
            lineHeight={1.6}
            mb={2}
          >
            {item.description || "No description available."}
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography
              fontWeight={800}
              fontSize="1.2rem"
              fontFamily='"Inter", sans-serif'
              color="#0f172a"
            >
              ₹{(item.price || 0).toFixed(2)}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                addToCart(item);
                setInfoOpen(false);
              }}
              sx={{
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 700,
                backgroundColor: "#2d68fe",
                "&:hover": { backgroundColor: "#2251cd" },
                px: 3,
              }}
            >
              Add to Order
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ItemCard;
