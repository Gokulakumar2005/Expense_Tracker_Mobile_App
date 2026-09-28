import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import { generateTokens } from '../middlewares/authMiddleware.js';
import { validationError } from '../middlewares/errorMiddleware.js';
import { hashPassword, verifyPassword } from '../utils/passwordUtils.js';
import { renderUser } from '../views/userView.js';

async function register(req, res) {
  const { first_name, last_name, email, password, confirm_password } = req.body;
  const errors = {};

  if (!first_name || !first_name.trim()) {
    errors.first_name = ['This field is required.'];
  }
  if (!last_name || !last_name.trim()) {
    errors.last_name = ['This field is required.'];
  }
  if (!email || !email.trim()) {
    errors.email = ['This field is required.'];
  }
  if (!password) {
    errors.password = ['This field is required.'];
  } else if (password.length < 6) {
    errors.password = ['Password must be at least 6 characters long.'];
  }
  if (!confirm_password) {
    errors.confirm_password = ['This field is required.'];
  }

  if (Object.keys(errors).length > 0) {
    throw validationError(errors);
  }

  if (password !== confirm_password) {
    throw validationError({ confirm_password: ['Passwords do not match.'] });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await userModel.findByEmail(normalizedEmail);
  if (existing) {
    throw validationError({ email: ['A user with this email already exists.'] });
  }

  const hashedPassword = await hashPassword(password);
  const user = await userModel.create({
    firstName: first_name,
    lastName: last_name,
    email: normalizedEmail,
    password: hashedPassword,
  });

  const tokens = generateTokens(user);

  return res.status(201).json({
    message: 'User registered successfully',
    tokens,
    user: renderUser(user),
  });
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    throw validationError({ non_field_errors: ['Both email and password are required.'] });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await userModel.findByEmail(normalizedEmail);

  if (!user) {
    throw validationError({ non_field_errors: ['Invalid email or password.'] });
  }

  if (!user.is_active) {
    throw validationError({ non_field_errors: ['User account is disabled.'] });
  }

  const passwordMatch = await verifyPassword(password, user.password);
  if (!passwordMatch) {
    throw validationError({ non_field_errors: ['Invalid email or password.'] });
  }

  const tokens = generateTokens(user);

  return res.status(200).json({
    message: 'Login successful',
    tokens,
    user: renderUser(user),
  });
}

async function refreshToken(req, res) {
  const { refresh } = req.body;

  if (!refresh) {
    return res.status(400).json({ detail: 'Refresh token is required.' });
  }

  try {
    const decoded = jwt.verify(refresh, process.env.SECRET_KEY, { algorithms: ['HS256'] });

    if (decoded.token_type !== 'refresh') {
      return res.status(401).json({ detail: 'Invalid token type.' });
    }

    const user = await userModel.findById(decoded.user_id);
    if (!user || !user.is_active) {
      return res.status(401).json({ detail: 'User not found or inactive.' });
    }

    const tokens = generateTokens(user);
    return res.status(200).json({ access: tokens.access });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ detail: 'Refresh token has expired.' });
    }
    return res.status(401).json({ detail: 'Invalid refresh token.' });
  }
}

async function getProfile(req, res) {
  return res.status(200).json(renderUser(req.user));
}

async function updateProfile(req, res) {
  const { first_name, last_name } = req.body;
  const errors = {};

  if (first_name !== undefined && (!first_name || !first_name.trim())) {
    errors.first_name = ['First name cannot be blank.'];
  }
  if (last_name !== undefined && (!last_name || !last_name.trim())) {
    errors.last_name = ['Last name cannot be blank.'];
  }

  if (Object.keys(errors).length > 0) {
    throw validationError(errors);
  }

  const updatedFirst = first_name !== undefined ? first_name.trim() : req.user.first_name;
  const updatedLast = last_name !== undefined ? last_name.trim() : req.user.last_name;

  const user = await userModel.updateProfile(req.user.id, {
    firstName: updatedFirst,
    lastName: updatedLast,
  });

  return res.status(200).json(renderUser(user));
}

export {
  register,
  login,
  refreshToken,
  getProfile,
  updateProfile,
};
export default {
  register,
  login,
  refreshToken,
  getProfile,
  updateProfile,
};
