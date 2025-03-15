import React, { useState, createContext, useMemo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Interview from './pages/Interview';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Header from './components/Header';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';

// Create a theme context
export const ColorModeContext = createContext({ 
  toggleColorMode: () => {},
  mode: 'light'
});

function App() {
  const [mode, setMode] = useState('dark');

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
      mode,
    }),
    [mode],
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'light' 
            ? {
                // Light mode
                primary: {
                  main: '#ffafcc', // Soft pink
                  light: '#ffc8dd', // Lighter pink
                },
                secondary: {
                  main: '#a2d2ff', // Soft blue
                  light: '#bde0fe', // Lighter blue
                },
                background: {
                  default: 'rgba(253, 245, 255, 0.9)', // Translucent light purple background
                  paper: 'transparent', // Translucent paper background
                },
                text: {
                  primary: '#5e5e5e', // Softer text color
                  secondary: '#8e8e8e', // Even softer text color
                },
                error: {
                  main: '#ffb3c1', // Pastel red
                },
                warning: {
                  main: '#ffd6a5', // Pastel orange
                },
                info: {
                  main: '#a0c4ff', // Pastel blue
                },
                success: {
                  main: '#caffbf', // Pastel green
                },
              }
            : {
                // Dark mode
                primary: {
                  main: '#ff8fab', // Darker pink
                  light: '#ffb3c6', // Lighter pink
                },
                secondary: {
                  main: '#7fb8ff', // Darker blue
                  light: '#a6d0ff', // Lighter blue
                },
                background: {
                  default: 'rgba(30, 30, 40, 0.9)', // Translucent dark background
                  paper: 'transparent', // Translucent paper background
                },
                text: {
                  primary: '#e0e0e0', // Light text color
                  secondary: '#b0b0b0', // Softer light text color
                },
                error: {
                  main: '#ff8a9e', // Dark mode pastel red
                },
                warning: {
                  main: '#ffc285', // Dark mode pastel orange
                },
                info: {
                  main: '#8ab5ff', // Dark mode pastel blue
                },
                success: {
                  main: '#a6f0a6', // Dark mode pastel green
                },
              }),
        },
        typography: {
          fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
          fontSize: 14,
          fontWeightLight: 300,
          fontWeightRegular: 400,
          fontWeightMedium: 500,
          fontWeightBold: 700,
        },
        shape: {
          borderRadius: 12,
        },
        components: {
          MuiPaper: {
            styleOverrides: {
              root: {
                backdropFilter: 'blur(10px)',
                backgroundImage: 'none',
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                borderRadius: 8,
              },
            },
          },
        },
      }),
    [mode],
  );

  const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/auth" />;
  };

  // Background patterns based on theme mode
  const backgroundStyle = {
    light: {
      background: `
        radial-gradient(circle at 10% 20%, rgba(255, 200, 221, 0.4) 0%, rgba(255, 175, 204, 0.2) 20%),
        radial-gradient(circle at 90% 60%, rgba(162, 210, 255, 0.4) 0%, rgba(189, 224, 254, 0.2) 25%),
        radial-gradient(circle at 50% 50%, rgba(202, 255, 191, 0.2) 0%, rgba(253, 245, 255, 0.9) 90%)
      `,
      backgroundSize: 'cover',
      backgroundAttachment: 'fixed',
    },
    dark: {
      background: `
        radial-gradient(circle at 10% 20%, rgba(255, 143, 171, 0.3) 0%, rgba(255, 143, 171, 0.1) 20%),
        radial-gradient(circle at 90% 60%, rgba(127, 184, 255, 0.3) 0%, rgba(166, 208, 255, 0.1) 25%),
        radial-gradient(circle at 50% 50%, rgba(40, 40, 50, 0.2) 0%, rgba(30, 30, 40, 0.9) 90%)
      `,
      backgroundSize: 'cover',
      backgroundAttachment: 'fixed',
    }
  };

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          ...backgroundStyle[mode],
          transition: 'background 0.5s ease-in-out',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: mode === 'light' 
              ? 'url("data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z" fill="%23ffafcc" fill-opacity="0.1" fill-rule="evenodd"/%3E%3C/svg%3E")'
              : 'url("data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z" fill="%237fb8ff" fill-opacity="0.1" fill-rule="evenodd"/%3E%3C/svg%3E")',
            backgroundSize: '100px 100px',
            opacity: 0.5,
            zIndex: -1,
          }
        }}>
          <Header />
          <Box component="main" sx={{ flex: 1 }}>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Home />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/interview/:id"
                element={
                  <PrivateRoute>
                    <Interview />
                  </PrivateRoute>
                }
              />
            </Routes>
          </Box>
        </Box>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App; 