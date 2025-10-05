require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { connect } = require('./config/db');

// ✅ Import routes
const publicRequestRoutes = require('./routes/publicRequests');
const path = require('path');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// ✅ Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ✅ Mount routes
app.use('/api/public-requests', publicRequestRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// mount auth routes:
app.use('/api/auth', require('./routes/auth'));

const PORT = process.env.PORT || 4000;

connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
