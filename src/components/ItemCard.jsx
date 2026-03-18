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
          borderRadius: "20px",
          overflow: "hidden",
          border: "1px solid rgba(0, 0, 0, 0.04)",
          background: "#ffffff",
          display: "flex",
          flexDirection: "column",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          height: "100%",
          position: "relative",
          cursor: "pointer",
          boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
          "&:hover": {
            boxShadow: "0 14px 28px rgba(0, 0, 0, 0.06), 0 4px 10px rgba(0,0,0,0.03)",
            transform: "translateY(-4px)",
            borderColor: "rgba(255, 107, 0, 0.2)",
          },
          "&:active": {
            transform: "scale(0.97)",
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
              aspectRatio: "4/3",
              width: "100%",
              objectFit: "cover",
              display: "block",
              backgroundColor: "#f8fafc",
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
              top: 8,
              right: 8,
              backgroundColor: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(8px)",
              width: 28,
              height: 28,
              "&:hover": {
                backgroundColor: "primary.main",
                color: "#fff",
              },
              "&:hover .MuiSvgIcon-root": {
                color: "#fff",
              }
            }}
          >
            <InfoOutlinedIcon sx={{ fontSize: 16, color: "text.secondary", transition: "color 0.2s" }} />
          </IconButton>
        </Box>

        {/* CONTENT */}
        <Box
          sx={{
            padding: { xs: "0.6rem 0.75rem", sm: "1rem" },
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: "0.5rem",
          }}
        >
          {/* Item Name */}
          <Box
            component="h3"
            sx={{
              fontFamily: '"Inter", sans-serif',
              fontSize: { xs: "0.85rem", sm: "1rem", md: "1.05rem" },
              fontWeight: 800,
              margin: 0,
              color: "text.primary",
              lineHeight: 1.3,
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
                color: "text.primary",
                fontSize: { xs: "0.95rem", sm: "1.1rem" },
                fontFamily: '"Inter", sans-serif',
              }}
            >
              ₹{(item.price || 0).toFixed(0)}
            </Box>
            <IconButton
              size="small"
              sx={{
                backgroundColor: "primary.main",
                color: "#ffffff",
                width: { xs: 32, sm: 36 },
                height: { xs: 32, sm: 36 },
                boxShadow: "0 4px 12px rgba(255,107,0,0.3)",
                "&:hover": {
                  backgroundColor: "primary.dark",
                  transform: "scale(1.05)",
                },
                "&:active": {
                  transform: "scale(0.95)",
                },
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
              onClick={(e) => {
                e.stopPropagation();
                addToCart(item);
              }}
            >
              <AddIcon sx={{ fontSize: { xs: 18, sm: 20 }, strokeWidth: 1.5 }} />
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
            borderRadius: "24px",
            overflow: "hidden",
            margin: "16px",
          },
        }}
      >
        <Box
          component="img"
          src={item.imageUrl || item.image}
          alt={item.name}
          sx={{
            width: "100%",
            aspectRatio: "4/3",
            objectFit: "cover",
            backgroundColor: "#f8fafc",
          }}
        />
        <IconButton
          onClick={() => setInfoOpen(false)}
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            backgroundColor: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(8px)",
            color: "#fff",
            width: 32,
            height: 32,
            "&:hover": { backgroundColor: "rgba(0,0,0,0.8)", transform: "scale(1.05)" },
            transition: "all 0.2s",
          }}
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
        <DialogContent sx={{ pt: 2.5, pb: 2, px: 3 }}>
          <Typography
            variant="h5"
            fontWeight={800}
            fontFamily='"Inter", sans-serif'
            color="text.primary"
            lineHeight={1.3}
            mb={1}
            gutterBottom
          >
            {item.name}
          </Typography>
          {categories.length > 0 && (
            <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", mb: 2 }}>
              {categories.map((cat, idx) => (
                <Chip
                  key={idx}
                  label={cat}
                  size="small"
                  sx={{
                    fontSize: "0.75rem",
                    backgroundColor: "primary.light",
                    color: "primary.dark",
                    fontWeight: 700,
                    textTransform: "capitalize",
                    borderRadius: "8px",
                    px: 0.5,
                  }}
                />
              ))}
            </Box>
          )}
          <Typography
            variant="body2"
            color="text.secondary"
            lineHeight={1.6}
            fontSize="0.95rem"
            mb={3}
          >
            {item.description || "No description available for this item."}
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
              fontSize="1.3rem"
              fontFamily='"Inter", sans-serif'
              color="text.primary"
            >
              ₹{(item.price || 0).toFixed(0)}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                addToCart(item);
                setInfoOpen(false);
              }}
              sx={{
                borderRadius: "50px",
                textTransform: "none",
                fontWeight: 800,
                fontSize: "0.95rem",
                px: 3.5,
                py: 1.2,
                boxShadow: "0 8px 20px rgba(255,107,0,0.3)",
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
