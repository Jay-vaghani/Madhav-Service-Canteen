import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    Box,
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Alert,
    Snackbar,
} from "@mui/material";
import { RestaurantMenuOutlined } from "@mui/icons-material";

const CustomerLogin = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { customerLogin, customerRegister } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            if (phone.length < 10) {
                throw new Error("Please enter a valid 10-digit phone number");
            }

            if (isLogin) {
                await customerLogin(phone);
            } else {
                await customerRegister(name, email, phone);
            }

            // Redirect to Customer POS
            navigate("/");
        } catch (err) {
            setError(err.response?.data?.error || err.message || "Failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError("");
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
            }}
        >
            <Container maxWidth="sm">
                <Paper
                    elevation={12}
                    sx={{
                        p: 5,
                        borderRadius: 4,
                        backdropFilter: "blur(10px)",
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                    }}
                >
                    <Box sx={{ textAlign: "center", mb: 4 }}>
                        <Box
                            sx={{
                                width: 80,
                                height: 80,
                                borderRadius: "50%",
                                backgroundColor: "primary.main",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto",
                                mb: 2,
                                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                            }}
                        >
                            <RestaurantMenuOutlined sx={{ fontSize: 40, color: "white" }} />
                        </Box>
                        <Typography variant="h4" fontWeight="800" gutterBottom>
                            Madhav Canteen
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            {isLogin ? "Welcome back! Login using your mobile." : "Welcome Student! Please enter your details."}
                        </Typography>
                    </Box>

                    <Snackbar
                        open={!!error}
                        autoHideDuration={6000}
                        onClose={() => setError("")}
                        anchorOrigin={{ vertical: "top", horizontal: "center" }}
                    >
                        <Alert
                            onClose={() => setError("")}
                            severity="error"
                            sx={{ width: "100%", borderRadius: "8px", boxShadow: 2 }}
                        >
                            {error}
                        </Alert>
                    </Snackbar>

                    <form onSubmit={handleSubmit}>
                        {!isLogin && (
                            <>
                                <TextField
                                    fullWidth
                                    label="Full Name"
                                    variant="outlined"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    sx={{ mb: 3 }}
                                />

                                <TextField
                                    fullWidth
                                    label="Email Address (Optional)"
                                    variant="outlined"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    type="email"
                                    sx={{ mb: 3 }}
                                />
                            </>
                        )}

                        <TextField
                            fullWidth
                            type="tel"
                            label="Phone Number"
                            variant="outlined"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            required
                            placeholder="10-digit mobile number"
                            inputProps={{ minLength: 10, maxLength: 10 }}
                            sx={{ mb: 4 }}
                        />

                        <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{
                                py: 1.8,
                                fontSize: "1.1rem",
                                fontWeight: "bold",
                                textTransform: "none",
                                borderRadius: "12px",
                                boxShadow: "0 8px 16px rgba(45, 104, 254, 0.2)",
                                "&:hover": {
                                    boxShadow: "0 12px 20px rgba(45, 104, 254, 0.3)",
                                },
                                mb: 2
                            }}
                        >
                            {loading ? "Processing..." : isLogin ? "Login to Canteen" : "Register & Enter"}
                        </Button>

                        <Box sx={{ textAlign: "center", mt: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                                <Button
                                    onClick={toggleMode}
                                    sx={{ textTransform: "none", fontWeight: "bold" }}
                                >
                                    {isLogin ? "Register now" : "Login instead"}
                                </Button>
                            </Typography>
                        </Box>
                    </form>
                </Paper>
            </Container>
        </Box>
    );
};

export default CustomerLogin;
