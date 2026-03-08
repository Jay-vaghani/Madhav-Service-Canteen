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
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  LogoutOutlined,
  Search,
  VisibilityOff,
  Visibility,
  RestaurantMenu,
  Assignment,
  DashboardCustomize,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { menuService } from "../services/menuService";
import MenuItemsList from "../components/admin/MenuItemsList";
import OrderManagement from "../components/admin/OrderManagement";

/* ── Sidebar nav item ─────────────────────────────────────── */
const NavItem = ({ icon, label, active, compact, onClick }) => (
  <Tooltip title={compact ? label : ""} placement="right" arrow>
    <Box
      onClick={onClick}
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
        backgroundColor: active ? "rgba(255,255,255,0.12)" : "transparent",
        color: active ? "#fff" : "rgba(255,255,255,0.5)",
        position: "relative",
        "&:hover": { backgroundColor: "rgba(255,255,255,0.08)", color: "#fff" },
      }}
    >
      {active && (
        <Box sx={{ position: "absolute", left: 0, top: "20%", bottom: "20%", width: 3, borderRadius: "0 3px 3px 0", backgroundColor: "#60a5fa" }} />
      )}
      <Box sx={{ fontSize: 20, display: "flex" }}>{icon}</Box>
      {!compact && (
        <Typography sx={{ fontSize: "0.875rem", fontWeight: active ? 700 : 500, whiteSpace: "nowrap" }}>
          {label}
        </Typography>
      )}
    </Box>
  </Tooltip>
);

/* ── Sidebar shell ────────────────────────────────────────── */
const Sidebar = ({ activeSection, setActiveSection, handleLogout, availableCount, menuItemsLength, compact }) => (
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
      <Box sx={{ width: 36, height: 36, borderRadius: "10px", background: "linear-gradient(135deg, #f59e0b, #f97316)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <DashboardCustomize sx={{ fontSize: 18, color: "#fff" }} />
      </Box>
      {!compact && (
        <Box>
          <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: "0.95rem", lineHeight: 1.2 }}>Madhav Manager</Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.7rem", fontWeight: 500 }}>Manager Panel</Typography>
        </Box>
      )}
    </Box>

    <NavItem icon={<RestaurantMenu />} label="Menu Items" active={activeSection === "menu"} compact={compact} onClick={() => setActiveSection("menu")} />
    <NavItem icon={<Assignment />} label="Orders" active={activeSection === "orders"} compact={compact} onClick={() => setActiveSection("orders")} />

    <Box sx={{ flex: 1 }} />

    {/* Stats pill */}
    {!compact && (
      <Box sx={{ mx: 1, p: 1.5, borderRadius: "12px", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", mb: 2 }}>
        <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.65rem", fontWeight: 700, letterSpacing: 1, mb: 0.5 }}>MENU STATUS</Typography>
        <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: "1.05rem" }}>
          {availableCount}
          <Typography component="span" sx={{ color: "rgba(255,255,255,0.4)", fontWeight: 500, fontSize: "0.8rem", ml: 0.5 }}>
            / {menuItemsLength} available
          </Typography>
        </Typography>
      </Box>
    )}

    <Tooltip title={compact ? "Logout" : ""} placement="right" arrow>
      <Box
        onClick={handleLogout}
        sx={{
          display: "flex", alignItems: "center", justifyContent: compact ? "center" : "flex-start",
          gap: compact ? 0 : 1.5, px: compact ? 1 : 2, py: 1.25, borderRadius: "12px",
          cursor: "pointer", color: "rgba(255,255,255,0.4)",
          "&:hover": { backgroundColor: "rgba(239,68,68,0.12)", color: "#f87171" }, transition: "all 0.18s",
        }}
      >
        <LogoutOutlined sx={{ fontSize: 20 }} />
        {!compact && <Typography sx={{ fontSize: "0.875rem", fontWeight: 600 }}>Logout</Typography>}
      </Box>
    </Tooltip>
  </Box>
);

