import express from 'express';
import config from './config/config.js';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import { publicRoutes } from './routes/publicRoutes.js';
import sequelize from './models/index.js';

const app = express();
const PORT = config.port;

/**
 * Best-effort "real client IP" for Render + Cloudflare.
 *
 * Why not just `trust proxy = true`?
 * - On some platforms (including reports about Render), X-Forwarded-For can be user-influenced
 *   because proxies may append instead of replace. Trusting it blindly can let clients spoof IPs.
 *
 * Prefer single-value headers set by the edge (Cloudflare/Render) when present.
 */
function getClientIp(req) {
  // Cloudflare often sets these (True-Client-IP is commonly the cleanest single IP).
  const trueClientIp = req.headers['true-client-ip'];
  const cfConnectingIp = req.headers['cf-connecting-ip'];

  // Fallbacks (less ideal behind proxies)
  const xRealIp = req.headers['x-real-ip'];
  const remoteAddr = req.socket?.remoteAddress;

  // Normalize header values (they can be arrays in some Node setups, but usually strings)
  const pick = (v) => Array.isArray(v) ? v[0] : v;

  return (
    pick(trueClientIp) ||
    pick(cfConnectingIp) ||
    pick(xRealIp) ||
    remoteAddr ||
    'unknown'
  );
}

// Custom token which will be used in the custom morgan logging format
morgan.token('client-ip', (req) => getClientIp(req));

const morganFormat =
  ':client-ip - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"';

app.use(morgan(morganFormat));

// Basic security middleware
app.use(helmet()); // Adds HTTP security headers to protect against common web vulnerabilities.
app.use(express.json({ limit: '500b' }));
app.disable('x-powered-by');

// Rate limiting for the this backend public API only
const publicApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  keyGenerator: (req) => getClientIp(req), // key on our best-effort client IP (Render/Cloudflare aware)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    error: "Rate Limit exceeded -- too many requests"
  }
});

app.use('/api', publicApiLimiter, publicRoutes); // Prefixes all routes with '/api'. Also applies rate limiting to the public routes.

// Global error handler
// In Express, error-handling middleware is distinguished by having four parameters instead of the usual three
// For normal, successful API requests, the global error handler is completely bypassed
app.use((err, _req, res, _next) => {
  console.error(err.message);
  res.status(err.status || 500).json({
    error: err.message || 'An unexpected error occurred'
  });
});

// Initialize database and start server
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Connected to PostgreSQL database');

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

startServer();
