import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

const SECRET_KEY = process.env.SECRET_KEY;
const ACCESS_TOKEN_EXPIRY = '1d';
const REFRESH_TOKEN_EXPIRY = '7d';

function generateTokens(user) {
  const payload = { user_id: user.id, token_type: 'access' };
  const access = jwt.sign(payload, SECRET_KEY, { expiresIn: ACCESS_TOKEN_EXPIRY, algorithm: 'HS256' });

  const refreshPayload = { user_id: user.id, token_type: 'refresh' };
  const refresh = jwt.sign(refreshPayload, SECRET_KEY, { expiresIn: REFRESH_TOKEN_EXPIRY, algorithm: 'HS256' });

  return { access, refresh };
}

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      detail: 'Authentication credentials were not provided.',
    });
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, SECRET_KEY, { algorithms: ['HS256'] });

    if (decoded.token_type !== 'access') {
      return res.status(401).json({ detail: 'Invalid token type.' });
    }

    const result = await query(
      'SELECT id, first_name, last_name, email, is_active, is_staff, is_superuser, created_at, updated_at FROM accounts_user WHERE id = $1',
      [decoded.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ detail: 'User not found.' });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(401).json({ detail: 'User account is disabled.' });
    }

    await query('UPDATE accounts_user SET last_login = NOW() WHERE id = $1', [user.id]);

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ detail: 'Token has expired.' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ detail: 'Invalid token.' });
    }
    next(err);
  }
}

export { generateTokens, authenticate, ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY };
export default { generateTokens, authenticate, ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY };
