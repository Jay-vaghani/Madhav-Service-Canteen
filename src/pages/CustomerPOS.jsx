import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  CircularProgress,
  Alert,
  Snackbar,
  TextField,
  InputAdornment,
  useMediaQuery,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import Header from "../components/Header";
import CategoryList from "../components/CategoryList";
import ItemCard from "../components/ItemCard";
import CartView from "../components/CartView";
import OrdersView from "../components/OrdersView";
import BottomTabBar from "../components/BottomTabBar";
import { menuService } from "../services/menuService";

const CustomerPOS = () => {
  const [activeTab, setActiveTab] = useState("menu");
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const isMobile = useMediaQuery("(max-width:900px)");

  useEffect(() => {
    // Initial load with full re-render and spinner
    fetchData(false);

    let intervalId;

    const startPolling = () => {
      if (!intervalId) {
        intervalId = setInterval(() => {
          fetchData(true); // Silent background fetch
        }, 5000);
      }
    };

    const stopPolling = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        // Immedately fetch when user returns to the tab, then resume polling
        fetchData(true);
        startPolling();
      }
    };

    // Start polling immediately if the document is visible
    if (!document.hidden) {
      startPolling();
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const fetchData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const [itemsResponse, catsResponse] = await Promise.all([
        menuService.getAllMenuItems(),
        menuService.getCategories(),
      ]);
      const items = Array.isArray(itemsResponse)
        ? itemsResponse
        : itemsResponse?.items || itemsResponse?.data || [];
      const cats = Array.isArray(catsResponse)
        ? catsResponse
        : catsResponse?.categories || catsResponse?.data || [];

      const availableItems = items.filter((item) => item.isAvailable);
      
      // We only update if React allows it or if there has been a change, 
      // but simply setting the new array is fine for React functional components.
      setMenuItems(availableItems);
      setCategories(["all", ...cats]);
    } catch (err) {
      if (!isSilent) setError("Failed to load menu. Please try again.");
      console.error(err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory =
      activeCategory === "all" ||
      (Array.isArray(item.category)
        ? item.category.includes(activeCategory)
        : item.category === activeCategory);
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description &&
        item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

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
        <CircularProgress size={60} sx={{ color: "primary.main" }} />
      </Box>
    );
  }

  /* ─────────────────────────────────────────
     MOBILE LAYOUT
  ───────────────────────────────────────── */
  if (isMobile) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", height: "100dvh", overflow: "hidden" }}>
        {/* Page Content */}
        <Box sx={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>

          {/* MENU TAB */}
          {activeTab === "menu" && (
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <Header />
              <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={() => setError("")}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
              >
                <Alert onClose={() => setError("")} severity="error" sx={{ width: "100%", borderRadius: "8px" }}>
                  {error}
                </Alert>
              </Snackbar>
              {/* Search */}
              <Box sx={{ px: "1rem", pt: 1.5, pb: 0 }}>
                <TextField
                  fullWidth
                  placeholder="Search menu items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                      backgroundColor: "#f8f9fa",
                      "& fieldset": { borderColor: "rgba(0,0,0,0.08)" },
                      "&:hover fieldset": { borderColor: "primary.main" },
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: "text.secondary", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              <CategoryList
                categories={categories}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
              />
              <Box
                sx={{
                  flex: 1,
                  overflowY: "auto",
                  px: "0.75rem",
                  pt: "0.75rem",
                  pb: "80px", // room for tab bar
                  backgroundColor: "#f8f9fa",
                }}
              >
                <Grid container spacing={1.5}>
                  {filteredItems.map((item) => (
                    <Grid key={item._id} size={{ xs: 6 }}>
                      <ItemCard item={item} />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Box>
          )}

          {/* CART TAB */}
          {activeTab === "cart" && (
            <Box sx={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", pb: "64px" }}>
              <CartView onTabChange={setActiveTab} />
            </Box>
          )}

          {/* ORDERS TAB */}
          {activeTab === "orders" && (
            <Box sx={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", pb: "64px" }}>
              <OrdersView />
            </Box>
          )}
        </Box>

        {/* iOS-style Bottom Tab Bar */}
        <BottomTabBar activeTab={activeTab} onTabChange={setActiveTab} />
      </Box>
    );
  }

  /* ─────────────────────────────────────────
     DESKTOP LAYOUT
  ───────────────────────────────────────── */
  return (
    <Box sx={{ display: "flex", height: "100dvh", overflow: "hidden" }}>
      {/* Left Nav Rail */}
      <BottomTabBar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Center: Menu + Header */}
      <Box
        sx={{
          flex: 1,
          height: "100%",
          display: "flex",
          flexDirection: "column",
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
          <Alert onClose={() => setError("")} severity="error" sx={{ width: "100%", borderRadius: "8px" }}>
            {error}
          </Alert>
        </Snackbar>

        {/* Content area — shows menu or cart depending on tab */}
        {activeTab === "cart" ? (
          <Box sx={{ flex: 1, overflow: "hidden" }}>
            <CartView onTabChange={setActiveTab} />
          </Box>
        ) : activeTab === "orders" ? (
          <Box sx={{ flex: 1, overflow: "hidden" }}>
            <OrdersView />
          </Box>
        ) : (
          <>
            <Box sx={{ px: "2rem", pt: 2 }}>
              <TextField
                fullWidth
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    backgroundColor: "#f8f9fa",
                    "& fieldset": { borderColor: "rgba(0,0,0,0.08)" },
                    "&:hover fieldset": { borderColor: "primary.main" },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <CategoryList
              categories={categories}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />
            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                padding: "1.5rem 2rem",
                backgroundColor: "#f8f9fa",
              }}
            >
              <Grid container spacing={2}>
                {filteredItems.map((item) => (
                  <Grid key={item._id} size={{ xs: 6, sm: 6, md: 4, lg: 3 }}>
                    <ItemCard item={item} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default CustomerPOS;
