import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  AppBar,
  Toolbar,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  Avatar,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
} from "@mui/material";
import { Logout, Search } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { menuService } from "../services/menuService";
import OrderManagement from "../components/admin/OrderManagement";

const ManagerDashboard = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      const items = await menuService.getAllMenuItems();
      setMenuItems(items);
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

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f7" }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold" }}>
            Order Manager - {user?.username}
          </Typography>
          <Button color="inherit" startIcon={<Logout />} onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: "bold" }}>
          Manager Dashboard
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
            <Tab label="Menu Availability" />
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
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <strong>Image</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Name</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Category</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Description</strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>Price</strong>
                      </TableCell>
                      <TableCell align="center">
                        <strong>Availability</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {menuItems
                      .filter((item) =>
                        item.name.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((item) => (
                        <TableRow key={item._id} hover>
                          <TableCell>
                            <Avatar
                              src={item.imageUrl}
                              alt={item.name}
                              variant="rounded"
                              sx={{ width: 60, height: 60 }}
                            />
                          </TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>
                            <Chip
                              label={item.category}
                              size="small"
                              color="primary"
                              sx={{ textTransform: "capitalize" }}
                            />
                          </TableCell>
                          <TableCell sx={{ maxWidth: 300 }}>
                            {item.description}
                          </TableCell>
                          <TableCell align="right">
                            ₨. {item.price.toFixed(2)}
                          </TableCell>
                          <TableCell align="center">
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 1,
                              }}
                            >
                              <Switch
                                checked={item.isAvailable}
                                onChange={() =>
                                  handleToggleAvailability(
                                    item._id,
                                    !item.isAvailable
                                  )
                                }
                                color="success"
                                size="small"
                              />
                              <span
                                style={{
                                  fontSize: "0.875rem",
                                  color: item.isAvailable ? "green" : "red",
                                }}
                              >
                                {item.isAvailable ? "In Stock" : "Out of Stock"}
                              </span>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )}

        {tabValue === 1 && (
          <OrderManagement isAdmin={false} />
        )}
      </Container>
    </Box>
  );
};

export default ManagerDashboard;
