const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Interview = require('../models/Interview');
const { generateInterviewQuestions, generateAnswerFeedback, generateInterviewReport } = require('../utils/openAiUtils');

// Start new interview
router.post('/', [
  auth,
  check('role', 'Job role is required').not().isEmpty()
], async (req, res) => {
  try {
    const interview = new Interview({
      user: req.user.id,
      role: req.body.role,
      questions: generateQuestions(req.body.role) // Implement question generation
    });

    await interview.save();
    res.json(interview);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Generate new interview
router.post('/generate', [
  auth,
  check('role', 'Job role is required').not().isEmpty(),
  check('difficulty', 'Difficulty level is required').isIn(['easy', 'medium', 'hard']),
  check('numQuestions', 'Number of questions must be between 1 and 10').isInt({ min: 1, max: 10 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { role, difficulty, numQuestions } = req.body;
    console.log('Generating interview for role:', role, 'with difficulty:', difficulty, 'and', numQuestions, 'questions');
    console.log('User ID from auth:', req.user.id);

    // Generate questions using Hugging Face
    const questions = await generateInterviewQuestions(role, difficulty, numQuestions);
    console.log('Generated questions:', questions);

    // Create new interview using MongoDB
    const interview = await Interview.create(req.app.locals.db, {
      role,
      difficulty,
      questions: questions.map(q => ({
        text: q.text,
        type: q.type,
        difficulty: q.difficulty
      })),
      userId: req.user.id
    });

    console.log('Interview saved successfully:', interview);
    res.json(interview);
  } catch (err) {
    console.error('Error generating interview:', err);
    res.status(500).json({ 
      message: 'Error generating interview',
      error: err.message
    });
  }
});

// Get interview by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const interview = await Interview.findById(req.app.locals.db, req.params.id);
    
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    if (interview.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(interview);
  } catch (err) {
    console.error('Error fetching interview:', err);
    res.status(500).json({ 
      message: 'Error fetching interview',
      error: err.message 
    });
  }
});

// Submit answer and get feedback
router.post('/:id/answers', auth, async (req, res) => {
  try {
    const { questionIndex, answer } = req.body;
    console.log('Processing answer for question:', questionIndex);

    const interview = await Interview.findById(req.app.locals.db, req.params.id);

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    if (interview.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const question = interview.questions[questionIndex];
    
    // Generate feedback using Hugging Face
    const feedback = await generateAnswerFeedback(interview.role, question.text, answer, interview.difficulty);
    console.log('Generated feedback:', feedback);

    // Update interview with new answer
    interview.answers.push({
      questionIndex,
      answer,
      feedback
    });

    // Update overall score
    const totalScore = interview.answers.reduce((sum, ans) => sum + ans.feedback.score, 0);
    interview.overallScore = totalScore / interview.answers.length;

    if (interview.answers.length === interview.questions.length) {
      interview.status = 'completed';
    }

    // Save updates
    await Interview.updateById(req.app.locals.db, interview._id, {
      answers: interview.answers,
      overallScore: interview.overallScore,
      status: interview.status
    });

    console.log('Answer and feedback saved successfully');
    res.json({ feedback });
  } catch (err) {
    console.error('Error submitting answer:', err);
    res.status(500).json({ 
      message: 'Error submitting answer',
      error: err.message 
    });
  }
});

// Generate and download interview report
router.get('/:id/report', auth, async (req, res) => {
  try {
    const interview = await Interview.findById(req.app.locals.db, req.params.id);

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    if (interview.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Prepare questions and answers for report
    const questionsAndAnswers = interview.answers.map((ans, i) => ({
      question: interview.questions[i].text,
      answer: ans.answer,
      score: ans.feedback.score
    }));

    // Generate report using Hugging Face
    const report = await generateInterviewReport(
      interview.role,
      interview.overallScore,
      questionsAndAnswers,
      interview.difficulty
    );

    console.log('Report generated successfully');
    res.send(report);
  } catch (err) {
    console.error('Error generating report:', err);
    res.status(500).json({ 
      message: 'Error generating report',
      error: err.message 
    });
  }
});

// Get all interviews for user
router.get('/', auth, async (req, res) => {
  try {
    const interviews = await Interview.findByUserId(req.app.locals.db, req.user.id);
    res.json(interviews);
  } catch (err) {
    console.error('Error fetching interviews:', err);
    res.status(500).json({ 
      message: 'Error fetching interviews',
      error: err.message 
    });
  }
});

module.exports = router; 