require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Routes
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/farms',         require('./routes/farms'));
app.use('/api/crops',         require('./routes/crops'));
app.use('/api/soil-readings', require('./routes/soilReadings'));
app.use('/api/crop-analyses', require('./routes/cropAnalyses'));
app.use('/api/risk-alerts',   require('./routes/riskAlerts'));
app.use('/api/advisories',    require('./routes/advisories'));
app.use('/api/market-prices', require('./routes/marketPrices'));
app.use('/api/notifications',  require('./routes/notifications'));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Global Error
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

// Database +
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/agrisense';
const { autoSeed } = require('./scripts/seed');

mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log(`✅ MongoDB connected: ${MONGODB_URI}`);
    await autoSeed();
    app.listen(PORT, () => {
      console.log(`🚀 AgriSense Backend running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
