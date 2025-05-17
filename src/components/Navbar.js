import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Tooltip, Drawer, List, ListItem, ListItemButton, ListItemText, Divider, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useThemeMode } from '../contexts/ThemeContext';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import MenuIcon from '@mui/icons-material/Menu';

const Navbar = () => {
  const { currentUser, logoutUser } = useAuth();
  const navigate = useNavigate();
  const { mode, toggleTheme } = useThemeMode();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const navLinks = currentUser
    ? [
        { label: 'About', to: '/about' },
        { label: 'Dashboard', to: '/dashboard' },
        { label: 'Tasks', to: '/tasks' },
        { label: 'Notes', to: '/notes' },
        { label: 'Logout', action: handleLogout },
      ]
    : [
        { label: 'Login', to: '/login' },
        { label: 'Register', to: '/register' },
      ];

  const handleNav = (to, action) => {
    setDrawerOpen(false);
    if (action) {
      action();
    } else if (to) {
      navigate(to);
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }} onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          Noteflow
        </Typography>
        <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
          <IconButton color="inherit" onClick={toggleTheme} sx={{ mr: 1 }}>
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Tooltip>
        {isMobile ? (
          <>
            <IconButton color="inherit" edge="end" onClick={() => setDrawerOpen(true)}>
              <MenuIcon />
            </IconButton>
            <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
              <Box sx={{ width: 220 }} role="presentation" onClick={() => setDrawerOpen(false)}>
                <List>
                  {navLinks.map((item, idx) => (
                    <ListItem key={item.label} disablePadding>
                      <ListItemButton onClick={() => handleNav(item.to, item.action)}>
                        <ListItemText primary={item.label} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
                <Divider />
              </Box>
            </Drawer>
          </>
        ) : (
          <Box sx={{ display: 'flex', gap: 2 }}>
            {navLinks.map((item) =>
              item.action ? (
                <Button color="inherit" key={item.label} onClick={item.action}>
                  {item.label}
                </Button>
              ) : (
                <Button color="inherit" key={item.label} onClick={() => navigate(item.to)}>
                  {item.label}
                </Button>
              )
            )}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 