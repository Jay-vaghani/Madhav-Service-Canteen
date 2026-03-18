import React from 'react';
import { Box, Button } from '@mui/material';
import { LogoutOutlined } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher';

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
        padding: { xs: '0.75rem', md: '1rem 2rem' },
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#ffffff',
        borderBottom: '1px solid rgba(0,0,0,0.04)',
      }}
    >
      {/* Brand */}
      <h1
        style={{
          fontFamily: '"Inter", sans-serif',
          fontSize: 'clamp(1.1rem, 5vw, 1.6rem)',
          fontWeight: 800,
          letterSpacing: '-0.02em',
          margin: 0,
          color: '#0F172A',
        }}
      >
        <span style={{ color: '#FF6B00' }}>Madhav</span> Services
      </h1>

      {/* Right side: lang switcher + logout */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
        <LanguageSwitcher />

        {/* Logout */}
        {user && (
          <Button
            variant="contained"
            size="small"
            color="error"
            onClick={handleLogout}
            sx={{
              borderRadius: '50px',
              textTransform: 'none',
              fontWeight: 800,
              padding: { xs: '6px 12px', sm: '8px 20px' },
              minWidth: { xs: 'auto' },
              boxShadow: '0 4px 14px rgba(239, 68, 68, 0.25)',
              '&:hover': { backgroundColor: '#DC2626', transform: 'translateY(-1px)', boxShadow: '0 6px 20px rgba(239, 68, 68, 0.35)' },
              '&:active': { transform: 'scale(0.96)' },
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <LogoutOutlined sx={{ fontSize: 18, mr: { xs: 0, sm: 0.75 } }} />
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' }, letterSpacing: '0.01em' }}>Logout</Box>
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default Header;
