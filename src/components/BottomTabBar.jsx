import React from "react";
import { Box, Badge, useMediaQuery } from "@mui/material";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { useCart } from "../context/CartContext";

const tabConfig = [
    { id: "menu", label: "Menu", icon: RestaurantMenuIcon },
    { id: "cart", label: "Cart", icon: ShoppingCartIcon },
    { id: "orders", label: "Orders", icon: ReceiptLongIcon },
];

const BottomTabBar = ({ activeTab, onTabChange }) => {
    const isMobile = useMediaQuery("(max-width:900px)");
    const { cart } = useCart();
    const cartCount = Object.values(cart).reduce((sum, item) => sum + item.qty, 0);

    /* ── MOBILE: iOS-style bottom bar ── */
    if (isMobile) {
        return (
            <Box
                sx={{
                    position: "fixed",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 64,
                    zIndex: 1200,
                    backgroundColor: "rgba(255,255,255,0.92)",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    borderTop: "1px solid rgba(0,0,0,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-around",
                    px: 1,
                }}
            >
                {tabConfig.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <Box
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "3px",
                                flex: 1,
                                py: 0.5,
                                cursor: "pointer",
                                borderRadius: "12px",
                                transition: "all 0.18s ease",
                                "&:active": { opacity: 0.7 },
                            }}
                        >
                            <Badge
                                badgeContent={tab.id === "cart" ? cartCount : 0}
                                color="error"
                                sx={{
                                    "& .MuiBadge-badge": {
                                        fontSize: "0.65rem",
                                        minWidth: 16,
                                        height: 16,
                                        padding: "0 4px",
                                    },
                                }}
                            >
                                <Icon
                                    sx={{
                                        fontSize: 24,
                                        color: isActive ? "#2d68fe" : "#94a3b8",
                                        transition: "color 0.18s ease",
                                    }}
                                />
                            </Badge>
                            <Box
                                component="span"
                                sx={{
                                    fontSize: "0.65rem",
                                    fontWeight: isActive ? 700 : 500,
                                    fontFamily: '"Inter", sans-serif',
                                    color: isActive ? "#2d68fe" : "#94a3b8",
                                    transition: "all 0.18s ease",
                                    letterSpacing: "0.2px",
                                }}
                            >
                                {tab.label}
                            </Box>
                        </Box>
                    );
                })}
            </Box>
        );
    }

    /* ── DESKTOP: Vertical left rail ── */
    return (
        <Box
            sx={{
                width: 72,
                height: "100%",
                backgroundColor: "#ffffff",
                borderRight: "1px solid rgba(0,0,0,0.06)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                pt: 2,
                gap: 0.5,
                flexShrink: 0,
            }}
        >
            {tabConfig.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                    <Box
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "4px",
                            width: 56,
                            py: 1,
                            cursor: "pointer",
                            borderRadius: "14px",
                            backgroundColor: isActive ? "rgba(45, 104, 254, 0.08)" : "transparent",
                            transition: "all 0.18s ease",
                            "&:hover": {
                                backgroundColor: isActive
                                    ? "rgba(45, 104, 254, 0.12)"
                                    : "rgba(0,0,0,0.04)",
                            },
                        }}
                    >
                        <Badge
                            badgeContent={tab.id === "cart" ? cartCount : 0}
                            color="error"
                            sx={{
                                "& .MuiBadge-badge": {
                                    fontSize: "0.65rem",
                                    minWidth: 16,
                                    height: 16,
                                    padding: "0 4px",
                                },
                            }}
                        >
                            <Icon
                                sx={{
                                    fontSize: 22,
                                    color: isActive ? "#2d68fe" : "#94a3b8",
                                    transition: "color 0.18s ease",
                                }}
                            />
                        </Badge>
                        <Box
                            component="span"
                            sx={{
                                fontSize: "0.6rem",
                                fontWeight: isActive ? 700 : 500,
                                fontFamily: '"Inter", sans-serif',
                                color: isActive ? "#2d68fe" : "#94a3b8",
                                transition: "all 0.18s ease",
                                textAlign: "center",
                                letterSpacing: "0.2px",
                            }}
                        >
                            {tab.label}
                        </Box>
                    </Box>
                );
            })}
        </Box>
    );
};

export default BottomTabBar;
