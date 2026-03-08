import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  TextField,
  InputAdornment,
  Switch,
  FormControlLabel,
  Tooltip,
  Badge,
  Fab,
  Drawer,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Add,
  LogoutOutlined,
  Search,
  VisibilityOff,
  Visibility,
  RestaurantMenu,
  Assignment,
  People,
  DashboardCustomize,
  Menu as MenuIcon,
  Close,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { menuService } from "../services/menuService";
import MenuItemsList from "../components/admin/MenuItemsList";
import MenuItemForm from "../components/admin/MenuItemForm";
import OrderManagement from "../components/admin/OrderManagement";

/* ═══════════════════════════════════════════════════════════════
   SIDEBAR CONTENT — reused across desktop, tablet, mobile drawer
═══════════════════════════════════════════════════════════════ */
const SidebarContent = ({
  activeSection,
  setActiveSection,
  navigate,
  handleLogout,
  availableCount,
  menuItemsLength,
  compact = false,       // tablet: icon-only mode
  onNavClick,           // mobile drawer: close after nav
}) => {
  const NAV = [
    { id: "menu", icon: <RestaurantMenu />, label: "Menu Items" },
    { id: "orders", icon: <Assignment />, label: "Orders" },
  ];

  const handleNav = (id) => {
    setActiveSection(id);
    onNavClick?.();
  };

  return (
    <Box
      sx={{
        height: "100%",
        background: "linear-gradient(160deg, #0f172a 0%, #1e293b 100%)",
        display: "flex",
        flexDirection: "column",
        py: 3,
        px: compact ? 1 : 1.5,
        gap: 0.5,
      }}
    >
      {/* Brand */}
      <Box sx={{ px: compact ? 0.5 : 1.5, mb: 3, display: "flex", alignItems: "center", gap: compact ? 0 : 1.5 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: "10px",
            background: "linear-gradient(135deg, #3b82f6, #6366f1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <DashboardCustomize sx={{ fontSize: 18, color: "#fff" }} />
        </Box>
        {!compact && (
          <Box>
            <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: "0.95rem", lineHeight: 1.2 }}>
              Madhav Admin
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.7rem", fontWeight: 500 }}>
              Admin Panel
            </Typography>
          </Box>
        )}
      </Box>

      {/* Nav items */}
      {NAV.map(({ id, icon, label }) => (
        <Tooltip key={id} title={compact ? label : ""} placement="right" arrow>
          <Box
            onClick={() => handleNav(id)}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: compact ? "center" : "flex-start",
              gap: compact ? 0 : 1.5,
              px: compact ? 1 : 2,
              py: 1.25,
              borderRadius: "12px",
              cursor: "pointer",
              transition: "all 0.18s ease",
              backgroundColor: activeSection === id ? "rgba(255,255,255,0.12)" : "transparent",
              color: activeSection === id ? "#fff" : "rgba(255,255,255,0.5)",
              position: "relative",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.08)", color: "#fff" },
            }}
          >
            {activeSection === id && (
              <Box sx={{ position: "absolute", left: 0, top: "20%", bottom: "20%", width: 3, borderRadius: "0 3px 3px 0", backgroundColor: "#60a5fa" }} />
            )}
            <Box sx={{ fontSize: 20, display: "flex" }}>{icon}</Box>
            {!compact && (
              <Typography sx={{ fontSize: "0.875rem", fontWeight: activeSection === id ? 700 : 500 }}>
                {label}
              </Typography>
            )}
          </Box>
        </Tooltip>
      ))}

      <Tooltip title={compact ? "Manage Users" : ""} placement="right" arrow>
        <Box
          onClick={() => { navigate("/admin/users"); onNavClick?.(); }}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: compact ? "center" : "flex-start",
            gap: compact ? 0 : 1.5,
            px: compact ? 1 : 2,
            py: 1.25,
            borderRadius: "12px",
            cursor: "pointer",
            color: "rgba(255,255,255,0.5)",
            "&:hover": { backgroundColor: "rgba(255,255,255,0.08)", color: "#fff" },
            transition: "all 0.18s",
          }}
        >
          <Box sx={{ fontSize: 20, display: "flex" }}><People /></Box>
          {!compact && <Typography sx={{ fontSize: "0.875rem", fontWeight: 500 }}>Manage Users</Typography>}
        </Box>
      </Tooltip>

      <Box sx={{ flex: 1 }} />

      {/* Stats pill — hide in compact mode */}
      {!compact && (
        <Box
          sx={{
            mx: 1, p: 1.5,
            borderRadius: "12px",
            backgroundColor: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            mb: 2,
          }}
        >
          <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.65rem", fontWeight: 700, letterSpacing: 1, mb: 0.5 }}>
            MENU STATUS
          </Typography>
          <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: "1.05rem" }}>
            {availableCount}
            <Typography component="span" sx={{ color: "rgba(255,255,255,0.4)", fontWeight: 500, fontSize: "0.8rem", ml: 0.5 }}>
              / {menuItemsLength} available
            </Typography>
          </Typography>
        </Box>
      )}

      {/* Logout */}
      <Tooltip title={compact ? "Logout" : ""} placement="right" arrow>
        <Box
          onClick={handleLogout}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: compact ? "center" : "flex-start",
            gap: compact ? 0 : 1.5,
            px: compact ? 1 : 2,
            py: 1.25,
            borderRadius: "12px",
            cursor: "pointer",
            color: "rgba(255,255,255,0.4)",
            "&:hover": { backgroundColor: "rgba(239,68,68,0.12)", color: "#f87171" },
            transition: "all 0.18s",
          }}
        >
          <LogoutOutlined sx={{ fontSize: 20 }} />
          {!compact && <Typography sx={{ fontSize: "0.875rem", fontWeight: 600 }}>Logout</Typography>}
        </Box>
      </Tooltip>
    </Box>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MOBILE BOTTOM NAV
