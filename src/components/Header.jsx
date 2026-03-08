import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { LogoutOutlined } from '@mui/icons-material';
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
        padding: { xs: '1rem 0.75rem', md: '1.5rem 2rem' },
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
            fontSize: 'var(--logo-size, 1.5rem)',
            fontWeight: 800,
            letterSpacing: '-0.5px',
            margin: 0,
            color: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Box component="span" sx={{ fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' } }}>
            <span style={{ color: '#2d68fe' }}>Madhav</span> Services
          </Box>
        </h1>
      </div>

      {user && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
          <Button
            variant="contained"
            size="small"
            color="error"
            onClick={handleLogout}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 800,
              padding: { xs: '6px 8px', sm: '6px 16px' },
              minWidth: { xs: '40px', sm: 'auto' },
              boxShadow: '0 4px 14px rgba(211, 47, 47, 0.2)',
              '&:hover': {
                backgroundColor: '#d32f2f',
                boxShadow: '0 6px 20px rgba(211, 47, 47, 0.4)',
                transform: 'translateY(-1px)'
              },
              '&:active': {
                transform: 'translateY(0)'
              },
              transition: 'all 0.2s ease',
            }}
          >
            <LogoutOutlined sx={{ fontSize: { xs: 20, sm: 20 }, mr: { xs: 0, sm: 1 } }} />
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Logout</Box>
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Header;
