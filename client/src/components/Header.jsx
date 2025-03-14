import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton
} from '@mui/material';
import {
  Home as HomeIcon,
  Dashboard as DashboardIcon,
  ExitToApp as LogoutIcon,
  Login as LoginIcon
} from '@mui/icons-material';

const Header = () => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth');
  };

  return (
    <AppBar position="static" sx={{ mb: 4 }}>
      <Container maxWidth="lg">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" component={Link} to="/" sx={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
              <IconButton color="inherit" size="large">
                <HomeIcon />
              </IconButton>
              JobPrep AI
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            {isAuthenticated ? (
              <>
                <Button
                  color="inherit"
                  component={Link}
                  to="/dashboard"
                  startIcon={<DashboardIcon />}
                >
                  Dashboard
                </Button>
                <Button
                  color="inherit"
                  onClick={handleLogout}
                  startIcon={<LogoutIcon />}
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button
                color="inherit"
                component={Link}
                to="/auth"
                startIcon={<LoginIcon />}
              >
                Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header; 