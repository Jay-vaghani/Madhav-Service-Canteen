import React, { useState } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Edit, Delete, UpgradeOutlined } from "@mui/icons-material";

const UsersList = ({ users, onEdit, onDelete, onPromote }) => {
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [promoteConfirm, setPromoteConfirm] = useState(null);

  const handleDelete = (user) => {
    setDeleteConfirm(user);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      onDelete(deleteConfirm._id);
      setDeleteConfirm(null);
    }
  };

  const handlePromote = (user) => {
    setPromoteConfirm(user);
  };

  const confirmPromote = () => {
    if (promoteConfirm) {
      onPromote(promoteConfirm._id);
      setPromoteConfirm(null);
    }
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Username</strong>
              </TableCell>
              <TableCell>
                <strong>Role</strong>
              </TableCell>
              <TableCell align="right">
                <strong>Actions</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id} hover>
                <TableCell>{user.username}</TableCell>
                <TableCell>
                  <Chip
                    label={user.role}
                    color={user.role === "admin" ? "error" : "default"}
                    size="small"
                    sx={{ textTransform: "capitalize" }}
                  />
                </TableCell>
                <TableCell align="right">
                  <Box
                    sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}
                  >
                    {user.role === "manager" && (
                      <IconButton
                        color="success"
                        onClick={() => handlePromote(user)}
                        size="small"
                        title="Promote to Admin"
                      >
                        <UpgradeOutlined />
                      </IconButton>
                    )}
                    <IconButton
                      color="primary"
                      onClick={() => onEdit(user)}
                      size="small"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(user)}
                      size="small"
                    >
                      <Delete />
                    </IconButton>
                  </Box>
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
          Are you sure you want to delete user{" "}
          <strong>{deleteConfirm?.username}</strong>?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Promote Confirmation Dialog */}
      <Dialog open={!!promoteConfirm} onClose={() => setPromoteConfirm(null)}>
        <DialogTitle>Confirm Promotion</DialogTitle>
        <DialogContent>
          Are you sure you want to promote{" "}
          <strong>{promoteConfirm?.username}</strong> to admin?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPromoteConfirm(null)}>Cancel</Button>
          <Button onClick={confirmPromote} color="success" variant="contained">
            Promote
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UsersList;
