import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { LogoutOutlined, ReceiptLong } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/customer-login');
  };
  return (
    <Box
      component="header"
      sx={{
        padding: { xs: '1.25rem 1rem', md: '1.5rem 2rem' },
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#ffffff',
        borderBottom: '1px solid rgba(0, 0, 0, 0.04)',
      }}
    >
      <div className="brand">
        <h1
          style={{
            fontFamily: '"Inter", sans-serif',
            fontSize: '1.5rem',
            fontWeight: 800,
            letterSpacing: '-0.5px',
            margin: 0,
            color: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ color: '#2d68fe' }}>Madhav</span> Services
        </h1>
      </div>

      {user && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ReceiptLong />}
            onClick={() => navigate('/my-orders')}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 700,
              padding: '6px 16px',
              borderColor: '#2d68fe',
              color: '#2d68fe',
              '&:hover': {
                backgroundColor: 'rgba(45, 104, 254, 0.06)',
                borderColor: '#2d68fe',
              },
              transition: 'all 0.2s ease',
            }}
          >
            My Orders
          </Button>

          <Button
            variant="contained"
            size="small"
            color="error"
            startIcon={<LogoutOutlined />}
            onClick={handleLogout}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 800,
              padding: '6px 16px',
              boxShadow: '0 4px 14px rgba(211, 47, 47, 0.4)',
              '&:hover': {
                backgroundColor: '#d32f2f',
                boxShadow: '0 6px 20px rgba(211, 47, 47, 0.6)',
                transform: 'translateY(-1px)'
              },
              '&:active': {
                transform: 'translateY(0)'
              },
              transition: 'all 0.2s ease',
            }}
          >
            Logout
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Header;
