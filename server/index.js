const express = require('express');
const http = require('http');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const colors = require('colors');

// Load env vars
dotenv.config();

// Connect to database
const connectDB = require('./config/db');
const { configureCloudinary } = require('./config/cloudinary');
const { seedDevUsers } = require('./utils/seedDevUsers');
const swaggerSpec = require('./config/swagger');
const errorHandler = require('./middlewares/error');

// Route imports
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const tripRoutes = require('./routes/trips');
const itineraryRoutes = require('./routes/itineraries');
const expenseRoutes = require('./routes/expenses');
const splitRoutes = require('./routes/splits');
const packingRoutes = require('./routes/packing');
const { invitationRouter, router: invitationRoutes } = require('./routes/invitations');
const chatRoutes = require('./routes/chat');
const notificationRoutes = require('./routes/notifications');
const { router: docRoutes, deleteRouter: docDeleteRoutes } = require('./routes/documents');
const galleryRoutes = require('./routes/gallery');
const destinationRoutes = require('./routes/destinations');
const dashboardRoutes = require('./routes/dashboard');
const adminRoutes = require('./routes/admin');

// Initialize express
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const { initializeSocket } = require('./socket');
initializeSocket(server);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Set security headers
app.use(helmet());

// Enable CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: {
    success: false,
    error: 'Too many requests, please try again later.',
  },
});
app.use('/api', limiter);

// Sanitize data
app.use(mongoSanitize());

// Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'TravelMate AI - API Documentation',
}));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TravelMate AI API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/trips/:tripId/itinerary', itineraryRoutes);
app.use('/api/trips/:tripId/expenses', expenseRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/trips/:tripId/splits', splitRoutes);
app.use('/api/trips/:tripId/packing', packingRoutes);
app.use('/api/trips/:tripId/invitations', invitationRouter);
app.use('/api/invitations', invitationRoutes);
app.use('/api/trips/:tripId/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/trips/:tripId/documents', docRoutes);
app.use('/api/documents', docDeleteRoutes);
app.use('/api/trips/:tripId/gallery', galleryRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);

// Serve frontend build for client-side routes
const clientBuildPath = path.join(__dirname, '..', 'client', 'dist');
if (require('fs').existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
}

// Error handler
app.use(errorHandler);

// Handle unhandled routes
app.all('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      error: `Route ${req.originalUrl} not found`,
    });
  }

  const indexPath = path.join(clientBuildPath, 'index.html');
  if (require('fs').existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }

  res.status(404).send('Page not found');
});

// Configure Cloudinary
configureCloudinary();

// Connect to database and start server
const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  await seedDevUsers();
  server.listen(PORT, () => {
    console.log(`TravelMate AI Server running on port ${PORT}`.yellow.bold);
    console.log(`API Docs: http://localhost:${PORT}/api-docs`.blue);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  server.close(() => process.exit(1));
});

module.exports = { app, server };
