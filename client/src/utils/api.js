import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('Adding token to request');
      config.headers['x-auth-token'] = token;
    } else {
      console.log('No token found in localStorage');
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      statusText: response.statusText
    });
    return response;
  },
  (error) => {
    console.error('API Error Response:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });

    if (error.response?.status === 401) {
      console.log('Unauthorized access - clearing auth data');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const login = async (credentials) => {
  try {
    console.log('Attempting login for:', credentials.email);
    const response = await api.post('/auth/login', credentials);
    console.log('Login successful');
    return response;
  } catch (error) {
    console.error('Login failed:', error.response?.data?.message || error.message);
    throw error;
  }
};

export const register = async (userData) => {
  try {
    console.log('Attempting registration for:', userData.email);
    const response = await api.post('/auth/register', userData);
    console.log('Registration successful');
    return response;
  } catch (error) {
    console.error('Registration failed:', error.response?.data?.message || error.message);
    throw error;
  }
};

export const getUser = async () => {
  try {
    const response = await api.get('/auth/user');
    return response;
  } catch (error) {
    console.error('Get user error:', error);
    throw error;
  }
};

// Interview endpoints
export const getInterviews = async () => {
  try {
    console.log('Fetching all interviews');
    const response = await api.get('/interviews');
    return response.data;
  } catch (error) {
    console.error('Get interviews error:', error);
    throw error;
  }
};

export const startInterview = async (role, difficulty = 'medium', numQuestions = 2) => {
  try {
    console.log('Starting interview for role:', role, 'with difficulty:', difficulty, 'and', numQuestions, 'questions');
    const response = await api.post('/interviews/generate', { role, difficulty, numQuestions });
    return response.data;
  } catch (error) {
    console.error('Start interview error:', error);
    throw error;
  }
};

export const submitAnswer = async (interviewId, questionIndex, answer) => {
  try {
    const response = await api.post(`/interviews/${interviewId}/answers`, { 
      questionIndex,
      answer 
    });
    return response.data;
  } catch (error) {
    console.error('Submit answer error:', error);
    throw error;
  }
};

export const getInterview = async (interviewId) => {
  try {
    const response = await api.get(`/interviews/${interviewId}`);
    return response.data;
  } catch (error) {
    console.error('Get interview error:', error);
    throw error;
  }
};

export const getReport = async (interviewId) => {
  try {
    const response = await api.get(`/interviews/${interviewId}/report`);
    return response.data;
  } catch (error) {
    console.error('Get report error:', error);
    throw error;
  }
};

export { api }; 