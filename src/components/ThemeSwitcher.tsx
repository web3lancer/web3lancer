import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';

export const ThemeSwitcher: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Tooltip title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}>
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <IconButton 
          onClick={toggleTheme} 
          color="inherit"
          sx={{ 
            color: theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.7)'
          }}
        >
          {theme === 'light' ? <Brightness4 /> : <Brightness7 />}
        </IconButton>
      </motion.div>
    </Tooltip>
  );
};
