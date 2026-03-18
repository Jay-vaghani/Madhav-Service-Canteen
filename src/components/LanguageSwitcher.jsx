import React, { useState } from 'react';
import { Box } from '@mui/material';

const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'gu', label: 'ગુ' },
  { code: 'hi', label: 'हि' },
];

function getCurrentLang() {
  const match = document.cookie.match(/googtrans=\/en\/([a-z]+)/);
  return match ? match[1] : 'en';
}

function switchLanguage(code) {
  const exp = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
  const host = window.location.hostname;
  if (code === 'en') {
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${host}`;
  } else {
    document.cookie = `googtrans=/en/${code}; expires=${exp}; path=/`;
    document.cookie = `googtrans=/en/${code}; expires=${exp}; path=/; domain=${host}`;
  }
  window.location.reload();
}

/**
 * Common Language Switcher component to reuse across customer and admin headers
 * @param {Object} props
 * @param {'light'|'dark'} [props.themeMode='light'] - Determines colors for text/borders
 */
const LanguageSwitcher = ({ themeMode = 'light' }) => {
  const [activeLang] = useState(getCurrentLang);

  const isDark = themeMode === 'dark';
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  const dividerColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  
  const bgInactive = isDark ? 'rgba(255,255,255,0.05)' : '#f8f9fa';
  const textInactive = isDark ? 'rgba(255,255,255,0.6)' : '#64748b';
  
  const hoverBgInactive = isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0';
  const hoverTextInactive = isDark ? '#fff' : '#0f172a';

  return (
    <Box
      sx={{
        display: 'flex',
        borderRadius: '50px',
        border: `1px solid ${borderColor}`,
        overflow: 'hidden',
        height: 'fit-content'
      }}
    >
      {LANGUAGES.map((lang, i) => (
        <Box
          key={lang.code}
          component="button"
          onClick={() => lang.code !== activeLang && switchLanguage(lang.code)}
          sx={{
            px: { xs: '8px', sm: '12px' },
            py: '6px',
            border: 'none',
            borderRight: i < LANGUAGES.length - 1 ? `1px solid ${dividerColor}` : 'none',
            backgroundColor: activeLang === lang.code ? 'primary.main' : bgInactive,
            color: activeLang === lang.code ? '#fff' : textInactive,
            fontSize: { xs: '0.75rem', sm: '0.8rem' },
            fontWeight: 800,
            fontFamily: '"Inter", sans-serif',
            cursor: activeLang === lang.code ? 'default' : 'pointer',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            lineHeight: 1,
            '&:hover': {
              backgroundColor: activeLang === lang.code ? 'primary.main' : hoverBgInactive,
              color: activeLang === lang.code ? '#fff' : hoverTextInactive,
            },
          }}
        >
          {lang.label}
        </Box>
      ))}
    </Box>
  );
};

export default LanguageSwitcher;
