import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Alert,
  Snackbar,
  CircularProgress,
  TextField,
  InputAdornment,
  Fab,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Add,
  LogoutOutlined,
  ArrowBack,
  Search,
  RestaurantMenu,
  Assignment,
  People,
  DashboardCustomize,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { userService } from "../services/userService";
import UsersList from "../components/admin/UsersList";
import UserForm from "../components/admin/UserForm";

/* ── Sidebar nav item (matches AdminDashboard exactly) ──────── */
const SidebarNavItem = ({ icon, label, active, compact, onClick }) => (
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

/* ── Shared Sidebar ─────────────────────────────────────────── */
const Sidebar = ({ compact, navigate, handleLogout }) => (
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
      <Box sx={{ width: 36, height: 36, borderRadius: "10px", background: "linear-gradient(135deg, #3b82f6, #6366f1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <DashboardCustomize sx={{ fontSize: 18, color: "#fff" }} />
      </Box>
      {!compact && (
        <Box>
          <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: "0.95rem", lineHeight: 1.2 }}>Madhav Admin</Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.7rem", fontWeight: 500 }}>Admin Panel</Typography>
        </Box>
      )}
    </Box>

    <SidebarNavItem icon={<RestaurantMenu />} label="Menu Items" active={false} compact={compact} onClick={() => navigate("/admin")} />
    <SidebarNavItem icon={<Assignment />} label="Orders" active={false} compact={compact} onClick={() => navigate("/admin")} />
    <SidebarNavItem icon={<People />} label="Manage Users" active={true} compact={compact} onClick={() => { }} />

    <Box sx={{ flex: 1 }} />

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

/* ── Bottom nav for mobile ──────────────────────────────────── */
const BottomNav = ({ navigate }) => {
  const tabs = [
    { label: "Menu", icon: <RestaurantMenu />, action: () => navigate("/admin") },
    { label: "Orders", icon: <Assignment />, action: () => navigate("/admin") },
    { label: "Users", icon: <People />, active: true, action: () => { } },
  ];
  return (
    <Box
      sx={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
        background: "linear-gradient(160deg, #0f172a 0%, #1e293b 100%)",
        display: "flex", justifyContent: "space-around",
        pb: "env(safe-area-inset-bottom, 8px)", pt: 1,
        borderTop: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.3)",
      }}
    >
      {tabs.map(({ label, icon, active, action }) => (
        <Box key={label} onClick={action} sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 0.25, py: 0.75, cursor: "pointer", color: active ? "#60a5fa" : "rgba(255,255,255,0.4)", transition: "color 0.15s" }}>
          <Box sx={{ p: 0.5, borderRadius: "8px", backgroundColor: active ? "rgba(96,165,250,0.15)" : "transparent" }}>
            {React.cloneElement(icon, { sx: { fontSize: 22 } })}
          </Box>
          <Typography sx={{ fontSize: "0.65rem", fontWeight: active ? 700 : 500 }}>{label}</Typography>
        </Box>
      ))}
    </Box>
  );
};

/* ════════════════════════════════════════════════════════════════ */
const AdminUsers = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch { setError("Failed to load users"); }
    finally { setLoading(false); }
  };

  const handleLogout = () => { logout(); navigate("/login"); };

  const handleCreateOrUpdate = async (data) => {
    try {
      if (editingUser) { await userService.updateUser(editingUser._id, data); }
      else { await userService.createManager(data); }
      await fetchUsers();
      setFormOpen(false);
      setEditingUser(null);
    } catch (err) { throw err; }
  };

  const handleEdit = (u) => { setEditingUser(u); setFormOpen(true); };
  const handleDelete = async (id) => {
    try { await userService.deleteUser(id); await fetchUsers(); }
    catch { setError("Failed to delete user"); }
  };
  const handlePromote = async (id) => {
    try { await userService.promoteToAdmin(id); await fetchUsers(); }
    catch { setError("Failed to promote user"); }
  };

  const filteredUsers = users.filter((u) =>
    u.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const adminCount = users.filter((u) => u.role === "admin").length;
  const managerCount = users.filter((u) => u.role === "manager").length;

  /* ── Shared content ─────────────────────────────────────── */
  const Content = () => (
    <>
      {/* Search + stats row */}
      <Box
        sx={{
          display: "flex", gap: 2, mb: 2.5, alignItems: "center",
          backgroundColor: "#fff", p: { xs: 1.5, sm: 2 },
          borderRadius: "14px", border: "1px solid #e2e8f0",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          flexWrap: { xs: "wrap", sm: "nowrap" },
        }}
      >
        <TextField
          fullWidth size="small"
          placeholder="Search by username…"
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
        {/* Mini stat chips */}
        <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
          <Box sx={{ px: 1.5, py: 0.5, borderRadius: "8px", backgroundColor: "#fef2f2", border: "1px solid #fecaca" }}>
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#dc2626", whiteSpace: "nowrap" }}>
              {adminCount} Admin{adminCount !== 1 ? "s" : ""}
            </Typography>
          </Box>
          <Box sx={{ px: 1.5, py: 0.5, borderRadius: "8px", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}>
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#16a34a", whiteSpace: "nowrap" }}>
              {managerCount} Manager{managerCount !== 1 ? "s" : ""}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Table */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress size={36} />
        </Box>
      ) : (
        <Box sx={{
          backgroundColor: "#fff", borderRadius: "16px",
          border: "1px solid #e2e8f0", overflowX: "auto",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          mb: isMobile ? 10 : 0,
        }}>
          <UsersList
            users={filteredUsers}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onPromote={handlePromote}
          />
        </Box>
      )}
    </>
  );

  const sharedDialogs = (
    <>
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError("")} anchorOrigin={{ vertical: isMobile ? "top" : "bottom", horizontal: "center" }}>
        <Alert onClose={() => setError("")} severity="error" sx={{ width: "100%", borderRadius: "10px" }}>{error}</Alert>
      </Snackbar>
      <UserForm open={formOpen} onClose={() => { setFormOpen(false); setEditingUser(null); }} onSubmit={handleCreateOrUpdate} user={editingUser} />
    </>
  );

  /* ── MOBILE ─────────────────────────────────────────────── */
  if (isMobile) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", height: "100dvh", backgroundColor: "#f1f5f9" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, py: 1.5, backgroundColor: "#0f172a", flexShrink: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ width: 30, height: 30, borderRadius: "8px", background: "linear-gradient(135deg, #3b82f6, #6366f1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <DashboardCustomize sx={{ fontSize: 16, color: "#fff" }} />
            </Box>
            <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: "0.95rem" }}>Manage Users</Typography>
          </Box>
          <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.72rem" }}>
            {users.length} total
          </Typography>
        </Box>
        <Box sx={{ flex: 1, overflowY: "auto", p: 1.5 }}>
          <Content />
        </Box>
        <Fab size="medium" onClick={() => { setEditingUser(null); setFormOpen(true); }}
          sx={{ position: "fixed", bottom: 80, right: 16, backgroundColor: "#2563eb", boxShadow: "0 4px 16px rgba(37,99,235,0.4)", "&:hover": { backgroundColor: "#1d4ed8" } }}>
          <Add sx={{ color: "#fff" }} />
        </Fab>
        <BottomNav navigate={navigate} />
        {sharedDialogs}
      </Box>
    );
  }

  /* ── TABLET ─────────────────────────────────────────────── */
  if (isTablet) {
    return (
      <Box sx={{ display: "flex", height: "100vh", overflow: "hidden", backgroundColor: "#f1f5f9" }}>
        <Box sx={{ width: 64, flexShrink: 0 }}>
          <Sidebar compact={true} navigate={navigate} handleLogout={handleLogout} />
        </Box>
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2.5, py: 2, backgroundColor: "#fff", borderBottom: "1px solid #e2e8f0", flexShrink: 0 }}>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", color: "#0f172a" }}>Manage Users</Typography>
              <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8" }}>{users.length} total · {adminCount} admin · {managerCount} manager</Typography>
            </Box>
            <Button variant="contained" size="small" startIcon={<Add />} onClick={() => { setEditingUser(null); setFormOpen(true); }}
              sx={{ textTransform: "none", fontWeight: 700, borderRadius: "10px", backgroundColor: "#2563eb", "&:hover": { backgroundColor: "#1d4ed8" } }}>
              Add
            </Button>
          </Box>
          <Box sx={{ flex: 1, overflowY: "auto", p: 2.5 }}>
            <Content />
          </Box>
        </Box>
        {sharedDialogs}
      </Box>
    );
  }

  /* ── DESKTOP ─────────────────────────────────────────────── */
  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden", backgroundColor: "#f1f5f9" }}>
      <Box sx={{ width: 240, flexShrink: 0, boxShadow: "4px 0 24px rgba(0,0,0,0.15)" }}>
        <Sidebar compact={false} navigate={navigate} handleLogout={handleLogout} />
      </Box>
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top bar */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 4, py: 2.5, backgroundColor: "#fff", borderBottom: "1px solid #e2e8f0", flexShrink: 0 }}>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: "1.35rem", color: "#0f172a", lineHeight: 1.2 }}>
              Manage Users
            </Typography>
            <Typography sx={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: 500 }}>
              {users.length} total · {adminCount} admin{adminCount !== 1 ? "s" : ""} · {managerCount} manager{managerCount !== 1 ? "s" : ""}
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<Add />} onClick={() => { setEditingUser(null); setFormOpen(true); }}
            sx={{ textTransform: "none", fontWeight: 700, borderRadius: "10px", backgroundColor: "#2563eb", boxShadow: "0 4px 14px rgba(37,99,235,0.3)", "&:hover": { backgroundColor: "#1d4ed8" } }}>
            Add User
          </Button>
        </Box>
        <Box sx={{ flex: 1, overflowY: "auto", p: 4 }}>
          <Content />
        </Box>
      </Box>
      {sharedDialogs}
    </Box>
  );
};

export default AdminUsers;
