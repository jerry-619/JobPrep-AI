import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import {
  Button,
  CircularProgress,
  Box,
  Typography,
  Container,
  Paper,
  LinearProgress,
  IconButton,
  Card,
  CardContent,
  Fade,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Mic as MicIcon,
  Stop as StopIcon,
  NavigateNext as NextIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { getInterview, submitAnswer, getReport } from '../utils/api';

const Interview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [scores, setScores] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const {
    transcript,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const data = await getInterview(id);
        setQuestions(data.questions);
        if (data.status === 'completed') {
          setInterviewComplete(true);
          setScores(data.answers.map(a => a.feedback.score));
        }
      } catch (err) {
        console.error('Error fetching interview:', err);
        setError(err.message || 'Failed to load interview');
        if (err.response?.status === 404) {
          navigate('/');
        }
      }
    };
    fetchInterview();
  }, [id, navigate]);

  const startRecording = () => {
    setIsRecording(true);
    resetTranscript();
    SpeechRecognition.startListening({ continuous: true });
  };

  const stopRecording = () => {
    setIsRecording(false);
    SpeechRecognition.stopListening();
  };

  const handleSubmitAnswer = async () => {
    if (!transcript.trim()) return;
    
    setLoading(true);
    setError('');
    try {
      const { feedback: newFeedback } = await submitAnswer(id, currentQuestionIndex, transcript);
      setFeedback(newFeedback);
      
      // Store the answer and feedback
      const newAnswers = [...answers];
      newAnswers[currentQuestionIndex] = transcript;
      setAnswers(newAnswers);

      const newFeedbacks = [...feedbacks];
      newFeedbacks[currentQuestionIndex] = newFeedback;
      setFeedbacks(newFeedbacks);
      
      setScores([...scores, newFeedback.score]);

      if (currentQuestionIndex === questions.length - 1) {
        setInterviewComplete(true);
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
      setError(err.message || 'Failed to submit answer');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setCurrentQuestionIndex(prev => prev + 1);
    setFeedback(null);
    resetTranscript();
  };

  const handleDownloadReport = async () => {
    setIsGeneratingReport(true);
    try {
      const report = await getReport(id);
      // Create a blob from the text content
      const blob = new Blob([report], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'interview-report.txt');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading report:', err);
      setError(err.message || 'Failed to download report');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleRetry = () => {
    navigate('/');
  };

  if (!browserSupportsSpeechRecognition) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          Your browser doesn't support speech recognition. Please use a modern browser like Chrome.
        </Alert>
      </Container>
    );
  }

  if (interviewComplete) {
    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Interview Complete!
          </Typography>
          <Typography variant="h5" color="primary" gutterBottom>
            Overall Score: {averageScore.toFixed(1)}/10
          </Typography>
          <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              startIcon={isGeneratingReport ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
              onClick={handleDownloadReport}
              disabled={isGeneratingReport}
            >
              {isGeneratingReport ? 'Generating Report...' : 'Download Report'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRetry}
              disabled={isGeneratingReport}
            >
              Start New Interview
            </Button>
          </Box>
        </Paper>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            Interview Responses
          </Typography>
          {questions.map((question, index) => (
            <Card key={index} elevation={3} sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Question {index + 1}:
                </Typography>
                <Typography variant="body1" gutterBottom sx={{ mb: 2 }}>
                  {question.text}
                </Typography>
                
                <Typography variant="subtitle1" color="primary" gutterBottom>
                  Your Answer:
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    mb: 2,
                    bgcolor: 'background.default'
                  }}
                >
                  <Typography variant="body1">
                    {answers[index] || "No answer recorded"}
                  </Typography>
                </Paper>

                <Alert
                  severity={scores[index] >= 7 ? 'success' : scores[index] >= 5 ? 'warning' : 'error'}
                  sx={{ mt: 2 }}
                >
                  <Typography variant="subtitle1" gutterBottom>
                    Score: {scores[index]}/10
                  </Typography>
                  <Typography variant="body1">
                    {feedbacks[index]?.text || "No feedback available"}
                  </Typography>
                </Alert>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box sx={{ mb: 4 }}>
        <LinearProgress
          variant="determinate"
          value={(currentQuestionIndex / questions.length) * 100}
          sx={{ height: 10, borderRadius: 5 }}
        />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Question {currentQuestionIndex + 1} of {questions.length}
        </Typography>
      </Box>

      <Card elevation={3}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {questions[currentQuestionIndex]?.text}
          </Typography>

          <Box sx={{ my: 3 }}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                minHeight: 100,
                bgcolor: 'background.default'
              }}
            >
              <Typography>
                {transcript || 'Your answer will appear here...'}
              </Typography>
            </Paper>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            {!isRecording ? (
              <Button
                variant="contained"
                color="primary"
                startIcon={<MicIcon />}
                onClick={startRecording}
                disabled={loading}
              >
                Start Recording
              </Button>
            ) : (
              <Button
                variant="contained"
                color="secondary"
                startIcon={<StopIcon />}
                onClick={stopRecording}
              >
                Stop Recording
              </Button>
            )}
            
            <Button
              variant="contained"
              disabled={!transcript.trim() || loading || isRecording}
              onClick={handleSubmitAnswer}
            >
              {loading ? <CircularProgress size={24} /> : 'Submit Answer'}
            </Button>
          </Box>

          {feedback && (
            <Fade in>
              <Box sx={{ mt: 2 }}>
                <Alert
                  severity={feedback.score >= 7 ? 'success' : feedback.score >= 5 ? 'warning' : 'error'}
                  action={
                    currentQuestionIndex === questions.length - 1 ? null : (
                      <IconButton
                        color="inherit"
                        size="small"
                        onClick={handleNext}
                      >
                        <NextIcon />
                      </IconButton>
                    )
                  }
                >
                  <Typography variant="subtitle1" gutterBottom>
                    Score: {feedback.score}/10
                  </Typography>
                  <Typography variant="body1">
                    {feedback.text}
                  </Typography>
                </Alert>
                {currentQuestionIndex === questions.length - 1 && (
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => setInterviewComplete(true)}
                    >
                      View Overall Score
                    </Button>
                  </Box>
                )}
              </Box>
            </Fade>
          )}
        </CardContent>
      </Card>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Interview; 