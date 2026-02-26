import React from 'react';
import { Box } from '@mui/material';

const Header = () => {
  return (
    <Box
      component="header"
      sx={{
        padding: { xs: '1.5rem 1rem', md: '1.5rem 2rem' },
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div className="brand">
        <h1
          style={{
            fontFamily: '"Playfair Display", serif',
            fontSize: '1.8rem',
            fontWeight: 700,
            letterSpacing: '-0.5px',
            margin: 0,
            color: '#1b1b1b',
          }}
        >
          The Canteen.
        </h1>
        <p
          style={{
            fontSize: '0.8rem',
            opacity: 0.6,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            margin: 0,
            color: '#1b1b1b',
          }}
        >
          Student Dining Hall
        </p>
      </div>
    </Box>
  );
};

export default Header;
