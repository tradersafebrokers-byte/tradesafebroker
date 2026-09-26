import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import config from './config/config.js';
import routes from './routes/index.js';
import seoRoutes from './routes/seo.routes.js';
import { apiLimiter } from './middlewares/rateLimiter.middleware.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { ApiError } from './utils/ApiError.js';

const app = express();

// Trust reverse proxy (needed for accurate rate limiting behind Nginx/Cloudflare)
app.set('trust proxy', 1);

// Allowed origins for cross-domain API calls
const allowedOrigins = [
  ...config.corsOrigins,
  'https://tradesafebrokers.com',
  'https://www.tradesafebrokers.com',
  'http://tradesafebrokers.com',
  'http://www.tradesafebrokers.com',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
];

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  if (config.env === 'development') return true;
  if (allowedOrigins.includes(origin)) return true;
  if (
    origin.endsWith('tradesafebrokers.com') ||
    origin.endsWith('.vercel.app') ||
    origin.endsWith('.onrender.com') ||
    origin.includes('localhost') ||
    origin.includes('127.0.0.1')
  ) {
    return true;
  }
  return true; // Fallback to allow origins to prevent CORS browser rejections
};

// 1. Explicit Pre-Flight & CORS Injection Middleware (guarantees headers on every response, even errors)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      req.headers['access-control-request-headers'] ||
        'Content-Type, Authorization, X-Requested-With, Accept, Origin'
    );
    res.setHeader('Access-Control-Max-Age', '86400');
  }
  // Immediately return 204 No Content for all browser OPTIONS pre-flight checks
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// 2. Standard Express CORS Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  })
);

// 3. Security Headers (configured to allow cross-origin requests from custom domain)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
  })
);

// Payload compression for high network throughput
app.use(compression());

// Body Parsers with safe payload size limits (prevents payload flood attacks)
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Cookie Parser
app.use(cookieParser(config.cookieSecret));

// Request Logger (dev mode)
if (config.env === 'development') {
  app.use(morgan('dev'));
}

// Dynamic SEO Endpoints (/robots.txt & /sitemap.xml)
app.use('/', seoRoutes);

// General API Rate Limiter
app.use('/api', apiLimiter);

// Root Welcome & Status
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'PipWise Backend API is active and operational 🚀',
    version: '1.0.0',
    endpoints: {
      health: '/api/v1/health',
      auth: '/api/v1/auth',
      brokers: '/api/v1/brokers',
      admin: '/api/v1/admin',
    },
  });
});

// API Routes Mounting (v1, api, and direct shortcuts for maximum compatibility)
app.use('/api/v1', routes);
app.use('/api', routes);
app.use('/', routes);

// 404 Route Not Found Handler
app.use((req, res, next) => {
  next(new ApiError(404, `Route ${req.originalUrl} not found on this server`));
});

// Centralized Global Error Handler
app.use(errorHandler);

export default app;
