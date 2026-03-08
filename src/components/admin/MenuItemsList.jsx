import React, { useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Switch,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Typography,
  Tooltip,
} from "@mui/material";
import { Edit, Delete, WarningAmberRounded } from "@mui/icons-material";

const MenuItemsList = ({ items, onEdit, onDelete, onToggleAvailability }) => {
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  if (items.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 6, color: "#94a3b8" }}>
        <Typography sx={{ fontWeight: 600 }}>No items found</Typography>
        <Typography variant="body2" sx={{ mt: 0.5 }}>
          Try adjusting your search or category filter.
        </Typography>
      </Box>
    );
  }

  const hasActions = !!onEdit || !!onDelete;

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
            <TableCell sx={{ pl: 2.5 }}>Item</TableCell>
            <TableCell>Category</TableCell>
            <TableCell align="right">Price</TableCell>
            <TableCell align="center">Availability</TableCell>
            {hasActions && <TableCell align="center">Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item, idx) => (
            <TableRow
              key={item._id}
              sx={{
                transition: "background 0.15s",
                "&:hover": { backgroundColor: "#f8fafc" },
                "& td": {
                  py: 1.5,
                  borderBottom: idx === items.length - 1 ? "none" : "1px solid #f1f5f9",
                },
                opacity: item.isAvailable ? 1 : 0.65,
              }}
            >
              {/* Item (image + name) */}
              <TableCell sx={{ pl: 2.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Avatar
                    src={item.imageUrl}
                    alt={item.name}
                    variant="rounded"
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                    }}
                  />
                  <Typography sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#1e293b" }}>
                    {item.name}
                  </Typography>
                </Box>
              </TableCell>

              {/* Category */}
              <TableCell>
                <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                  {(Array.isArray(item.category) ? item.category : [item.category]).map((cat, i) => (
                    <Chip
                      key={i}
                      label={cat}
                      size="small"
                      sx={{
                        textTransform: "capitalize",
                        backgroundColor: "#eff6ff",
                        color: "#2563eb",
                        fontWeight: 600,
                        fontSize: "0.72rem",
                        borderRadius: "6px",
                        border: "1px solid #bfdbfe",
                        height: 22,
                      }}
                    />
                  ))}
                </Box>
              </TableCell>

              {/* Price */}
              <TableCell align="right">
                <Typography sx={{ fontWeight: 800, fontSize: "0.9rem", color: "#0f172a" }}>
                  ₹{item.price.toFixed(2)}
                </Typography>
              </TableCell>

              {/* Availability toggle */}
              <TableCell align="center">
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                  <Switch
                    checked={item.isAvailable}
                    onChange={() => onToggleAvailability(item._id, !item.isAvailable)}
                    size="small"
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": { color: "#16a34a" },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                        backgroundColor: "#16a34a",
                      },
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      color: item.isAvailable ? "#16a34a" : "#dc2626",
                      minWidth: 70,
                    }}
                  >
                    {item.isAvailable ? "In Stock" : "Out of Stock"}
                  </Typography>
                </Box>
              </TableCell>

              {/* Actions — admin only (hidden for manager when onEdit/onDelete are null) */}
              {hasActions && (
                <TableCell align="center">
                  <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}>
                    {onEdit && (
                      <Tooltip title="Edit item">
                        <IconButton size="small" onClick={() => onEdit(item)}
                          sx={{ color: "#3b82f6", backgroundColor: "#eff6ff", borderRadius: "8px", border: "1px solid #bfdbfe", "&:hover": { backgroundColor: "#dbeafe" }, width: 32, height: 32 }}>
                          <Edit sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    )}
                    {onDelete && (
                      <Tooltip title="Delete item">
                        <IconButton size="small" onClick={() => setDeleteConfirm(item)}
                          sx={{ color: "#dc2626", backgroundColor: "#fef2f2", borderRadius: "8px", border: "1px solid #fecaca", "&:hover": { backgroundColor: "#fee2e2" }, width: 32, height: 32 }}>
                          <Delete sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: "20px", p: 0.5 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 1.5, pb: 1 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "10px",
              backgroundColor: "#fef2f2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <WarningAmberRounded sx={{ color: "#dc2626", fontSize: 22 }} />
          </Box>
          Delete Item
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "#475569", fontSize: "0.9rem" }}>
            Are you sure you want to delete{" "}
            <strong style={{ color: "#0f172a" }}>{deleteConfirm?.name}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={() => setDeleteConfirm(null)}
            sx={{ textTransform: "none", fontWeight: 600, borderRadius: "10px" }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => { if (deleteConfirm) { onDelete(deleteConfirm._id); setDeleteConfirm(null); } }}
            variant="contained"
            color="error"
            sx={{
              textTransform: "none",
              fontWeight: 700,
              borderRadius: "10px",
              backgroundColor: "#dc2626",
              "&:hover": { backgroundColor: "#b91c1c" },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MenuItemsList;
