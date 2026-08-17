require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { getResponsibleAI, getAnalytics } = require('./controllers/analyticsController');

const app = express();

// Connect Database
connectDB();

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'NetSage AI Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    ai_provider: process.env.AI_PROVIDER || 'mock',
  });
});

// Routes
app.use('/api/cases', require('./routes/cases'));
app.use('/api/diagnosis', require('./routes/diagnosis'));
app.use('/api/rule-checker', require('./routes/ruleChecker'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.get('/api/analytics', getAnalytics);
app.get('/api/responsible-ai', getResponsibleAI);

// 404 and Error handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║       NetSage AI Backend Server          ║
  ║  Running on http://localhost:${PORT}         ║
  ║  AI Provider: ${(process.env.AI_PROVIDER || 'mock').padEnd(25)}║
  ╚══════════════════════════════════════════╝
  `);
});

module.exports = app;
