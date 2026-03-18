import React from "react";
import { Box } from "@mui/material";

const CategoryList = ({
  categories = [],
  activeCategory,
  onCategoryChange,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        gap: "0.75rem",
        padding: { xs: "1rem 1rem 1.5rem 1rem", md: "1rem 2rem 1.5rem 2rem" },
        overflowX: "auto",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        "&::-webkit-scrollbar": {
          display: "none",
        },
        borderBottom: "1px solid rgba(0, 0, 0, 0.04)",
      }}
    >
      {categories.map((cat) => {
        const categoryId = typeof cat === "string" ? cat : cat.id;
        const categoryLabel =
          typeof cat === "string"
            ? cat === "all"
              ? "All"
              : cat.charAt(0).toUpperCase() + cat.slice(1)
            : cat.label;

        const isActive = activeCategory === categoryId;

        return (
          <button
            key={categoryId}
            onClick={() => onCategoryChange(categoryId)}
            style={{
              padding: "0.6rem 1.4rem",
              borderRadius: "50px",
              border: isActive
                ? "1px solid #FF6B00"
                : "1px solid rgba(0, 0, 0, 0.05)",
              background: isActive ? "#FF6B00" : "#ffffff",
              color: isActive ? "#ffffff" : "#0F172A",
              fontWeight: isActive ? 800 : 600,
              whiteSpace: "nowrap",
              cursor: "pointer",
              transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
              fontSize: "0.9rem",
              fontFamily: '"Inter", sans-serif',
              letterSpacing: isActive ? "0.02em" : "0",
              boxShadow: isActive ? "0 8px 20px rgba(255, 107, 0, 0.25)" : "0 2px 6px rgba(0,0,0,0.03)",
              transform: isActive ? "scale(1.02)" : "scale(1)",
            }}
          >
            {categoryLabel}
          </button>
        );
      })}
    </Box>
  );
};

export default CategoryList;
