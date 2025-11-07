require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');

// DB connection
const { connect } = require('./config/db');

// Routes
const productRoutes = require('./routes/productRoutes');
const requestRoutes = require('./routes/requestRoutes');
const publicRequestRoutes = require('./routes/publicRequests');
const authRoutes = require('./routes/auth');

// Swagger
const { swaggerUi, specs } = require('./swagger');

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/public-requests', publicRequestRoutes);

// Start server after DB connection
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