/* ── Mobile bottom nav ────────────────────────────────────── */
const BottomNav = ({ activeSection, setActiveSection }) => {
  const tabs = [
    { id: "menu", icon: <RestaurantMenu />, label: "Menu" },
    { id: "orders", icon: <Assignment />, label: "Orders" },
  ];
  return (
    <Box sx={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100, background: "linear-gradient(160deg, #0f172a 0%, #1e293b 100%)", display: "flex", justifyContent: "space-around", pb: "env(safe-area-inset-bottom, 8px)", pt: 1, borderTop: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 -4px 20px rgba(0,0,0,0.3)" }}>
      {tabs.map(({ id, icon, label }) => {
        const isActive = activeSection === id;
        return (
          <Box key={id} onClick={() => setActiveSection(id)} sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 0.25, py: 0.75, cursor: "pointer", color: isActive ? "#60a5fa" : "rgba(255,255,255,0.4)", transition: "color 0.15s" }}>
            <Box sx={{ p: 0.5, borderRadius: "8px", backgroundColor: isActive ? "rgba(96,165,250,0.15)" : "transparent" }}>
              {React.cloneElement(icon, { sx: { fontSize: 22 } })}
            </Box>
            <Typography sx={{ fontSize: "0.65rem", fontWeight: isActive ? 700 : 500 }}>{label}</Typography>
          </Box>
        );
      })}
    </Box>
  );
};

