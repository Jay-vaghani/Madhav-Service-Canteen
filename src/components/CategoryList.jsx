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
              padding: "0.6rem 1.25rem",
              borderRadius: "50px",
              border: isActive
                ? "1px solid #2d68fe"
                : "1px solid rgba(0, 0, 0, 0.08)",
              background: isActive ? "#2d68fe" : "#ffffff",
              color: isActive ? "#ffffff" : "#0f172a",
              fontWeight: isActive ? 600 : 500,
              whiteSpace: "nowrap",
              cursor: "pointer",
              transition: "all 0.2s ease",
              fontSize: "0.9rem",
              fontFamily: '"Inter", sans-serif',
              boxShadow: isActive ? "0 4px 12px rgba(45, 104, 254, 0.2)" : "none",
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
