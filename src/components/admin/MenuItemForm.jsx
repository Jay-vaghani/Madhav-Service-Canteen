import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  InputAdornment,
  Autocomplete,
  Alert,
  Snackbar,
} from "@mui/material";
import { CurrencyRupeeRounded, Image } from "@mui/icons-material";
import { compressImage } from "../../utils/imageCompression";

const MenuItemForm = ({
  open,
  onClose,
  onSubmit,
  item = null,
  categories = [],
}) => {
  const [imagePreview, setImagePreview] = useState("");
  const [imageError, setImageError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      name: "",
      category: "",
      price: "",
      description: "",
    },
  });

  // Reset form when item changes or dialog opens
  useEffect(() => {
    if (open) {
      if (item) {
        reset({
          name: item.name || "",
          category: item.category || "",
          price: item.price || "",
          description: item.description || "",
        });
        setImagePreview(item.imageUrl || "");
      } else {
        reset({
          name: "",
          category: "",
          price: "",
          description: "",
        });
        setImagePreview("");
      }
      setSelectedFile(null);
      setImageError("");
    }
  }, [open, item, reset]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageError("");

    if (!file.type.startsWith("image/")) {
      setImageError("Please select an image file");
      return;
    }

    try {
      setSelectedFile(file);
      // Show preview immediately
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    } catch (error) {
      setImageError("Failed to process image");
    }
  };

  const handleFormSubmit = async (data) => {
    setLoading(true);
    setImageError("");

    try {
      let formData = {
        name: data.name,
        category: data.category,
        price: parseFloat(data.price),
        description: data.description,
      };

      // Compress and convert image to Base64 if new image is selected
      if (selectedFile) {
        const imageBase64 = await compressImage(selectedFile);
        formData.imageBase64 = imageBase64;
      } else if (!item) {
        setImageError("Please select an image");
        setLoading(false);
        return;
      }

      await onSubmit(formData);
      handleClose();
    } catch (error) {
      setImageError(error.message || "Failed to save menu item");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset({
      name: "",
      category: "",
      price: "",
      description: "",
    });
    setImagePreview("");
    setSelectedFile(null);
    setImageError("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{item ? "Edit Menu Item" : "Create Menu Item"}</DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Snackbar
            open={!!imageError}
            autoHideDuration={6000}
            onClose={() => setImageError("")}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            sx={{ zIndex: (theme) => theme.zIndex.modal + 1 }}
          >
            <Alert
              onClose={() => setImageError("")}
              severity="error"
              sx={{ width: "100%", borderRadius: "8px" }}
            >
              {imageError}
            </Alert>
          </Snackbar>

          <Controller
            name="name"
            control={control}
            rules={{ required: "Name is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Name"
                error={!!errors.name}
                helperText={errors.name?.message}
                sx={{ mb: 2 }}
              />
            )}
          />

          <Controller
            name="category"
            control={control}
            rules={{ required: "Category is required" }}
            render={({ field: { onChange, value } }) => (
              <Autocomplete
                freeSolo
                options={categories}
                value={value}
                onChange={(e, newValue) => onChange(newValue)}
                onInputChange={(e, newValue) => onChange(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Category"
                    error={!!errors.category}
                    helperText={
                      errors.category?.message ||
                      "Select or type a new category"
                    }
                    sx={{ mb: 2 }}
                  />
                )}
              />
            )}
          />

          <Controller
            name="price"
            control={control}
            rules={{
              required: "Price is required",
              min: { value: 0.01, message: "Price must be greater than 0" },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Price"
                type="number"
                inputProps={{ step: "0.01", min: "0" }}
                error={!!errors.price}
                helperText={errors.price?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CurrencyRupeeRounded />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
            )}
          />

          <Controller
            name="description"
            control={control}
            rules={{ required: "Description is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Description"
                multiline
                rows={3}
                error={!!errors.description}
                helperText={errors.description?.message}
                sx={{ mb: 2 }}
              />
            )}
          />

          <Box sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              startIcon={<Image />}
              sx={{ py: 1.5 }}
            >
              {imagePreview ? "Change Image" : "Upload Image"}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageChange}
              />
            </Button>
          </Box>

          {imagePreview && (
            <Box
              component="img"
              src={imagePreview}
              alt="Preview"
              sx={{
                width: "100%",
                height: 200,
                objectFit: "cover",
                borderRadius: 2,
              }}
            />
          )}
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

export default MenuItemForm;
