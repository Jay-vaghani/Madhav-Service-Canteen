import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#2d68fe", // Bright Blue (similar to Razorpay)
      dark: "#141c2c", // Very dark navy/blue
      light: "#ecf3ff", // Very light blue for backgrounds
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#ffffff", // Pure white
      contrastText: "#141c2c",
    },
    background: {
      default: "#f8f9fa", // Minimalist off-white background
      paper: "#ffffff", // Pure white for cards/paper
    },
    text: {
      primary: "#0f172a", // Dark slate for high contrast readability
      secondary: "#64748b", // Muted slate for secondary text
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontFamily: '"Inter", sans-serif', fontWeight: 800 },
    h2: { fontFamily: '"Inter", sans-serif', fontWeight: 800 },
    h3: { fontFamily: '"Inter", sans-serif', fontWeight: 700 },
    h4: { fontFamily: '"Inter", sans-serif', fontWeight: 700 },
    h5: { fontFamily: '"Inter", sans-serif', fontWeight: 600 },
    h6: { fontFamily: '"Inter", sans-serif', fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 500 },
    button: { textTransform: "none", fontWeight: 600, letterSpacing: "0.5px" },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
          boxShadow: "none",
          padding: "10px 24px",
          "&:hover": {
            boxShadow: "none",
          },
        },
      },
      defaultProps: {
        disableElevation: true,
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

export default theme;
