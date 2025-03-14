import React, { Component } from 'react';
import { Alert, Button, Box } from '@mui/material';

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 3 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            Something went wrong: {this.state.error.message}
          </Alert>
          <Button 
            variant="contained" 
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary; 