import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import { initializeDatabase } from './database/setup';
import { globalErrorHandler, notFoundHandler } from './middleware/errorHandler';
import { securityHeaders, removeSensitiveHeaders } from './middleware/security';
import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';
import recordsRoutes from './routes/records.routes';
import dashboardRoutes from './routes/dashboard.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting - prevent brute force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limit for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: 'Too many login attempts, please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Security middleware stack
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(securityHeaders); // Additional security headers
app.use(removeSensitiveHeaders); // Remove X-Powered-By
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' })); // Limit request body size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Data sanitization against NoSQL injection and XSS
app.use(mongoSanitize()); // Sanitize data to prevent NoSQL injection
app.use(limiter); // Apply rate limiting to all routes

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'The Ledger API is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authLimiter, authRoutes); // Stricter rate limit for auth
app.use('/api/users', usersRoutes);
app.use('/api/records', recordsRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error handling
app.use(notFoundHandler);
app.use(globalErrorHandler);

// Initialize database then start server
async function start() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`\n🏦 The Ledger API Server`);
      console.log(`   ├── Port: ${PORT}`);
      console.log(`   ├── Health: http://localhost:${PORT}/api/health`);
      console.log(`   ├── Database: PostgreSQL`);
      console.log(`   └── Mode: ${process.env.NODE_ENV || 'development'}\n`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

start();

export default app;
