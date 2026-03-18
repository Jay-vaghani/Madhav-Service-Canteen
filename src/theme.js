import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#FF6B00", // Vibrant/premium food orange
      dark: "#E65A00", // Slightly darker for hover
      light: "#FFF0E5", // Super light peach for backgrounds
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#1E293B", // Premium dark slate (near black)
      contrastText: "#FFFFFF",
    },
    success: {
      main: "#10B981", // Fresh green
      contrastText: "#FFFFFF",
    },
    warning: {
      main: "#F59E0B", // Warm yellow/orange
    },
    error: {
      main: "#EF4444", // Crisp red
    },
    background: {
      default: "#F8FAFC", // Ultra clean, soft grayish-white
      paper: "#FFFFFF", // Pure white for floating elements
    },
    text: {
      primary: "#0F172A", // Very dark slate for intense contrast
      secondary: "#64748B", // Soft muted slate for descriptions
    },
    divider: "rgba(0,0,0,0.06)",
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontFamily: '"Inter", sans-serif', fontWeight: 800, letterSpacing: "-0.02em" },
    h2: { fontFamily: '"Inter", sans-serif', fontWeight: 800, letterSpacing: "-0.015em" },
    h3: { fontFamily: '"Inter", sans-serif', fontWeight: 700, letterSpacing: "-0.01em" },
    h4: { fontFamily: '"Inter", sans-serif', fontWeight: 700 },
    h5: { fontFamily: '"Inter", sans-serif', fontWeight: 700 },
    h6: { fontFamily: '"Inter", sans-serif', fontWeight: 600, letterSpacing: "0.01em" },
    subtitle1: { fontWeight: 600, letterSpacing: "0.01em" },
    subtitle2: { fontWeight: 600, letterSpacing: "0.01em" },
    body1: { letterSpacing: "0.01em" },
    body2: { letterSpacing: "0.01em" },
    button: { textTransform: "none", fontWeight: 700, letterSpacing: "0.02em" },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: "50px", // Pill shaped for food apps
          padding: "12px 28px",
          fontWeight: 700,
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: "none",
          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow: "0 6px 16px rgba(255, 107, 0, 0.2)",
          },
          "&:active": {
            transform: "translateY(1px)",
            boxShadow: "0 2px 8px rgba(255, 107, 0, 0.15)",
          },
        },
        containedSecondary: {
          "&:hover": {
            boxShadow: "0 6px 16px rgba(30, 41, 59, 0.2)",
          },
          "&:active": {
            boxShadow: "0 2px 8px rgba(30, 41, 59, 0.15)",
          },
        },
        outlined: {
          borderWidth: "2px",
          "&:hover": {
            borderWidth: "2px",
          },
        },
      },
      defaultProps: {
        disableElevation: true,
        disableRipple: false, // Ripples are good for touch feedback
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 10px 30px rgba(0,0,0,0.03)", // Ultra premium soft shadow
          backgroundImage: "none", // Remove dark mode paper overlays
        },
        elevation0: {
          boxShadow: "none",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          overflow: "hidden",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: "16px", // Smooth rounded inputs
            backgroundColor: "#FFFFFF",
            transition: "all 0.2s ease",
            "& fieldset": { borderColor: "rgba(0,0,0,0.08)" },
            "&:hover fieldset": { borderColor: "rgba(0,0,0,0.15)" },
            "&.Mui-focused fieldset": { 
              borderWidth: "2px",
              borderColor: "#FF6B00",
            },
            "&.Mui-focused": {
              boxShadow: "0 4px 12px rgba(255, 107, 0, 0.08)",
            }
          },
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid rgba(0,0,0,0.04)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          fontWeight: 600,
        },
      },
    },
  },
});

export default theme;
