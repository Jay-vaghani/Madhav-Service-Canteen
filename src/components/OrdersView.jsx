import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    Box,
    Typography,
    CircularProgress,
    Chip,
    Paper,
    Divider,
    IconButton,
    Snackbar,
    Alert,
    Checkbox,
    FormControlLabel,
} from "@mui/material";
import {
    CheckCircle,
    AccessTime,
    Receipt,
    Refresh,
    Notifications,
} from "@mui/icons-material";
import { orderService } from "../services/orderService";
import { useAuth } from "../context/AuthContext";

/* ═══════════════════════════════════════════════════════════════
   AUDIO UTILITIES — play notification sounds via Web Audio API
   Uses base64 PCM-generated tones (no external files needed)
═══════════════════════════════════════════════════════════════ */
let audioCtx = null;
let audioUnlocked = false;

const getAudioCtx = () => {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
};

// Unlock audio on iOS Safari — must be called from a user gesture
const unlockAudio = () => {
    if (audioUnlocked) return;
    try {
        const ctx = getAudioCtx();
        if (ctx.state === "suspended") ctx.resume();
        // Play a silent buffer to unlock
        const buf = ctx.createBuffer(1, 1, 22050);
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(ctx.destination);
        src.start(0);
        audioUnlocked = true;
    } catch { /* ignore */ }
};

// Play a simple tone (frequency in Hz, duration in ms)
const playTone = (frequency, durationMs, type = "sine") => {
    try {
        const ctx = getAudioCtx();
        if (ctx.state === "suspended") ctx.resume();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(frequency, ctx.currentTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + durationMs / 1000);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + durationMs / 1000);
    } catch { /* ignore */ }
};

// 5-minute warning sound — two quick beeps
const playWarningSound = () => {
    playTone(880, 200); // A5
    setTimeout(() => playTone(880, 200), 300);
};

// Order ready sound — cheerful ascending ding
const playReadySound = () => {
    playTone(523, 150); // C5
    setTimeout(() => playTone(659, 150), 180); // E5
    setTimeout(() => playTone(784, 300), 360); // G5
};

// Safe vibrate
const vibrate = (pattern) => {
    try {
        if (navigator.vibrate) navigator.vibrate(pattern);
    } catch { /* iPhone — silently ignore */ }
};

/* ═══════════════════════════════════════════════════════════════
   COUNTDOWN TIMER — renders MM:SS from paidAt + 30 min
═══════════════════════════════════════════════════════════════ */
const TIMER_MINUTES = 30;

const CountdownTimer = ({ paidAt, orderId, onMinuteWarning, muted }) => {
    const [remaining, setRemaining] = useState(() => calcRemaining(paidAt));
    // Track which whole-minute marks (in seconds) have already fired
    const firedMinutesRef = useRef(new Set());

    function calcRemaining(paidAtStr) {
        if (!paidAtStr) return 0;
        const endTime = new Date(paidAtStr).getTime() + TIMER_MINUTES * 60 * 1000;
        return Math.max(0, Math.floor((endTime - Date.now()) / 1000));
    }

    useEffect(() => {
        const tick = setInterval(() => {
            const r = calcRemaining(paidAt);
            setRemaining(r);

            // Fire at each whole-minute mark within 5 min (300, 240, 180, 120, 60 s)
            if (r > 0 && r <= 300) {
                const minuteMark = Math.ceil(r / 60) * 60; // round up to next whole minute
                if (!firedMinutesRef.current.has(minuteMark)) {
                    firedMinutesRef.current.add(minuteMark);
                    onMinuteWarning(orderId);
                }
            }
        }, 1000);
        return () => clearInterval(tick);
    }, [paidAt, orderId, onMinuteWarning]);

    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    const display = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

    // Color stages
    let color = "#16a34a";
    let bg = "#f0fdf4";
    let border = "#bbf7d0";
    if (remaining <= 300) {
        color = "#dc2626"; bg = "#fef2f2"; border = "#fecaca";
    } else if (remaining <= 600) {
        color = "#d97706"; bg = "#fffbeb"; border = "#fde68a";
    }

    if (remaining <= 0) {
        return (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <AccessTime sx={{ fontSize: 14, color: "#94a3b8" }} />
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#94a3b8", fontFamily: "monospace" }}>
                    Time's up
                </Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                px: 1.25,
                py: 0.4,
                borderRadius: "10px",
                backgroundColor: bg,
                border: `1px solid ${border}`,
                animation: remaining <= 60 && !muted ? "pulse 1s ease-in-out infinite" : "none",
                "@keyframes pulse": {
                    "0%, 100%": { opacity: 1 },
                    "50%": { opacity: 0.5 },
                },
            }}
        >
            {muted && <span style={{ fontSize: 12 }}>🔇</span>}
            {!muted && <AccessTime sx={{ fontSize: 14, color }} />}
            <Typography
                sx={{
                    fontSize: "0.85rem",
                    fontWeight: 800,
                    fontFamily: "monospace",
                    color: muted ? "#94a3b8" : color,
                    letterSpacing: 1,
                }}
            >
                {display}
            </Typography>
        </Box>
    );
};

