const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL;
const MODEL = process.env.MODEL_NAME;

// Fallback questions for different roles and difficulty levels
const FALLBACK_QUESTIONS = {
  technical: {
    easy: {
      Frontend: "Can you explain what HTML and CSS are and how they work together?",
      Backend: "What is a REST API and how does it work?",
      Fullstack: "Explain the client-server architecture in web development.",
      default: "What programming languages are you most comfortable with and why?"
    },
    medium: {
      Frontend: "Explain the concept of state management in frontend development.",
      Backend: "Describe database normalization and its importance.",
      Fullstack: "Explain how authentication and authorization work in web applications.",
      default: "Explain the concept of version control and why it's important."
    },
    hard: {
      Frontend: "Describe how virtual DOM works and its advantages in modern frontend frameworks.",
      Backend: "Explain microservices architecture and its trade-offs.",
      Fullstack: "Discuss different caching strategies in a full-stack application.",
      default: "Explain the principles of clean code and how you apply them."
    }
  },
  behavioral: {
    easy: {
      default: "Tell me about a project you worked on recently and what you learned from it."
    },
    medium: {
      default: "Describe a challenging situation you faced in a team and how you resolved it."
    },
    hard: {
      default: "Tell me about a time you had to make a difficult technical decision and how you approached it."
    }
  }
};

// Fallback feedback templates
const FALLBACK_FEEDBACK = {
  technical: {
    high: {
      text: "Excellent technical response! You demonstrated strong understanding of the concepts and provided clear explanations with good examples. Your answer shows both theoretical knowledge and practical experience.",
      score: 9
    },
    medium: {
      text: "Good technical answer that covers the basics well. Consider providing more specific examples and diving deeper into the technical details to strengthen your response.",
      score: 7
    },
    low: {
      text: "Your answer shows basic understanding, but needs more technical depth. Try to include specific examples and explain the underlying concepts in more detail.",
      score: 5
    }
  },
  behavioral: {
    high: {
      text: "Strong response that effectively demonstrates your experience and problem-solving abilities. You provided a clear situation, action, and result with good reflection on the learning outcome.",
      score: 9
    },
    medium: {
      text: "Good answer that describes the situation well. To improve, try to be more specific about your personal actions and the measurable results achieved.",
      score: 7
    },
    low: {
      text: "Your answer provides a basic overview but could benefit from more structure. Try using the STAR method (Situation, Task, Action, Result) to organize your response better.",
      score: 5
    }
  }
};

// Helper function to get fallback questions
const getFallbackQuestions = (role, difficulty) => {
  return [
    {
      text: FALLBACK_QUESTIONS.technical[difficulty][role] || FALLBACK_QUESTIONS.technical[difficulty].default,
      type: 'technical',
      difficulty: difficulty
    },
    {
      text: FALLBACK_QUESTIONS.behavioral[difficulty].default,
      type: 'behavioral',
      difficulty: difficulty
    }
  ];
};

// Helper function to get fallback feedback
const getFallbackFeedback = (type, answer) => {
  // Determine feedback level based on answer length and content
  const answerLength = answer.length;
  const hasSpecificDetails = answer.includes('example') || answer.includes('specific') || answer.includes('instance');
  const hasTechnicalTerms = answer.includes('code') || answer.includes('framework') || answer.includes('library') || answer.includes('function');
  
  let level = 'medium';
  if (answerLength > 200 && (hasSpecificDetails || hasTechnicalTerms)) {
    level = 'high';
  } else if (answerLength < 50 || (!hasSpecificDetails && !hasTechnicalTerms)) {
    level = 'low';
  }

  return FALLBACK_FEEDBACK[type][level];
};

// Helper function to delay execution
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to save response to file
const saveToFile = async (type, data, role = '') => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = path.join(__dirname, '..', 'responses', `${role}_${type}_${timestamp}.txt`);
    await fs.mkdir(path.join(__dirname, '..', 'responses'), { recursive: true });

    // Format the content based on type
    let content = '';
    if (type === 'questions') {
      content = `Interview Questions for ${role} Position\n\n` + 
        data.map((q, i) => `${i + 1}. ${q.text}\nType: ${q.type}\nDifficulty: ${q.difficulty}\n`).join('\n');
    } 
    else if (type === 'feedback') {
      content = `Feedback for ${role} Position\n\nQuestion: ${data.question}\nAnswer: ${data.answer}\n\nFeedback: ${data.feedback.text}\nScore: ${data.feedback.score}/10`;
    }
    else if (type === 'report') {
      content = data;
    }
    else {
      content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    }

    await fs.writeFile(filename, content);
    console.log(`Saved ${type} to ${filename}`);
    return filename;
  } catch (err) {
    console.error(`Error saving ${type}:`, err);
  }
};

