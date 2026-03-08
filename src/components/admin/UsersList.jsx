import React, { useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Tooltip,
  Avatar,
} from "@mui/material";
import {
  Edit,
  Delete,
  TrendingUp,
  WarningAmberRounded,
  Shield,
  AdminPanelSettings,
} from "@mui/icons-material";

const RoleBadge = ({ role }) => {
  const isAdmin = role === "admin";
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        px: 1.25,
        py: 0.4,
        borderRadius: "8px",
        fontSize: "0.72rem",
        fontWeight: 700,
        letterSpacing: 0.3,
        backgroundColor: isAdmin ? "#fef2f2" : "#f0fdf4",
        color: isAdmin ? "#dc2626" : "#16a34a",
        border: `1px solid ${isAdmin ? "#fecaca" : "#bbf7d0"}`,
        textTransform: "capitalize",
      }}
    >
      {isAdmin
        ? <AdminPanelSettings sx={{ fontSize: 13 }} />
        : <Shield sx={{ fontSize: 13 }} />
      }
      {role}
    </Box>
  );
};

const UsersList = ({ users, onEdit, onDelete, onPromote }) => {
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [promoteConfirm, setPromoteConfirm] = useState(null);

  if (users.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 6, color: "#94a3b8" }}>
        <Typography sx={{ fontWeight: 600 }}>No users found</Typography>
        <Typography variant="body2" sx={{ mt: 0.5 }}>Try adjusting your search.</Typography>
      </Box>
    );
  }

  return (
    <>
      <Table>
        <TableHead>
          <TableRow
            sx={{
              backgroundColor: "#f8fafc",
              "& th": {
                fontWeight: 700,
                fontSize: "0.72rem",
                letterSpacing: 0.8,
                color: "#64748b",
                textTransform: "uppercase",
                borderBottom: "1px solid #e2e8f0",
                py: 1.5,
              },
            }}
          >
            <TableCell sx={{ pl: 2.5 }}>User</TableCell>
            <TableCell>Role</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user, idx) => (
            <TableRow
              key={user._id}
              sx={{
                transition: "background 0.15s",
                "&:hover": { backgroundColor: "#f8fafc" },
                "& td": {
                  py: 1.75,
                  borderBottom: idx === users.length - 1 ? "none" : "1px solid #f1f5f9",
                },
              }}
            >
              {/* Avatar + Username */}
              <TableCell sx={{ pl: 2.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Avatar
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: "10px",
                      backgroundColor: user.role === "admin" ? "#fef2f2" : "#eff6ff",
                      color: user.role === "admin" ? "#dc2626" : "#2563eb",
                      fontWeight: 800,
                      fontSize: "0.9rem",
                    }}
                  >
                    {user.username?.charAt(0)?.toUpperCase()}
                  </Avatar>
                  <Typography sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#1e293b" }}>
                    {user.username}
                  </Typography>
                </Box>
              </TableCell>

              {/* Role badge */}
              <TableCell>
                <RoleBadge role={user.role} />
              </TableCell>

              {/* Actions */}
              <TableCell align="center">
                <Box sx={{ display: "flex", justifyContent: "center", gap: 0.75 }}>
                  {user.role === "manager" && (
                    <Tooltip title="Promote to Admin">
                      <IconButton
                        size="small"
                        onClick={() => setPromoteConfirm(user)}
                        sx={{
                          color: "#16a34a",
                          backgroundColor: "#f0fdf4",
                          borderRadius: "8px",
                          border: "1px solid #bbf7d0",
                          "&:hover": { backgroundColor: "#dcfce7" },
                          width: 32, height: 32,
                        }}
                      >
                        <TrendingUp sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Edit user">
                    <IconButton
                      size="small"
                      onClick={() => onEdit(user)}
                      sx={{
                        color: "#3b82f6",
                        backgroundColor: "#eff6ff",
                        borderRadius: "8px",
                        border: "1px solid #bfdbfe",
                        "&:hover": { backgroundColor: "#dbeafe" },
                        width: 32, height: 32,
                      }}
                    >
                      <Edit sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete user">
                    <IconButton
                      size="small"
                      onClick={() => setDeleteConfirm(user)}
                      sx={{
                        color: "#dc2626",
                        backgroundColor: "#fef2f2",
                        borderRadius: "8px",
                        border: "1px solid #fecaca",
                        "&:hover": { backgroundColor: "#fee2e2" },
                        width: 32, height: 32,
                      }}
                    >
                      <Delete sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* ── Delete Confirmation ─────────────────────────── */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: "20px", p: 0.5 } }}>
        <DialogTitle sx={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 1.5, pb: 1 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: "10px", backgroundColor: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <WarningAmberRounded sx={{ color: "#dc2626", fontSize: 22 }} />
          </Box>
          Delete User
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "#475569", fontSize: "0.9rem" }}>
            Are you sure you want to delete{" "}
            <strong style={{ color: "#0f172a" }}>{deleteConfirm?.username}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setDeleteConfirm(null)} sx={{ textTransform: "none", fontWeight: 600, borderRadius: "10px" }}>Cancel</Button>
          <Button
            onClick={() => { if (deleteConfirm) { onDelete(deleteConfirm._id); setDeleteConfirm(null); } }}
            variant="contained" color="error"
            sx={{ textTransform: "none", fontWeight: 700, borderRadius: "10px", backgroundColor: "#dc2626", "&:hover": { backgroundColor: "#b91c1c" } }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Promote Confirmation ────────────────────────── */}
      <Dialog open={!!promoteConfirm} onClose={() => setPromoteConfirm(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: "20px", p: 0.5 } }}>
        <DialogTitle sx={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 1.5, pb: 1 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: "10px", backgroundColor: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <TrendingUp sx={{ color: "#16a34a", fontSize: 22 }} />
          </Box>
          Promote to Admin
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "#475569", fontSize: "0.9rem" }}>
            Promote{" "}
            <strong style={{ color: "#0f172a" }}>{promoteConfirm?.username}</strong> to Admin? They will gain full administrative access.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setPromoteConfirm(null)} sx={{ textTransform: "none", fontWeight: 600, borderRadius: "10px" }}>Cancel</Button>
          <Button
            onClick={() => { if (promoteConfirm) { onPromote(promoteConfirm._id); setPromoteConfirm(null); } }}
            variant="contained"
            sx={{ textTransform: "none", fontWeight: 700, borderRadius: "10px", backgroundColor: "#16a34a", "&:hover": { backgroundColor: "#15803d" } }}
          >
            Promote
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UsersList;
