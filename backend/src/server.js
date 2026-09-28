import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import 'express-async-errors';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import apiRoutes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middlewares/errorMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.set('trust proxy', 1);

const isDebug = (process.env.DEBUG || 'False').toLowerCase() === 'true';
const corsOriginsEnv = process.env.CORS_ALLOWED_ORIGINS || '';

const defaultOrigins = [
  'http://localhost:8081',
  'http://127.0.0.1:8081',
  'http://192.168.1.11:8081',
  'http://localhost:19000',
  'http://localhost:19006',
  'http://localhost:8080',
  'https://expense-tracker-mobile-app-backend-j1ep.onrender.com',
];

const allowedOrigins = corsOriginsEnv
  ? Array.from(new Set([...corsOriginsEnv.split(',').map((o) => o.trim()).filter(Boolean), ...defaultOrigins]))
  : defaultOrigins;

const corsOptions = {
  origin: isDebug || allowedOrigins.includes('*')
    ? true
    : (origin, callback) => {
        if (
          !origin ||
          allowedOrigins.includes(origin) ||
          origin.endsWith('.onrender.com') ||
          origin.includes('localhost') ||
          origin.includes('127.0.0.1')
        ) {
          callback(null, true);
        } else {
          callback(new Error(`CORS: origin '${origin}' not allowed`));
        }
      },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { detail: 'Too many requests, please try again later.' },
});
app.use(limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { detail: 'Too many authentication attempts, please try again later.' },
});

app.get('/health/', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'PocketTrack API - Express.js Backend',
    version: '1.0.0',
    docs: '/api/',
    environment: isDebug ? 'development' : 'production',
    live_url: 'https://expense-tracker-mobile-app-backend-j1ep.onrender.com',
  });
});

app.use('/api/auth', authLimiter);
app.use('/api', apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = parseInt(process.env.PORT || '8000', 10);

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PocketTrack Express.js server running on port ${PORT}`);
  });
}

export default app;
