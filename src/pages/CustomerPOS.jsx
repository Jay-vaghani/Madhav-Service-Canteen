import React, { useState, useEffect } from "react";
import { Box, Grid, CircularProgress, Alert, Snackbar } from "@mui/material";
import Header from "../components/Header";
import CategoryList from "../components/CategoryList";
import ItemCard from "../components/ItemCard";
import CartSidebar from "../components/CartSidebar";
import { menuService } from "../services/menuService";

const CustomerPOS = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [itemsResponse, catsResponse] = await Promise.all([
        menuService.getAllMenuItems(),
        menuService.getCategories(),
      ]);

      // Handle different response structures
      const items = Array.isArray(itemsResponse)
        ? itemsResponse
        : itemsResponse?.items || itemsResponse?.data || [];
      const cats = Array.isArray(catsResponse)
        ? catsResponse
        : catsResponse?.categories || catsResponse?.data || [];

      // Filter to only show available items
      const availableItems = items.filter((item) => item.isAvailable);
      setMenuItems(availableItems);
      setCategories(["all", ...cats]);
    } catch (err) {
      setError("Failed to load menu. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems =
    activeCategory === "all"
      ? menuItems
      : menuItems.filter((item) =>
        Array.isArray(item.category)
          ? item.category.includes(activeCategory)
          : item.category === activeCategory
      );

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#f8f9fa",
        }}
      >
        <CircularProgress size={60} sx={{ color: "#2d68fe" }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        flexDirection: { xs: "column", md: "row" },
      }}
    >
      {/* LEFT: MENU SECTION */}
      <Box
        sx={{
          flex: 1,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid rgba(0, 0, 0, 0.04)",
          position: "relative",
          overflow: "hidden",
          backgroundColor: "#ffffff",
        }}
      >
        <Header />
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError("")}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setError("")}
            severity="error"
            sx={{ width: "100%", borderRadius: "8px" }}
          >
            {error}
          </Alert>
        </Snackbar>
        <CategoryList

          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            padding: { xs: "1rem", md: "2rem" },
            backgroundColor: "#f8f9fa",
            paddingBottom: { xs: "100px", md: "4rem" },
          }}
        >
          <Grid container spacing={2}>
            {filteredItems.map((item) => (
              <Grid key={item._id} size={{ xs: 12, sm: 6, lg: 3 }}>
                <ItemCard item={item} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>

      {/* RIGHT: CART SECTION */}
      <CartSidebar />
    </Box>
  );
};

export default CustomerPOS;
