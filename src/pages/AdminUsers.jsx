import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  AppBar,
  Toolbar,
  Button,
  Fab,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Add, Logout, ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { userService } from "../services/userService";
import UsersList from "../components/admin/UsersList";
import UserForm from "../components/admin/UserForm";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (err) {
      setError("Failed to load users");
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
      if (editingUser) {
        await userService.updateUser(editingUser._id, data);
      } else {
        await userService.createManager(data);
      }
      await fetchUsers();
      setFormOpen(false);
      setEditingUser(null);
    } catch (err) {
      throw err;
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await userService.deleteUser(id);
      await fetchUsers();
    } catch (err) {
      setError("Failed to delete user");
    }
  };

  const handlePromote = async (id) => {
    try {
      await userService.promoteToAdmin(id);
      await fetchUsers();
    } catch (err) {
      setError("Failed to promote user");
    }
  };

  const handleAddNew = () => {
    setEditingUser(null);
    setFormOpen(true);
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f7" }}>
      <AppBar position="static">
        <Toolbar>
          <Button
            color="inherit"
            startIcon={<ArrowBack />}
            onClick={() => navigate("/admin")}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold" }}>
            User Management - {user?.username}
          </Typography>
          <Button color="inherit" startIcon={<Logout />} onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold" }}>
          Users
        </Typography>

        {error && (
          <Alert severity="error" onClose={() => setError("")} sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <UsersList
            users={users}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onPromote={handlePromote}
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

        <UserForm
          open={formOpen}
          onClose={() => {
            setFormOpen(false);
            setEditingUser(null);
          }}
          onSubmit={handleCreateOrUpdate}
          user={editingUser}
        />
      </Container>
    </Box>
  );
};

export default AdminUsers;
