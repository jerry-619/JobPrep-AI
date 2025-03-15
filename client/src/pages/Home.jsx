import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  Box,
  Typography,
  Container,
  Paper,
  CircularProgress,
  Fade,
  Alert,
  Snackbar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { startInterview } from '../utils/api';

const Home = () => {
  const [role, setRole] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleStartInterview = async () => {
    if (!role.trim()) {
      setError('Please enter a job role');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const data = await startInterview(role.trim(), difficulty, numQuestions);
      if (data && data._id) {
        navigate(`/interview/${data._id}`);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Error starting interview:', err);
      setError(err.response?.data?.message || err.message || 'Failed to start interview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && role.trim()) {
      handleStartInterview();
    }
  };

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          gap: 4
        }}
      >
        <Fade in timeout={1000}>
          <Typography 
            variant="h1" 
            gutterBottom
            sx={{
              fontSize: { xs: '3rem', sm: 'h1.fontSize' }
            }}
          >
            JobPrep AI
          </Typography>
        </Fade>

        <Fade in timeout={1500}>
          <Typography 
            variant="h5" 
            color="text.secondary" 
            gutterBottom
            sx={{
              fontSize: { xs: '1.5rem', sm: 'h5.fontSize' }
            }}
          >
            Your AI-Powered Job Prep Partner
          </Typography>
        </Fade>

        <Fade in timeout={2000}>
          <Paper
            elevation={3}
            sx={{
              p: { xs: 3, sm: 4 },
              width: '100%',
              maxWidth: 500,
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2)',
              backgroundImage: 'none'
            }}
          >
            <TextField
              fullWidth
              label="Enter Job Role (e.g., Software Engineer)"
              variant="outlined"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              error={!!error}
              helperText={error}
            />
            
            <FormControl fullWidth variant="outlined">
              <InputLabel>Difficulty Level</InputLabel>
              <Select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                label="Difficulty Level"
                disabled={loading}
              >
                <MenuItem value="easy">Easy</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="hard">Hard</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Number of Questions"
              variant="outlined"
              type="number"
              value={numQuestions}
              onChange={(e) => setNumQuestions(Math.max(1, parseInt(e.target.value) || 1))}
              disabled={loading}
              inputProps={{ min: 1 }}
            />
            
            <Button
              variant="contained"
              size="large"
              onClick={handleStartInterview}
              disabled={!role.trim() || loading}
              sx={{ height: 56 }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Start Interview'
              )}
            </Button>
          </Paper>
        </Fade>

        <Fade in timeout={2500}>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Made with ❤️ by Fardeen Beigh
          </Typography>
        </Fade>
      </Box>

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
};

export default Home; 