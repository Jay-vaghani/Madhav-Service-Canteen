import React, { useState, useEffect } from "react";
import { Box, Grid, CircularProgress, Alert } from "@mui/material";
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
      : menuItems.filter((item) => item.category === activeCategory);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress size={60} />
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
          borderRight: "1px solid rgba(27, 27, 27, 0.1)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Header />
        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}
        <CategoryList
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            padding: "2rem",
            backgroundColor: "#f5f5f7",
            paddingBottom: { xs: "100px", md: "4rem" },
          }}
        >
          <Grid container spacing={3}>
            {filteredItems.map((item) => (
              <Grid key={item._id} size={{ xs: 12, sm: 6, lg: 3, xl: 2 }}>
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
