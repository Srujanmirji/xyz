import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import routes from './routes';
import { errorHandler } from './middlewares/errors';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(
  cors({
    origin: '*', // Allow all origins for development and deployment compatibility
    credentials: true,
  })
);

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP Request Logger
app.use(morgan('dev'));

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs for development/testing flexibility
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
});
app.use(limiter);

// API Route Namespace
app.use('/api', routes);

// Base Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'XYZ Homes API is fully operational' });
});

// Global Error Handler Middleware
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 XYZ Homes Server Running on Port: ${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api`);
  console.log(`===============================================`);
});
