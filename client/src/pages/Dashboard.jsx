import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert
} from '@mui/material';
import {
  Timeline,
  Assessment,
  TrendingUp,
  Grade,
  AccessTime
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell } from 'recharts';
import { getInterviews } from '../utils/api';

const Dashboard = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const data = await getInterviews();
        setInterviews(data);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchInterviews();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  // Calculate statistics
  const totalInterviews = interviews.length;
  const completedInterviews = interviews.filter(i => i.status === 'completed').length;
  const averageScore = interviews.reduce((acc, i) => acc + (i.overallScore || 0), 0) / totalInterviews || 0;
  
  // Prepare data for role distribution chart
  const roleData = interviews.reduce((acc, interview) => {
    acc[interview.role] = (acc[interview.role] || 0) + 1;
    return acc;
  }, {});

  const roleChartData = Object.entries(roleData).map(([name, value]) => ({
    name,
    value
  }));

  // Prepare data for score distribution chart
  const scoreData = interviews
    .filter(i => i.status === 'completed')
    .reduce((acc, interview) => {
      const scoreRange = Math.floor(interview.overallScore);
      acc[scoreRange] = (acc[scoreRange] || 0) + 1;
      return acc;
    }, {});

  const scoreChartData = Array.from({ length: 10 }, (_, i) => ({
    range: `${i + 1}`,
    count: scoreData[i + 1] || 0
  }));

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // Recent interviews
  const recentInterviews = [...interviews]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Statistics Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Timeline color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  Total Interviews
                </Typography>
              </Box>
              <Typography variant="h4" component="div" color="primary">
                {totalInterviews}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Assessment color="secondary" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  Completed
                </Typography>
              </Box>
              <Typography variant="h4" component="div" color="secondary">
                {completedInterviews}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Grade color="success" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  Avg Score
                </Typography>
              </Box>
              <Typography variant="h4" component="div" color="success.main">
                {averageScore.toFixed(1)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <TrendingUp color="info" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  Success Rate
                </Typography>
              </Box>
              <Typography variant="h4" component="div" color="info.main">
                {totalInterviews ? ((completedInterviews / totalInterviews) * 100).toFixed(0) : 0}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              JobPrep AI Dashboard
            </Typography>
            <Typography variant="h6" gutterBottom>
              Score Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scoreChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Role Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={roleChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {roleChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Recent Interviews */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Interviews
            </Typography>
            <List>
              {recentInterviews.map((interview, index) => (
                <React.Fragment key={interview._id}>
                  <ListItem>
                    <ListItemText
                      primary={
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle1">
                            {interview.role} Interview
                          </Typography>
                          <Box display="flex" alignItems="center">
                            <AccessTime fontSize="small" sx={{ mr: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                              {new Date(interview.createdAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Box>
                      }
                      secondary={
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" color="text.secondary">
                            Status: {interview.status === 'completed' ? 'Completed' : 'In Progress'}
                          </Typography>
                          {interview.overallScore && (
                            <Typography variant="body2" color="primary">
                              Score: {interview.overallScore.toFixed(1)}/10
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < recentInterviews.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 