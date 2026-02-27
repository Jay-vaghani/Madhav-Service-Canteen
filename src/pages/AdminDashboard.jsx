import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  AppBar,
  Toolbar,
  Button,
  Tabs,
  Tab,
  Fab,
  Alert,
  Snackbar,
  CircularProgress,
  TextField,
  InputAdornment,
} from "@mui/material";
import { Add, Logout, Search } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { menuService } from "../services/menuService";
import MenuItemsList from "../components/admin/MenuItemsList";
import MenuItemForm from "../components/admin/MenuItemForm";
import OrderManagement from "../components/admin/OrderManagement";

const AdminDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { logout, user } = useAuth();
  const navigate = useNavigate();

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

      // Handle different response structures - ensure we always get arrays
      const items = Array.isArray(itemsResponse)
        ? itemsResponse
        : itemsResponse?.items || itemsResponse?.data || [];
      const cats = Array.isArray(catsResponse)
        ? catsResponse
        : catsResponse?.categories || catsResponse?.data || [];

      setMenuItems(items);
      setCategories(cats);
    } catch (err) {
      setError("Failed to load menu items");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleCreateOrUpdate = async (data) => {
    try {
      if (editingItem) {
        await menuService.updateMenuItem(editingItem._id, data);
      } else {
        await menuService.createMenuItem(data);
      }
      await fetchData();
      setFormOpen(false);
      setEditingItem(null);
    } catch (err) {
      throw err;
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await menuService.deleteMenuItem(id);
      await fetchData();
    } catch (err) {
      setError("Failed to delete item");
    }
  };

  const handleToggleAvailability = async (id, isAvailable) => {
    try {
      await menuService.updateAvailability(id, isAvailable);
      setMenuItems((items) =>
        items.map((item) => (item._id === id ? { ...item, isAvailable } : item))
      );
    } catch (err) {
      setError("Failed to update availability");
    }
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setFormOpen(true);
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f7" }}>
      <AppBar position="static" sx={{ borderRadius: 0 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold" }}>
            {user?.username.toUpperCase()}
          </Typography>
          <Button
            color="inherit"
            onClick={() => navigate("/admin/users")}
            sx={{ mr: 2 }}
          >
            Manage Users
          </Button>
          <Button color="inherit" startIcon={<Logout />} onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
            <Tab label="Menu Items" />
            <Tab label="Orders" />
          </Tabs>
        </Box>

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

        {tabValue === 0 && (
          <>
            <TextField
              fullWidth
              placeholder="Search menu items by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress />
              </Box>
            ) : (
              <MenuItemsList
                items={menuItems.filter((item) =>
                  item.name.toLowerCase().includes(searchQuery.toLowerCase())
                )}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleAvailability={handleToggleAvailability}
              />
            )}

            <Fab
              color="primary"
              aria-label="add"
              sx={{ position: "fixed", bottom: 32, right: 32 }}
              onClick={handleAddNew}
            >
              <Add />
            </Fab>
          </>
        )}

        {tabValue === 1 && (
          <OrderManagement isAdmin={true} />
        )}

        <MenuItemForm
          open={formOpen}
          onClose={() => {
            setFormOpen(false);
            setEditingItem(null);
          }}
          onSubmit={handleCreateOrUpdate}
          item={editingItem}
          categories={categories}
        />
      </Container>
    </Box>
  );
};

export default AdminDashboard;
