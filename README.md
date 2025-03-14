# JobPrep AI - Your AI-Powered Interview Preparation Partner


## Overview

JobPrep AI is a cutting-edge interview preparation platform that leverages artificial intelligence to help job seekers excel in their interviews. Built with modern web technologies and powered by advanced AI, this application provides personalized interview simulations, real-time feedback, and comprehensive performance analytics.

## 🌟 Key Features

### For Candidates
- **Personalized Interview Sessions**
  - Role-specific interview questions
  - Adjustable difficulty levels (Easy, Medium, Hard)
  - Customizable number of questions
  - Technical and behavioral question mix

### AI-Powered Features
- **Real-time Speech Recognition**
  - Natural voice-based responses
  - Automatic speech-to-text conversion
  - Seamless interview experience

- **Intelligent Feedback System**
  - Instant answer evaluation
  - Detailed feedback on responses
  - Score-based assessment
  - Improvement suggestions

### Analytics & Reporting
- **Interactive Dashboard**
  - Overall performance metrics
  - Interview history tracking
  - Score distribution analysis
  - Role-based statistics

- **Comprehensive Reports**
  - Detailed interview summaries
  - Question-wise feedback
  - Downloadable reports
  - Performance trends

## 🛠️ Technical Stack

### Backend Technology
```bash
- Node.js & Express.js - Server framework
- MongoDB - Database
- JWT - Authentication
- OpenAI API - AI processing
```

### Frontend Technology
```bash
- React.js - UI framework
- Redux Toolkit - State management
- Material-UI - Component library
- React Speech Recognition - Voice input
- Recharts - Data visualization
```

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- npm (v6 or higher)
- MongoDB (v4.4 or higher)
- Git

## 🚀 Installation & Setup

1. **Clone the Repository**
```bash
git clone https://github.com/jerry-619/JobPrep-AI.git
cd jobprep-ai
```

2. **Backend Setup**
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file
touch .env
```

3. **Configure Environment Variables**
Create a `.env` file in the server directory with the following:
```env
# Server Configuration
PORT=5000


# MongoDB Configuration
MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.mongodb.net/interview-ai

# JWT Configuration
JWT_SECRET=your_secure_jwt_secret_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_BASE_URL=https://api.sree.shop/v1
MODEL_NAME=your_model_name
```

4. **Frontend Setup**
```bash
# Navigate to client directory
cd ../client

# Install dependencies
npm install
```

5. **Start Development Servers**
```bash
# Start backend (from server directory)
npm run server

# Start frontend (from client directory)
npm start
```

## 📚 API Documentation

### Authentication Endpoints
```bash
POST /api/auth/register
- Register new user
- Body: { name, email, password }

POST /api/auth/login
- User login
- Body: { email, password }

GET /api/auth/user
- Get authenticated user
- Header: x-auth-token
```

### Interview Endpoints
```bash
POST /api/interviews/generate
- Generate new interview
- Body: { role, difficulty, numQuestions }

GET /api/interviews/:id
- Get interview by ID
- Header: x-auth-token

POST /api/interviews/:id/answers
- Submit answer
- Body: { questionIndex, answer }

GET /api/interviews/:id/report
- Generate interview report
- Header: x-auth-token

GET /api/interviews
- Get user's interviews
- Header: x-auth-token
```

## 📁 Project Structure

```
jobprep-ai/
├── client/
│   ├── public/
│   │   ├── index.html
│   │   └── manifest.json
│   └── src/
│       ├── components/
│       │   ├── ErrorBoundary.jsx
│       │   ├── Header.jsx
│       │   ├── Loading.jsx
│       │   ├── Navbar.jsx
│       │   └── ProtectedRoute.jsx
│       ├── pages/
│       │   ├── Auth.jsx
│       │   ├── Dashboard.jsx
│       │   ├── Home.jsx
│       │   └── Interview.jsx
│       ├── features/
│       │   └── auth/
│       │       └── authSlice.js
│       └── utils/
│           └── api.js
└── server/
    ├── middleware/
    │   └── auth.js
    ├── models/
    │   ├── Interview.js
    │   └── User.js
    ├── routes/
    │   ├── auth.js
    │   └── interviews.js
    ├── utils/
    │   └── openAiUtils.js
    ├── .env
    ├── package.json
    └── server.js
```

## 🔧 Configuration Options

### Server Configuration
- `PORT`: Server port (default: 5000)

### MongoDB Configuration
- `MONGODB_URI`: MongoDB connection string
- Database name: interview-ai
- Collections: users, interviews

### JWT Configuration
- `JWT_SECRET`: Secret key for token generation
- Token expiration: 24 hours

### OpenAI Configuration
- `OPENAI_API_KEY`: API key for OpenAI
- `OPENAI_BASE_URL`: Base URL for API requests
- `MODEL_NAME`: AI model selection

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
```bash
git checkout -b feature/YourFeature
```
3. Commit your changes
```bash
git commit -m 'Add some feature'
```
4. Push to the branch
```bash
git push origin feature/YourFeature
```
5. Open a Pull Request

## 🌟 Special Thanks

Special thanks to [sree.shop](https://sree.shop) for providing exceptional API support for this project. Their reliable and powerful API services have been instrumental in making JobPrep AI a reality.

## 📧 Support

For technical support or inquiries, please contact:
- Email: [fardeenz619@gmail.com](mailto:fardeenz619@gmail.com)
- Response Time: Within 24-48 hours

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 👥 Authors & Contributors

- Project Lead: [Fardeen Beigh]


## 🙏 Acknowledgments

- [sree.shop](https://sree.shop) - For providing API infrastructure

## 🔄 Version History

- v1.0.0 (Current)
  - Initial release
  - Core interview features
  - AI-powered feedback system
  - Basic analytics dashboard

## 🔮 Future Enhancements

- Video interview capabilities
- Industry-specific question banks
- Mock interview scheduling
- Peer review system
- Advanced analytics and insights
- Mobile application 