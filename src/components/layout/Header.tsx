import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  IconButton, 
  Badge,
  useMediaQuery,
  useTheme as useMuiTheme
} from '@mui/material';
import { 
  NotificationsOutlined,
  MenuOutlined 
} from '@mui/icons-material';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Account } from '../Account';
import { ThemeSwitcher } from '../ThemeSwitcher';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{ 
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(var(--background-color-rgb), 0.7)',
        borderBottom: '1px solid var(--border-color)'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {isMobile && (
          <IconButton 
            edge="start" 
            color="inherit" 
            aria-label="menu"
            onClick={onMenuToggle}
          >
            <MenuOutlined />
          </IconButton>
        )}

        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Web3Lancer
            </motion.div>
          </Typography>
        </Link>

        {!isMobile && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Link href="/dashboard" passHref>
              <Button color="inherit">Dashboard</Button>
            </Link>
            <Link href="/projects" passHref>
              <Button color="inherit">Projects</Button>
            </Link>
            <Link href="/marketplace" passHref>
              <Button color="inherit">Marketplace</Button>
            </Link>
            <Link href="/wallet" passHref>
              <Button color="inherit">Wallet</Button>
            </Link>
          </Box>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Theme Switcher - Added to the left of notifications */}
          <ThemeSwitcher />
          
          {/* Notifications */}
          <IconButton color="inherit">
            <Badge badgeContent={3} color="error">
              <NotificationsOutlined />
            </Badge>
          </IconButton>
          
          {/* Account Menu */}
          <Account />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
