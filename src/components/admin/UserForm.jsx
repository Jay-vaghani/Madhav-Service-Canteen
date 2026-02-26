import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
} from "@mui/material";

const UserForm = ({ open, onClose, onSubmit, user = null }) => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      username: user?.username || "",
      password: "",
    },
  });

  const handleFormSubmit = async (data) => {
    setLoading(true);
    setError("");

    try {
      // Only send password if it's been entered
      const formData = { username: data.username };
      if (data.password) {
        formData.password = data.password;
      } else if (!user) {
        setError("Password is required for new users");
        setLoading(false);
        return;
      }

      await onSubmit(formData);
      reset();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save user");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setError("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{user ? "Edit User" : "Create Order Manager"}</DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Controller
            name="username"
            control={control}
            rules={{ required: "Username is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Username"
                error={!!errors.username}
                helperText={errors.username?.message}
                sx={{ mb: 2 }}
                autoFocus
              />
            )}
          />

          <Controller
            name="password"
            control={control}
            rules={
              user
                ? {} // Password optional for edit
                : { required: "Password is required" }
            }
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label={
                  user
                    ? "New Password (leave blank to keep current)"
                    : "Password"
                }
                type="password"
                error={!!errors.password}
                helperText={errors.password?.message}
              />
            )}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UserForm;
