import { query } from '../config/db.js';

async function findByEmail(email) {
  const normalizedEmail = email.trim().toLowerCase();
  const result = await query(
    'SELECT id, first_name, last_name, email, password, is_active, is_staff, is_superuser, created_at, updated_at FROM accounts_user WHERE LOWER(email) = $1',
    [normalizedEmail]
  );
  return result.rows[0] || null;
}

async function findById(id) {
  const result = await query(
    'SELECT id, first_name, last_name, email, is_active, is_staff, is_superuser, created_at, updated_at FROM accounts_user WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

async function create({ firstName, lastName, email, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const result = await query(
    `INSERT INTO accounts_user (first_name, last_name, email, password, is_active, is_staff, is_superuser, created_at, updated_at)
     VALUES ($1, $2, $3, $4, TRUE, FALSE, FALSE, NOW(), NOW())
     RETURNING id, first_name, last_name, email, is_active, created_at, updated_at`,
    [firstName.trim(), lastName.trim(), normalizedEmail, password]
  );
  return result.rows[0];
}

async function updateProfile(id, { firstName, lastName }) {
  const result = await query(
    `UPDATE accounts_user
     SET first_name = $1, last_name = $2, updated_at = NOW()
     WHERE id = $3
     RETURNING id, first_name, last_name, email, is_active, created_at, updated_at`,
    [firstName.trim(), lastName.trim(), id]
  );
  return result.rows[0];
}

async function updateLastLogin(id) {
  await query('UPDATE accounts_user SET last_login = NOW() WHERE id = $1', [id]);
}

export {
  findByEmail,
  findById,
  create,
  updateProfile,
  updateLastLogin,
};
export default {
  findByEmail,
  findById,
  create,
  updateProfile,
  updateLastLogin,
};
