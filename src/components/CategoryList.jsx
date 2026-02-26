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
        gap: "1rem",
        padding: { xs: "0 1rem 1.5rem 1rem", md: "0 2rem 1.5rem 2rem" },
        overflowX: "auto",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        "&::-webkit-scrollbar": {
          display: "none",
        },
        borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
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

        return (
          <button
            key={categoryId}
            onClick={() => onCategoryChange(categoryId)}
            style={{
              padding: "0.6rem 1.5rem",
              borderRadius: "50px",
              border:
                activeCategory === categoryId
                  ? "1px solid #1b1b1b"
                  : "1px solid rgba(27, 27, 27, 0.2)",
              background:
                activeCategory === categoryId ? "#1b1b1b" : "transparent",
              color: activeCategory === categoryId ? "#fff" : "#1b1b1b",
              fontWeight: 600,
              whiteSpace: "nowrap",
              cursor: "pointer",
              transition: "all 0.2s",
              fontSize: "0.9rem",
              fontFamily: '"Inter", sans-serif',
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
