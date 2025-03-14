require('dotenv').config();
const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const interviewRoutes = require('./routes/interviews');
const auth = require('./middleware/auth');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const uri = process.env.MONGODB_URI;
console.log('Attempting to connect to MongoDB...');

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  maxPoolSize: 50,
  minPoolSize: 5,
  retryWrites: true,
  retryReads: true,
  connectTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 30000,
  heartbeatFrequencyMS: 1000,
  directConnection: false,
  family: 4
});

let isConnected = false;
let connectionRetries = 0;
const MAX_RETRIES = 5;
const RETRY_INTERVAL = 5000;

async function connectDB() {
  try {
    if (!isConnected) {
      if (connectionRetries >= MAX_RETRIES) {
        console.error('Max connection retries reached. Exiting...');
        process.exit(1);
      }

      connectionRetries++;
      console.log(`Connection attempt ${connectionRetries} of ${MAX_RETRIES}`);

      // Connect the client to the server
      await client.connect();
      console.log('Connected to MongoDB server');
      
      // Send a ping to confirm a successful connection
      await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
      
      // Make the client available globally
      const db = client.db('interview-ai');
      app.locals.db = db;
      isConnected = true;
      connectionRetries = 0; // Reset retry counter on successful connection
      console.log("MongoDB Connected Successfully - Database: interview-ai");

      // Set up connection monitoring
      client.on('close', () => {
        console.log('MongoDB connection closed. Attempting to reconnect...');
        isConnected = false;
        setTimeout(reconnectDB, RETRY_INTERVAL);
      });

      client.on('error', (err) => {
        console.error('MongoDB connection error:', err);
        if (isConnected) {
          isConnected = false;
          setTimeout(reconnectDB, RETRY_INTERVAL);
        }
      });

      client.on('timeout', () => {
        console.error('MongoDB connection timeout. Attempting to reconnect...');
        isConnected = false;
        setTimeout(reconnectDB, RETRY_INTERVAL);
      });

      // Test the connection by trying to access a collection
      try {
        const collections = await db.listCollections().toArray();
        console.log('Available collections:', collections.map(c => c.name));
      } catch (err) {
        console.error('Error listing collections:', err);
        throw err;
      }
    }
  } catch (err) {
    console.error('MongoDB Connection Error:', err);
    isConnected = false;
    // Attempt to reconnect after delay
    setTimeout(reconnectDB, RETRY_INTERVAL);
  }
}

async function reconnectDB() {
  if (!isConnected) {
    try {
      await client.close(true); // Force close existing connections
      await connectDB();
    } catch (err) {
      console.error('Error during reconnection:', err);
      setTimeout(reconnectDB, RETRY_INTERVAL);
    }
  }
}

// Connect to MongoDB
connectDB().catch(err => {
  console.error('Initial MongoDB connection failed:', err);
  setTimeout(reconnectDB, RETRY_INTERVAL);
});

// Routes
app.get('/', (req, res) => res.send('Interview AI API'));

// Health check endpoint
app.get('/health', (req, res) => {
  if (isConnected && app.locals.db) {
    res.json({ status: 'healthy', database: 'connected' });
  } else {
    res.status(503).json({ status: 'unhealthy', database: 'disconnected' });
  }
});

// Add after database connection
app.use('/api/auth', authRoutes);
app.use('/api/interviews', auth, interviewRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    return res.status(503).json({ 
      message: 'Database connection error. Please try again in a few moments.',
      error: err.message
    });
  }
  res.status(500).json({ 
    message: 'Something went wrong. Please try again.',
    error: err.message
  });
});

// Production setup
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('../client/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'client', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Handle application shutdown
process.on('SIGINT', async () => {
  console.log('Received SIGINT. Closing HTTP server and database connection...');
  server.close(() => {
    console.log('HTTP server closed.');
  });
  if (client) {
    await client.close(true);
    console.log('MongoDB connection closed through app termination');
  }
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', async (err) => {
  console.error('Uncaught Exception:', err);
  if (client) {
    await client.close(true);
  }
  process.exit(1);
}); 