/* ═══════════════════════════════════════════════════════════════
   ORDERS VIEW — Customer order history
═══════════════════════════════════════════════════════════════ */
const OrdersView = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [readySnackbar, setReadySnackbar] = useState("");
    const { user } = useAuth();

    // Track previous delivery statuses for transition detection
    const prevStatusesRef = useRef({});
    const initialLoadRef = useRef(true);

    const [dontShowTimingWarning, setDontShowTimingWarning] = useState(() => localStorage.getItem('hideTimingWarning') === 'true');

    const handleWarningChange = (e) => {
        setDontShowTimingWarning(e.target.checked);
        localStorage.setItem('hideTimingWarning', e.target.checked);
    };

    // iOS audio unlock — attach once
    useEffect(() => {
        const handler = () => unlockAudio();
        document.addEventListener("touchstart", handler, { once: true, passive: true });
        document.addEventListener("click", handler, { once: true });
        return () => {
            document.removeEventListener("touchstart", handler);
            document.removeEventListener("click", handler);
        };
    }, []);

    useEffect(() => {
        fetchOrders(true);
    }, []);

    // Smart Polling: Only poll if there's an active order
    useEffect(() => {
        const hasActiveOrder = orders.some(o => o.deliveryStatus !== "DELIVERED");
        if (hasActiveOrder) {
            const timer = setTimeout(() => fetchOrders(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [orders]);

    const fetchOrders = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const data = await orderService.getCustomerOrders();

            // Detect PENDING → DELIVERED transitions (skip on first load)
            if (!initialLoadRef.current) {
                for (const order of data) {
                    const prevStatus = prevStatusesRef.current[order._id];
                    if (prevStatus === "PENDING" && order.deliveryStatus === "DELIVERED") {
                        // Order just became ready!
                        playReadySound();
                        vibrate([300, 100, 300, 100, 300]);
                        const suffix = order.orderId?.includes("-")
                            ? order.orderId.substring(order.orderId.lastIndexOf("-") + 1)
                            : order.orderId;
                        setReadySnackbar(`🎉 Order #${suffix} has been delivered!`);
                    }
                }
            }
            initialLoadRef.current = false;

            // Update status tracking
            const newStatuses = {};
            for (const o of data) newStatuses[o._id] = o.deliveryStatus;
            prevStatusesRef.current = newStatuses;

            setOrders(data);
        } catch (err) {
            console.error("Failed to fetch orders:", err);
            if (showLoading) setError("Failed to load order history");
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    // Per-order mute set — each entry is an order _id that has been silenced
    const [mutedOrders, setMutedOrders] = useState(new Set());

    const muteOrder = useCallback((orderId) => {
        setMutedOrders(prev => new Set([...prev, orderId]));
    }, []);

    // Called by CountdownTimer at every whole-minute mark within 5 min
    const handleMinuteWarning = useCallback((orderId) => {
        // Check muted set at call time via a ref so we don't stale-close over state
        setMutedOrders(prev => {
            if (!prev.has(orderId)) {
                playWarningSound();
                vibrate([200, 100, 200]);
            }
            return prev; // no state change, just reading
        });
    }, []);

    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    return (
        <Box sx={{ height: "100%", overflow: "hidden", display: "flex", flexDirection: "column", backgroundColor: "#f8f9fa" }}>
            {/* Header */}
            <Box
                sx={{
                    px: 2,
                    py: 2,
                    backgroundColor: "#ffffff",
                    borderBottom: "1px solid rgba(0,0,0,0.06)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <Box>
                    <Typography
                        fontFamily='"Inter", sans-serif'
                        fontWeight={800}
                        fontSize="1.25rem"
                        color="#0f172a"
                    >
                        My Orders
                    </Typography>
                    <Typography fontSize="0.8rem" color="#94a3b8" fontFamily='"Inter", sans-serif'>
                        Hi, {user?.name || "Customer"}
                    </Typography>
                </Box>
                <IconButton size="small" onClick={() => fetchOrders(true)} disabled={loading}>
                    <Refresh sx={{ fontSize: 20, color: "#64748b" }} />
                </IconButton>
            </Box>

            {/* Content */}
            <Box sx={{ flex: 1, overflowY: "auto", px: 2, py: 2, pb: "80px" }}>
                {/* ═══ COLLECTION TIMING WARNING ═══ */}
                {!dontShowTimingWarning && (
                    <Box sx={{ mb: 2 }}>
                        <Box sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.75,
                            backgroundColor: "#0ea5e9", // Sky blue for info/timer context
                            color: "#fff",
                            px: 1.5,
                            py: 0.75,
                            borderRadius: "12px 12px 0 0",
                        }}>
                            <span style={{ fontSize: "1rem" }}>🕐</span>
                            <Typography fontFamily='"Inter", sans-serif' fontWeight={800} fontSize="0.75rem" letterSpacing={0.5}>
                                COLLECTION TIMING
                            </Typography>
                        </Box>
                        <Box sx={{
                            backgroundColor: "#f0f9ff",
                            border: "1px solid #0ea5e9",
                            borderTop: "none",
                            borderRadius: "0 0 12px 12px",
                            p: 1.5,
                        }}>
                            <Typography fontFamily='"Inter", sans-serif' fontSize="0.8rem" color="#0369a1" lineHeight={1.5} mb={1}>
                                If you miss the 30-minute pickup timer, you can still collect your order <b>same day before 5:30 PM</b>. The canteen operates from 7:30 AM to 5:30 PM.
                            </Typography>
                            {/* Checkbox to not show this warning again */}
                            {/* <FormControlLabel
                                control={
                                    <Checkbox
                                        size="small"
                                        checked={dontShowTimingWarning}
                                        onChange={handleWarningChange}
                                        sx={{ color: '#0ea5e9', '&.Mui-checked': { color: '#0ea5e9' }, p: 0.5 }}
                                    />
                                }
                                label={<Typography fontSize="0.75rem" color="#0369a1" fontFamily='"Inter", sans-serif' fontWeight={600}>Don't show this again</Typography>}
                                sx={{ m: 0 }}
                            /> */}
                        </Box>
                    </Box>
                )}

                {loading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60%" }}>
                        <CircularProgress size={48} sx={{ color: "primary.main" }} />
                    </Box>
                ) : orders.length === 0 ? (
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60%", gap: 1 }}>
                        <Receipt sx={{ fontSize: 64, color: "#cbd5e1" }} />
                        <Typography fontFamily='"Inter", sans-serif' fontWeight={600} color="#64748b">
                            No orders yet
                        </Typography>
                        <Typography fontSize="0.8rem" fontFamily='"Inter", sans-serif' color="#94a3b8" textAlign="center">
                            Your order history will appear here after your first purchase.
                        </Typography>
                    </Box>
                ) : (
                    orders.map((order) => {
                        const isDelivered = order.deliveryStatus === "DELIVERED";
                        return (
                            <Paper
                                key={order._id}
                                elevation={0}
                                sx={{
                                    mb: 2,
                                    borderRadius: "16px",
                                    border: `1px solid ${isDelivered ? "rgba(34,197,94,0.2)" : "rgba(245,158,11,0.25)"}`,
                                    overflow: "hidden",
                                    transition: "all 0.2s ease",
                                    "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.06)" },
                                }}
                            >
                                {/* Order Header */}
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        padding: "1rem 1.25rem",
                                        backgroundColor: isDelivered ? "#f0fdf4" : "#fffbeb",
                                    }}
                                >
                                    <Box>
                                        <Typography
                                            variant="body2"
                                            sx={{ fontWeight: 700, fontFamily: "monospace", fontSize: "0.9rem", color: "#0f172a" }}
                                        >
                                            #{order.orderId}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: "#64748b" }}>
                                            {formatDate(order.createdAt)}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.75 }}>
                                        <Chip
                                            icon={
                                                isDelivered
                                                    ? <CheckCircle sx={{ fontSize: 16 }} />
                                                    : <AccessTime sx={{ fontSize: 16 }} />
                                            }
                                            label={isDelivered ? "Delivered" : "Preparing"}
                                            size="small"
                                            color={isDelivered ? "success" : "warning"}
                                            sx={{ fontWeight: 700, fontSize: "0.75rem" }}
                                        />
                                        {/* Countdown timer — only for pending orders */}
                                        {!isDelivered && order.paidAt && (
                                            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.5 }}>
                                                <CountdownTimer
                                                    paidAt={order.paidAt}
                                                    orderId={order._id}
                                                    onMinuteWarning={handleMinuteWarning}
                                                    muted={mutedOrders.has(order._id)}
                                                />
                                                {/* Show "Stop alerts" button only in warning zone & not yet muted */}
                                                {(() => {
                                                    const remaining = Math.max(0, Math.floor(
                                                        (new Date(order.paidAt).getTime() + 30 * 60 * 1000 - Date.now()) / 1000
                                                    ));
                                                    return remaining > 0 && remaining <= 300 && !mutedOrders.has(order._id);
                                                })() && (
                                                        <Box
                                                            component="button"
                                                            onClick={() => muteOrder(order._id)}
                                                            sx={{
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: 0.5,
                                                                px: 1,
                                                                py: 0.3,
                                                                borderRadius: "8px",
                                                                border: "1px solid #fca5a5",
                                                                backgroundColor: "#fff",
                                                                color: "#dc2626",
                                                                fontSize: "0.7rem",
                                                                fontWeight: 700,
                                                                fontFamily: '"Inter", sans-serif',
                                                                cursor: "pointer",
                                                                "&:hover": { backgroundColor: "#fef2f2" },
                                                            }}
                                                        >
                                                            🔇 Stop alerts
                                                        </Box>
                                                    )}
                                            </Box>
                                        )}
                                    </Box>
                                </Box>

                                {/* Items */}
                                <Box sx={{ padding: "0.75rem 1.25rem" }}>
                                    {order.items.map((item, idx) => (
                                        <Box
                                            key={idx}
                                            sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 0.5 }}
                                        >
                                            <Typography variant="body2" sx={{ color: "#374151", fontWeight: 500 }}>
                                                {item.name}{" "}
                                                <span style={{ color: "#94a3b8" }}>×{item.quantity}</span>
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 500 }}>
                                                ₹{(item.price * item.quantity).toFixed(2)}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>

                                <Divider />

                                {/* Footer */}
                                <Box
                                    sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 1.25rem" }}
                                >
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: "#0f172a" }}>Total</Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 800, color: "primary.main" }}>
                                        ₹{order.totalAmount.toFixed(0)}
                                    </Typography>
                                </Box>

                                {/* Ready for collection info */}
                                {isDelivered && order.deliveredAt && (
                                    <Box sx={{
                                        padding: "0.5rem 1.25rem 0.75rem",
                                        backgroundColor: "#f0fdf4",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 0.75,
                                    }}>
                                        <Notifications sx={{ fontSize: 14, color: "#16a34a" }} />
                                        <Typography variant="caption" sx={{ color: "#15803d", fontWeight: 600 }}>
                                            Delivered at {formatTime(order.deliveredAt)}
                                        </Typography>
                                    </Box>
                                )}
                            </Paper>
                        );
                    })
                )}
            </Box>

            {/* Order ready snackbar */}
            <Snackbar
                open={!!readySnackbar}
                autoHideDuration={8000}
                onClose={() => setReadySnackbar("")}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert
                    onClose={() => setReadySnackbar("")}
                    severity="success"
                    variant="filled"
                    sx={{
                        width: "100%",
                        borderRadius: "12px",
                        fontWeight: 700,
                        fontSize: "0.9rem",
                        boxShadow: "0 8px 32px rgba(22,163,74,0.3)",
                    }}
                >
                    {readySnackbar}
                </Alert>
            </Snackbar>

            {/* Error snackbar */}
            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={() => setError("")}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert onClose={() => setError("")} severity="error" sx={{ width: "100%", borderRadius: "8px" }}>
                    {error}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default OrdersView;
