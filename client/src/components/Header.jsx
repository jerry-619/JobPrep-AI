import React, { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem,
  Avatar
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  ExitToApp as LogoutIcon,
  Login as LoginIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Menu as MenuIcon
} from '@mui/icons-material';
import { ColorModeContext } from '../App';

const Header = () => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');
  const colorMode = useContext(ColorModeContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth');
    handleMenuClose();
  };

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        top: 0,
        mb: { xs: 2, sm: 3, md: 4 },
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
      elevation={0}
    >
      <Container maxWidth="lg">
        <Toolbar sx={{ justifyContent: 'space-between', py: { xs: 1, md: 0 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography 
              variant="h6" 
              component={Link} 
              to="/" 
              sx={{ 
                textDecoration: 'none', 
                color: 'inherit', 
                display: 'flex', 
                alignItems: 'center',
                fontSize: { sm: '1.25rem' }
              }}
            >
              <Avatar 
                src="/logo.png" 
                alt="JobPrep AI Logo" 
                sx={{ 
                  width: isMobile ? 60 : 50, 
                  height: isMobile ? 60 : 50,
                  mr: 1.5,
                  bgcolor: 'transparent'
                }}
              />
              {!isMobile && "JobPrep AI"}
            </Typography>
          </Box>

          {isMobile ? (
            // Mobile view - hamburger menu
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Tooltip title={colorMode.mode === 'dark' ? 'Light Mode' : 'Dark Mode'}>
                <IconButton 
                  color="inherit" 
                  onClick={colorMode.toggleColorMode}
                  sx={{ mr: 1 }}
                >
                  {colorMode.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>
              </Tooltip>
              
              {isAuthenticated && (
                <>
                  <IconButton
                    color="inherit"
                    onClick={handleMenuClick}
                    aria-controls={open ? 'basic-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                  >
                    <MenuIcon />
                  </IconButton>
                  <Menu
                    id="basic-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleMenuClose}
                    MenuListProps={{
                      'aria-labelledby': 'basic-button',
                    }}
                    PaperProps={{
                      sx: {
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                      }
                    }}
                  >
                    <MenuItem 
                      onClick={() => {
                        navigate('/dashboard');
                        handleMenuClose();
                      }}
                      sx={{ 
                        color: '#000000',
                        '& .MuiSvgIcon-root': {
                          color: '#000000'
                        }
                      }}
                    >
                      <DashboardIcon fontSize="small" sx={{ mr: 1 }} />
                      Dashboard
                    </MenuItem>
                    <MenuItem 
                      onClick={handleLogout}
                      sx={{ 
                        color: '#000000',
                        '& .MuiSvgIcon-root': {
                          color: '#000000'
                        }
                      }}
                    >
                      <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                      Logout
                    </MenuItem>
                  </Menu>
                </>
              )}
              
              {!isAuthenticated && (
                <Button
                  color="inherit"
                  component={Link}
                  to="/auth"
                  startIcon={<LoginIcon />}
                  size="small"
                >
                  Login
                </Button>
              )}
            </Box>
          ) : (
            // Desktop view - regular buttons
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Tooltip title={colorMode.mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
                <IconButton 
                  color="inherit" 
                  onClick={colorMode.toggleColorMode}
                  sx={{ mr: 1 }}
                >
                  {colorMode.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>
              </Tooltip>
              
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
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header; 