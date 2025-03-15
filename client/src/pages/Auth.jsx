import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Tab,
  Tabs,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import { api } from '../utils/api';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index} style={{ marginTop: '20px' }}>
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

export default function Auth() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear error when user types
  };

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
    setError('');
    setFormData({ name: '', email: '', password: '' }); // Clear form on tab change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let response;
      if (tab === 0) { // Login
        response = await api.post('/auth/login', {
          email: formData.email,
          password: formData.password
        });
      } else { // Register
        if (!formData.name || !formData.email || !formData.password) {
          throw new Error('Please fill in all fields');
        }
        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters long');
        }
        response = await api.post('/auth/register', formData);
      }

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/');
      } else {
        throw new Error('No token received from server');
      }
    } catch (err) {
      console.error('Auth error:', err);
      if (err.response?.data?.msg) {
        setError(err.response.data.msg);
      } else if (err.response?.data?.errors) {
        setError(err.response.data.errors.map(e => e.msg).join(', '));
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography component="h1" variant="h5" align="center" gutterBottom>
          Welcome to JobPrep AI
        </Typography>

        <Tabs value={tab} onChange={handleTabChange} centered>
          <Tab label="Login" />
          <Tab label="Register" />
        </Tabs>

        <form onSubmit={handleSubmit}>
          <TabPanel value={tab} index={0}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              error={!!error}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              error={!!error}
            />
          </TabPanel>

          <TabPanel value={tab} index={1}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Full Name"
              name="name"
              autoComplete="name"
              autoFocus
              value={formData.name}
              onChange={handleChange}
              error={!!error}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              error={!!error}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              error={!!error}
              helperText="Password must be at least 6 characters long"
            />
          </TabPanel>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : (tab === 0 ? 'Sign In' : 'Sign Up')}
          </Button>
        </form>
      </Paper>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setError('')} variant="filled">
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
} 