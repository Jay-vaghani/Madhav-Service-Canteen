import React, { useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Switch,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";

const MenuItemsList = ({ items, onEdit, onDelete, onToggleAvailability }) => {
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleDelete = (item) => {
    setDeleteConfirm(item);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      onDelete(deleteConfirm._id);
      setDeleteConfirm(null);
    }
  };

  return (
    <>
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
              <TableCell align="center">
                <strong>Actions</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
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
                <TableCell sx={{ maxWidth: 300 }}>{item.description}</TableCell>
                <TableCell align="right">₨. {item.price.toFixed(2)}</TableCell>
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
                        onToggleAvailability(item._id, !item.isAvailable)
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
                <TableCell align="center">
                  <IconButton
                    color="primary"
                    onClick={() => onEdit(item)}
                    size="small"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(item)}
                    size="small"
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>
          ?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MenuItemsList;