const generateText = async (prompt) => {
  try {
    const response = await axios.post(
      `${OPENAI_BASE_URL}/chat/completions`,
      {
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    if (!response.data?.choices?.[0]?.message?.content) {
      throw new Error('No response from model');
    }

    return response.data.choices[0].message.content.trim();
  } catch (err) {
    console.error('Error calling OpenAI API:', err.message);
    throw err;
  }
};

const generateInterviewQuestions = async (role, difficulty, numQuestions = 2) => {
  try {
    const prompt = `Generate ${numQuestions} interview questions for a ${role} position.
Level: ${difficulty}

Requirements:
1. First half of questions must be technical about ${role} skills
2. Second half must be behavioral/soft skills questions
3. Questions should match ${difficulty} level
4. Questions must be clear and specific

Return the questions in this exact format (no additional text):
${Array.from({ length: numQuestions }, (_, i) => `${i + 1}. [Question ${i + 1}]`).join('\n')}`;

    const response = await generateText(prompt);
    console.log('Raw model response:', response);
    
    // Parse the response into structured questions
    const questions = response.split('\n')
      .filter(line => line.trim() && (line.match(/^\d+[\.)]/)))
      .slice(0, numQuestions)
      .map((question, index) => ({
        text: question.replace(/^\d+[\.)]\s*/, '').trim(),
        type: index < Math.ceil(numQuestions/2) ? 'technical' : 'behavioral',
        difficulty: difficulty
      }));

    if (questions.length < numQuestions) {
      console.log('Insufficient questions generated, using fallbacks');
      // Generate fallback questions based on numQuestions
      const fallbacks = [];
      const halfPoint = Math.ceil(numQuestions/2);
      
      // Add technical questions
      for (let i = 0; i < halfPoint; i++) {
        fallbacks.push({
          text: FALLBACK_QUESTIONS.technical[difficulty][role] || FALLBACK_QUESTIONS.technical[difficulty].default,
          type: 'technical',
          difficulty: difficulty
        });
      }
      
      // Add behavioral questions
      for (let i = halfPoint; i < numQuestions; i++) {
        fallbacks.push({
          text: FALLBACK_QUESTIONS.behavioral[difficulty].default,
          type: 'behavioral',
          difficulty: difficulty
        });
      }
      
      return fallbacks;
    }

    return questions;
  } catch (err) {
    console.error('Error generating questions:', err);
    // Generate fallback questions based on numQuestions
    const fallbacks = [];
    const halfPoint = Math.ceil(numQuestions/2);
    
    // Add technical questions
    for (let i = 0; i < halfPoint; i++) {
      fallbacks.push({
        text: FALLBACK_QUESTIONS.technical[difficulty][role] || FALLBACK_QUESTIONS.technical[difficulty].default,
        type: 'technical',
        difficulty: difficulty
      });
    }
    
    // Add behavioral questions
    for (let i = halfPoint; i < numQuestions; i++) {
      fallbacks.push({
        text: FALLBACK_QUESTIONS.behavioral[difficulty].default,
        type: 'behavioral',
        difficulty: difficulty
      });
    }
    
    return fallbacks;
  }
};

const generateAnswerFeedback = async (role, question, answer, difficulty) => {
  try {
    const prompt = `You are an expert interviewer for ${role} positions.
Evaluate this interview answer:

Question: ${question}
Answer: ${answer}
Level: ${difficulty}

Return the evaluation in this exact JSON format (no additional text):
{
  "feedback": "detailed evaluation of the answer",
  "score": number between 1-10
}`;

    const response = await generateText(prompt);
    console.log('Raw feedback response:', response);
    
    try {
      const parsed = JSON.parse(response);
      return {
        text: parsed.feedback,
        score: Math.min(Math.max(parseInt(parsed.score, 10), 1), 10)
      };
    } catch (parseErr) {
      console.log('Failed to parse feedback JSON, using fallback');
      return getFallbackFeedback(question.type, answer);
    }
  } catch (err) {
    console.error('Error generating feedback:', err);
    return getFallbackFeedback(question.type, answer);
  }
};

const generateInterviewReport = async (role, overallScore, questionsAndAnswers, difficulty) => {
  try {
    const difficultyLevel = difficulty || 'medium'; // Provide default if undefined
    const prompt = `Generate a detailed interview report for a ${role} position candidate.
Overall Score: ${overallScore}/10
Level: ${difficultyLevel.charAt(0).toUpperCase() + difficultyLevel.slice(1)}

Questions and Answers:
${questionsAndAnswers.map(qa => `Q: ${qa.question}\nA: ${qa.answer}\nScore: ${qa.score}/10`).join('\n\n')}

Generate a professional interview report with these sections:
1. Overall Assessment
2. Technical Skills
3. Communication Skills
4. Areas of Strength
5. Areas for Improvement
6. Recommendations`;

    const report = await generateText(prompt);
    return report;
  } catch (err) {
    console.error('Error generating report:', err);
    throw err;
  }
};

// Helper function for default report
const getDefaultReport = (role, overallScore, difficulty) => {
  return `# Interview Report - ${role} Position (${difficulty} Level)

## Performance Summary
The candidate demonstrated ${overallScore >= 7 ? 'strong' : 'moderate'} capabilities for the ${role} position, scoring ${overallScore}/10 overall. ${
  overallScore >= 8 ? 'Their responses showed excellent technical knowledge and strong communication skills.' :
  overallScore >= 6 ? 'Their responses were satisfactory but there is room for improvement.' :
  'Their responses indicated areas needing significant improvement.'
}

## Key Strengths
1. Shows understanding of ${role} fundamentals
2. Demonstrates willingness to learn and grow

## Areas to Improve
1. Could provide more specific examples in answers
2. Should focus on deepening technical expertise

## Final Recommendation
${
  overallScore >= 8 ? 'Strongly recommend moving forward with the candidate.' :
  overallScore >= 6 ? 'Consider moving forward with the candidate after addressing concerns.' :
  'Recommend additional preparation before moving forward.'
}`;
};

module.exports = {
  generateInterviewQuestions,
  generateAnswerFeedback,
  generateInterviewReport
}; 