/* ════════════════════════════════════════════════════════════
   MANAGER DASHBOARD
════════════════════════════════════════════════════════════ */
const ManagerDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const [activeSection, setActiveSection] = useState("menu");
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [markingUnavailable, setMarkingUnavailable] = useState(false);

  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [itemsRes, catsRes] = await Promise.all([
        menuService.getAllMenuItems(),
        menuService.getCategories(),
      ]);
      const items = Array.isArray(itemsRes) ? itemsRes : itemsRes?.items || itemsRes?.data || [];
      const cats = Array.isArray(catsRes) ? catsRes : catsRes?.categories || catsRes?.data || [];
      setMenuItems(items);
      setCategories(cats);
    } catch { setError("Failed to load menu items"); }
    finally { setLoading(false); }
  };

  const handleLogout = () => { logout(); navigate("/login"); };

  const handleToggleAvailability = async (id, isAvailable) => {
    try {
      await menuService.updateAvailability(id, isAvailable);
      setMenuItems((items) => items.map((item) => item._id === id ? { ...item, isAvailable } : item));
    } catch { setError("Failed to update availability"); }
  };

  // Bulk toggle — identical to AdminDashboard
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

  // Filtered + derived state
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

  const sidebarProps = { activeSection, setActiveSection, handleLogout, availableCount, menuItemsLength: menuItems.length };

  /* ── Menu section (no Add/Edit/Delete — manager can only toggle) ── */
  const MenuSection = () => (
    <>
      {/* Search + bulk toggle */}
      <Box sx={{ display: "flex", gap: { xs: 1, sm: 2 }, mb: 2, alignItems: "center", backgroundColor: "#fff", p: { xs: 1.5, sm: 2 }, borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", flexWrap: { xs: "wrap", sm: "nowrap" } }}>
        <TextField
          fullWidth size="small"
          placeholder="Search items…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 18, color: "#94a3b8" }} /></InputAdornment>,
          }}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px", "& fieldset": { borderColor: "#e2e8f0" }, "&:hover fieldset": { borderColor: "#f59e0b" }, "&.Mui-focused fieldset": { borderColor: "#f59e0b" } } }}
        />
        <Tooltip title={filteredItems.length === 0 ? "No items" : allUnavailable ? `Mark all ${filteredItems.length} items available` : `Mark all ${filteredItems.length} items unavailable`}>
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
                    ? <><Visibility sx={{ fontSize: 15, color: "success.main" }} /><Typography variant="caption" sx={{ fontWeight: 700, color: "success.main", whiteSpace: "nowrap" }}>{markingUnavailable ? "Updating…" : "All On"}</Typography></>
                    : <><VisibilityOff sx={{ fontSize: 15, color: "error.main" }} /><Typography variant="caption" sx={{ fontWeight: 700, color: "error.main", whiteSpace: "nowrap" }}>{markingUnavailable ? "Updating…" : "All Off"}</Typography></>
                  }
                </Box>
              }
              sx={{ ml: 0, mr: 0 }}
            />
          </Box>
        </Tooltip>
      </Box>

      {/* Category filter chips */}
      <Box sx={{ display: "flex", gap: 1, flexWrap: "nowrap", overflowX: "auto", mb: 2, pb: 0.5, "&::-webkit-scrollbar": { height: 3 }, "&::-webkit-scrollbar-thumb": { borderRadius: 4, backgroundColor: "#cbd5e1" } }}>
        {["all", ...categories].map((cat) => (
          <Chip
            key={cat}
            label={cat === "all" ? `All (${menuItems.length})` : cat}
            onClick={() => setActiveCategory(cat)}
            color={activeCategory === cat ? "primary" : "default"}
            variant={activeCategory === cat ? "filled" : "outlined"}
            size="small"
            sx={{ textTransform: "capitalize", fontWeight: activeCategory === cat ? 700 : 500, cursor: "pointer", borderRadius: "8px", fontSize: "0.78rem", flexShrink: 0 }}
          />
        ))}
      </Box>

      {/* Table — manager sees MenuItemsList but without Edit/Delete (controlled via props) */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress size={36} /></Box>
      ) : (
        <Box sx={{ backgroundColor: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", overflowX: "auto", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", mb: isMobile ? 10 : 0 }}>
          <MenuItemsList
            items={filteredItems}
            onEdit={null}       // null = hides edit button inside MenuItemsList
            onDelete={null}     // null = hides delete button
            onToggleAvailability={handleToggleAvailability}
          />
        </Box>
      )}
    </>
  );

  const OrdersSection = () => (
    <Box sx={{ mb: isMobile ? 10 : 0 }}>
      <OrderManagement isAdmin={false} />
    </Box>
  );

  const titleMap = { menu: "Menu Availability", orders: "Order Management" };
  const subtitleMap = {
    menu: `${menuItems.length} total items · ${availableCount} available`,
    orders: "All paid orders · auto-refreshes every 15s",
  };

  /* ── MOBILE ─────────────────────────────────────────────── */
  if (isMobile) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", height: "100dvh", backgroundColor: "#f1f5f9" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, py: 1.5, backgroundColor: "#0f172a", flexShrink: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ width: 30, height: 30, borderRadius: "8px", background: "linear-gradient(135deg, #f59e0b, #f97316)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <DashboardCustomize sx={{ fontSize: 16, color: "#fff" }} />
            </Box>
            <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: "0.95rem" }}>{titleMap[activeSection]}</Typography>
          </Box>
          {activeSection === "menu" && (
            <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.72rem" }}>{availableCount}/{menuItems.length}</Typography>
          )}
        </Box>
        <Box sx={{ flex: 1, overflowY: "auto", p: 1.5 }}>
          {activeSection === "menu" && <MenuSection />}
          {activeSection === "orders" && <OrdersSection />}
        </Box>
        <BottomNav activeSection={activeSection} setActiveSection={setActiveSection} />
        <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError("")} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
          <Alert onClose={() => setError("")} severity="error" sx={{ width: "100%", borderRadius: "10px" }}>{error}</Alert>
        </Snackbar>
      </Box>
    );
  }

  /* ── TABLET ─────────────────────────────────────────────── */
  if (isTablet) {
    return (
      <Box sx={{ display: "flex", height: "100vh", overflow: "hidden", backgroundColor: "#f1f5f9" }}>
        <Box sx={{ width: 64, flexShrink: 0 }}>
          <Sidebar {...sidebarProps} compact={true} />
        </Box>
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2.5, py: 2, backgroundColor: "#fff", borderBottom: "1px solid #e2e8f0", flexShrink: 0 }}>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", color: "#0f172a" }}>{titleMap[activeSection]}</Typography>
              <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8" }}>{subtitleMap[activeSection]}</Typography>
            </Box>
          </Box>
          <Box sx={{ flex: 1, overflowY: "auto", p: 2.5 }}>
            {activeSection === "menu" && <MenuSection />}
            {activeSection === "orders" && <OrdersSection />}
          </Box>
        </Box>
        <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError("")} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
          <Alert onClose={() => setError("")} severity="error" sx={{ width: "100%", borderRadius: "10px" }}>{error}</Alert>
        </Snackbar>
      </Box>
    );
  }

  /* ── DESKTOP ─────────────────────────────────────────────── */
  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden", backgroundColor: "#f1f5f9" }}>
      <Box sx={{ width: 240, flexShrink: 0, boxShadow: "4px 0 24px rgba(0,0,0,0.15)" }}>
        <Sidebar {...sidebarProps} compact={false} />
      </Box>
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 4, py: 2.5, backgroundColor: "#fff", borderBottom: "1px solid #e2e8f0", flexShrink: 0 }}>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: "1.35rem", color: "#0f172a", lineHeight: 1.2 }}>
              {titleMap[activeSection]}
            </Typography>
            <Typography sx={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: 500 }}>
              {subtitleMap[activeSection]}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ flex: 1, overflowY: "auto", p: 4 }}>
          {activeSection === "menu" && <MenuSection />}
          {activeSection === "orders" && <OrdersSection />}
        </Box>
      </Box>
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError("")} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={() => setError("")} severity="error" sx={{ width: "100%", borderRadius: "10px" }}>{error}</Alert>
      </Snackbar>
    </Box>
  );
};

export default ManagerDashboard;