═══════════════════════════════════════════════════════════════ */
const BottomNav = ({ activeSection, setActiveSection, navigate }) => {
  const tabs = [
    { id: "menu", icon: <RestaurantMenu />, label: "Menu" },
    { id: "orders", icon: <Assignment />, label: "Orders" },
    { id: "users", icon: <People />, label: "Users" },
  ];

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: "linear-gradient(160deg, #0f172a 0%, #1e293b 100%)",
        display: "flex",
        justifyContent: "space-around",
        pb: "env(safe-area-inset-bottom, 8px)",
        pt: 1,
        borderTop: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.3)",
      }}
    >
      {tabs.map(({ id, icon, label }) => {
        const isActive = activeSection === id;
        return (
          <Box
            key={id}
            onClick={() => id === "users" ? navigate("/admin/users") : setActiveSection(id)}
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0.25,
              py: 0.75,
              cursor: "pointer",
              color: isActive ? "#60a5fa" : "rgba(255,255,255,0.4)",
              transition: "color 0.15s",
            }}
          >
            <Box
              sx={{
                p: 0.5,
                borderRadius: "8px",
                backgroundColor: isActive ? "rgba(96,165,250,0.15)" : "transparent",
                transition: "background 0.15s",
              }}
            >
              {React.cloneElement(icon, { sx: { fontSize: 22 } })}
            </Box>
            <Typography sx={{ fontSize: "0.65rem", fontWeight: isActive ? 700 : 500 }}>
              {label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};

/* ════════════════════════════════════════════════════════════════
   MAIN DASHBOARD
════════════════════════════════════════════════════════════════ */
const AdminDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));       // < 600px
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md")); // 600–960px
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));           // > 960px

  const [activeSection, setActiveSection] = useState("menu");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [markingUnavailable, setMarkingUnavailable] = useState(false);

  const { logout, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [itemsResponse, catsResponse] = await Promise.all([
        menuService.getAllMenuItems(),
        menuService.getCategories(),
      ]);
      const items = Array.isArray(itemsResponse) ? itemsResponse : itemsResponse?.items || itemsResponse?.data || [];
      const cats = Array.isArray(catsResponse) ? catsResponse : catsResponse?.categories || catsResponse?.data || [];
      setMenuItems(items);
      setCategories(cats);
    } catch {
      setError("Failed to load menu items");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { logout(); navigate("/login"); };

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
    } catch (err) { throw err; }
  };

  const handleEdit = (item) => { setEditingItem(item); setFormOpen(true); };
  const handleDelete = async (id) => {
    try { await menuService.deleteMenuItem(id); await fetchData(); }
    catch { setError("Failed to delete item"); }
  };

  const handleToggleAvailability = async (id, isAvailable) => {
    try {
      await menuService.updateAvailability(id, isAvailable);
      setMenuItems((items) => items.map((item) => item._id === id ? { ...item, isAvailable } : item));
    } catch { setError("Failed to update availability"); }
  };

  const handleBulkToggle = async (visibleItems, targetAvailability) => {
    const targetItems = visibleItems.filter((item) => item.isAvailable !== targetAvailability);
    if (targetItems.length === 0) return;
    setMarkingUnavailable(true);
    try {
      const targetIds = targetItems.map((i) => i._id);
      const idSet = new Set(targetIds);
      setMenuItems((prev) => prev.map((item) => idSet.has(item._id) ? { ...item, isAvailable: targetAvailability } : item));
      await menuService.bulkUpdateAvailability(targetAvailability, targetIds);
    } catch {
      setError("Failed to update items. Please refresh.");
      await fetchData();
    } finally { setMarkingUnavailable(false); }
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === "all" ||
      (Array.isArray(item.category) ? item.category.includes(activeCategory) : item.category === activeCategory);
    return matchesSearch && matchesCategory;
  });

  const allUnavailable = filteredItems.length > 0 && filteredItems.every((i) => !i.isAvailable);
  const allAvailable = filteredItems.length > 0 && filteredItems.every((i) => i.isAvailable);
  const availableCount = menuItems.filter((i) => i.isAvailable).length;

  const sidebarProps = {
    activeSection,
    setActiveSection,
    navigate,
    handleLogout,
    availableCount,
    menuItemsLength: menuItems.length,
  };

  /* ── Menu section content (shared across all breakpoints) ── */
  const MenuSection = () => (
    <>
      {/* Search + bulk toggle */}
      <Box
        sx={{
          display: "flex",
          gap: { xs: 1, sm: 2 },
          mb: 2,
          alignItems: "center",
          backgroundColor: "#fff",
          p: { xs: 1.5, sm: 2 },
          borderRadius: "14px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          flexWrap: { xs: "wrap", sm: "nowrap" },
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Search items…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ fontSize: 18, color: "#94a3b8" }} />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
              "& fieldset": { borderColor: "#e2e8f0" },
              "&:hover fieldset": { borderColor: "#2563eb" },
              "&.Mui-focused fieldset": { borderColor: "#2563eb" },
            },
          }}
        />
        <Tooltip
          title={
            filteredItems.length === 0 ? "No items to toggle"
              : allUnavailable ? `Mark all ${filteredItems.length} item(s) available`
                : `Mark all ${filteredItems.length} item(s) unavailable`
          }
        >
          <Box sx={{ flexShrink: 0 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={!allUnavailable}
                  onChange={() => handleBulkToggle(filteredItems, allUnavailable ? true : false)}
                  disabled={markingUnavailable || filteredItems.length === 0}
                  color={allUnavailable ? "success" : "error"}
                  size="small"
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  {allUnavailable
                    ? <><Visibility sx={{ fontSize: 15, color: "success.main" }} />
                      <Typography variant="caption" sx={{ fontWeight: 700, color: "success.main", whiteSpace: "nowrap" }}>
                        {markingUnavailable ? "Updating…" : "All On"}
                      </Typography></>
                    : <><VisibilityOff sx={{ fontSize: 15, color: "error.main" }} />
                      <Typography variant="caption" sx={{ fontWeight: 700, color: "error.main", whiteSpace: "nowrap" }}>
                        {markingUnavailable ? "Updating…" : "All Off"}
                      </Typography></>
                  }
                </Box>
              }
              sx={{ ml: 0, mr: 0 }}
            />
          </Box>
        </Tooltip>
      </Box>

      {/* Category chips */}
      <Box sx={{
        display: "flex", gap: 1, flexWrap: "nowrap", overflowX: "auto", mb: 2, pb: 0.5,
        "&::-webkit-scrollbar": { height: 3 },
        "&::-webkit-scrollbar-thumb": { borderRadius: 4, backgroundColor: "#cbd5e1" },
      }}>
        {["all", ...categories].map((cat) => (
          <Chip
            key={cat}
            label={cat === "all" ? `All (${menuItems.length})` : cat}
            onClick={() => setActiveCategory(cat)}
            color={activeCategory === cat ? "primary" : "default"}
            variant={activeCategory === cat ? "filled" : "outlined"}
            size="small"
            sx={{
              textTransform: "capitalize",
              fontWeight: activeCategory === cat ? 700 : 500,
              cursor: "pointer",
              borderRadius: "8px",
              fontSize: "0.78rem",
              flexShrink: 0,
            }}
          />
        ))}
      </Box>

      {/* Table — horizontally scrollable on small screens */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress size={36} />
        </Box>
      ) : (
        <Box
          sx={{
            backgroundColor: "#fff",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            overflowX: "auto",   // ← key: allows table to scroll horizontally on mobile
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            mb: isMobile ? 10 : 0,  // space for bottom nav
          }}
        >
          <MenuItemsList
            items={filteredItems}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleAvailability={handleToggleAvailability}
          />
        </Box>
      )}
    </>
  );

  const OrdersSection = () => (
    <Box sx={{ mb: isMobile ? 10 : 0 }}>
      <OrderManagement isAdmin={true} />
    </Box>
  );

  /* ══════════════════════════════════════════════════════════
     MOBILE LAYOUT  (< 600px)
  ══════════════════════════════════════════════════════════ */
  if (isMobile) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", height: "100dvh", backgroundColor: "#f1f5f9" }}>
        {/* Top App Bar */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 1.5,
            backgroundColor: "#0f172a",
            flexShrink: 0,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ width: 30, height: 30, borderRadius: "8px", background: "linear-gradient(135deg, #3b82f6, #6366f1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <DashboardCustomize sx={{ fontSize: 16, color: "#fff" }} />
            </Box>
            <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: "0.95rem" }}>
              {activeSection === "menu" ? "Menu Items" : activeSection === "orders" ? "Orders" : "Admin"}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {activeSection === "menu" && (
              <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.72rem" }}>
                {availableCount}/{menuItems.length} available
              </Typography>
            )}
          </Box>
        </Box>

        {/* Scrollable Content */}
        <Box sx={{ flex: 1, overflowY: "auto", p: 1.5 }}>
          {activeSection === "menu" && <MenuSection />}
          {activeSection === "orders" && <OrdersSection />}
        </Box>

        {/* Floating Add button (menu section only) */}
        {activeSection === "menu" && (
          <Fab
            color="primary"
            size="medium"
            onClick={() => { setEditingItem(null); setFormOpen(true); }}
            sx={{
              position: "fixed",
              bottom: 80,  // above bottom nav
              right: 16,
              backgroundColor: "#2563eb",
              boxShadow: "0 4px 16px rgba(37,99,235,0.4)",
              "&:hover": { backgroundColor: "#1d4ed8" },
            }}
          >
            <Add />
          </Fab>
        )}

        {/* Bottom nav */}
        <BottomNav activeSection={activeSection} setActiveSection={setActiveSection} navigate={navigate} />

        {/* Shared dialogs */}
        <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError("")} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
          <Alert onClose={() => setError("")} severity="error" sx={{ width: "100%", borderRadius: "10px" }}>{error}</Alert>
        </Snackbar>
        <MenuItemForm open={formOpen} onClose={() => { setFormOpen(false); setEditingItem(null); }} onSubmit={handleCreateOrUpdate} item={editingItem} categories={categories} />
      </Box>
    );
  }

  /* ══════════════════════════════════════════════════════════
     TABLET LAYOUT  (600–960px) — icon-only sidebar
  ══════════════════════════════════════════════════════════ */
  if (isTablet) {
    return (
      <Box sx={{ display: "flex", height: "100vh", overflow: "hidden", backgroundColor: "#f1f5f9" }}>
        {/* Compact sidebar */}
        <Box sx={{ width: 64, flexShrink: 0 }}>
          <SidebarContent {...sidebarProps} compact={true} />
        </Box>

        {/* Main content */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Top bar */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2.5, py: 2, backgroundColor: "#fff", borderBottom: "1px solid #e2e8f0", flexShrink: 0 }}>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", color: "#0f172a" }}>
                {activeSection === "menu" ? "Menu Items" : "Order Management"}
              </Typography>
              <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                {activeSection === "menu" ? `${menuItems.length} items · ${availableCount} available` : "Auto-refreshes every 15s"}
              </Typography>
            </Box>
            {activeSection === "menu" && (
              <Button
                variant="contained"
                size="small"
                startIcon={<Add />}
                onClick={() => { setEditingItem(null); setFormOpen(true); }}
                sx={{ textTransform: "none", fontWeight: 700, borderRadius: "10px", backgroundColor: "#2563eb", "&:hover": { backgroundColor: "#1d4ed8" } }}
              >
                Add
              </Button>
            )}
          </Box>

          {/* Scrollable body */}
          <Box sx={{ flex: 1, overflowY: "auto", p: 2.5 }}>
            {activeSection === "menu" && <MenuSection />}
            {activeSection === "orders" && <OrdersSection />}
          </Box>
        </Box>

        <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError("")} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
          <Alert onClose={() => setError("")} severity="error" sx={{ width: "100%", borderRadius: "10px" }}>{error}</Alert>
        </Snackbar>
        <MenuItemForm open={formOpen} onClose={() => { setFormOpen(false); setEditingItem(null); }} onSubmit={handleCreateOrUpdate} item={editingItem} categories={categories} />
      </Box>
    );
  }

  /* ══════════════════════════════════════════════════════════
     DESKTOP LAYOUT  (> 960px) — full sidebar
  ══════════════════════════════════════════════════════════ */
  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden", backgroundColor: "#f1f5f9" }}>
      {/* Full sidebar */}
      <Box sx={{ width: 240, flexShrink: 0, boxShadow: "4px 0 24px rgba(0,0,0,0.15)" }}>
        <SidebarContent {...sidebarProps} compact={false} />
      </Box>

      {/* Main content */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top bar */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 4, py: 2.5, backgroundColor: "#fff", borderBottom: "1px solid #e2e8f0", flexShrink: 0 }}>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: "1.35rem", color: "#0f172a", lineHeight: 1.2 }}>
              {activeSection === "menu" ? "Menu Items" : "Order Management"}
            </Typography>
            <Typography sx={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: 500 }}>
              {activeSection === "menu"
                ? `${menuItems.length} total items · ${availableCount} available`
                : "All paid orders · auto-refreshes every 15s"}
            </Typography>
          </Box>
          {activeSection === "menu" && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => { setEditingItem(null); setFormOpen(true); }}
              sx={{ textTransform: "none", fontWeight: 700, borderRadius: "10px", backgroundColor: "#2563eb", boxShadow: "0 4px 14px rgba(37,99,235,0.3)", "&:hover": { backgroundColor: "#1d4ed8" } }}
            >
              Add Item
            </Button>
          )}
        </Box>

        {/* Scrollable body */}
        <Box sx={{ flex: 1, overflowY: "auto", p: 4 }}>
          {activeSection === "menu" && <MenuSection />}
          {activeSection === "orders" && <OrdersSection />}
        </Box>
      </Box>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError("")} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={() => setError("")} severity="error" sx={{ width: "100%", borderRadius: "10px" }}>{error}</Alert>
      </Snackbar>
      <MenuItemForm open={formOpen} onClose={() => { setFormOpen(false); setEditingItem(null); }} onSubmit={handleCreateOrUpdate} item={editingItem} categories={categories} />
    </Box>
  );
};

export default AdminDashboard;
