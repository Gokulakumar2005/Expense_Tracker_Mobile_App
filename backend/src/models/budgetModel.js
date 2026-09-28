import { query } from '../config/db.js';

async function getSpentAmount(userId, category, month, year) {
  const result = await query(
    `SELECT COALESCE(SUM(amount), 0) AS total
     FROM transactions_transaction
     WHERE user_id = $1
       AND transaction_type = 'EXPENSE'
       AND LOWER(category) = LOWER($2)
       AND EXTRACT(MONTH FROM transaction_date) = $3
       AND EXTRACT(YEAR FROM transaction_date) = $4`,
    [userId, category, month, year]
  );
  return parseFloat(result.rows[0].total) || 0;
}

async function findAll(userId, filters = {}) {
  const conditions = ['user_id = $1'];
  const params = [userId];
  let paramIdx = 2;

  if (filters.month) {
    const m = parseInt(filters.month, 10);
    if (m >= 1 && m <= 12) {
      conditions.push(`month = $${paramIdx++}`);
      params.push(m);
    }
  }

  if (filters.year) {
    const y = parseInt(filters.year, 10);
    if (!isNaN(y)) {
      conditions.push(`year = $${paramIdx++}`);
      params.push(y);
    }
  }

  const whereClause = conditions.join(' AND ');
  const result = await query(
    `SELECT * FROM budgets_budget WHERE ${whereClause} ORDER BY year DESC, month DESC, category ASC`,
    params
  );
  return result.rows;
}

async function findById(id, userId) {
  const result = await query(
    'SELECT * FROM budgets_budget WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  return result.rows[0] || null;
}

async function findDuplicate(userId, category, month, year, excludeId = null) {
  let sql = `SELECT id FROM budgets_budget
             WHERE user_id = $1 AND LOWER(category) = LOWER($2) AND month = $3 AND year = $4`;
  const params = [userId, category.trim(), parseInt(month, 10), parseInt(year, 10)];

  if (excludeId) {
    sql += ' AND id != $5';
    params.push(excludeId);
  }

  const result = await query(sql, params);
  return result.rows.length > 0;
}

async function create(userId, { category, amount, month, year }) {
  const result = await query(
    `INSERT INTO budgets_budget (user_id, category, amount, month, year, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
     RETURNING *`,
    [userId, category.trim(), parseFloat(amount), parseInt(month, 10), parseInt(year, 10)]
  );
  return result.rows[0];
}

async function update(id, userId, { category, amount, month, year }) {
  const result = await query(
    `UPDATE budgets_budget
     SET category = $1, amount = $2, month = $3, year = $4, updated_at = NOW()
     WHERE id = $5 AND user_id = $6
     RETURNING *`,
    [category.trim(), parseFloat(amount), parseInt(month, 10), parseInt(year, 10), id, userId]
  );
  return result.rows[0] || null;
}

async function patch(id, userId, current, updates) {
  const category = updates.category !== undefined ? updates.category.trim() : current.category;
  const amount = updates.amount !== undefined ? parseFloat(updates.amount) : parseFloat(current.amount);
  const month = updates.month !== undefined ? parseInt(updates.month, 10) : current.month;
  const year = updates.year !== undefined ? parseInt(updates.year, 10) : current.year;

  const result = await query(
    `UPDATE budgets_budget
     SET category = $1, amount = $2, month = $3, year = $4, updated_at = NOW()
     WHERE id = $5 AND user_id = $6
     RETURNING *`,
    [category, amount, month, year, id, userId]
  );
  return result.rows[0] || null;
}

async function remove(id, userId) {
  const result = await query(
    'DELETE FROM budgets_budget WHERE id = $1 AND user_id = $2 RETURNING id',
    [id, userId]
  );
  return result.rows[0] || null;
}

async function getMonthlyBudgets(userId, month, year) {
  const result = await query(
    'SELECT * FROM budgets_budget WHERE user_id = $1 AND month = $2 AND year = $3',
    [userId, month, year]
  );
  return result.rows;
}

export {
  getSpentAmount,
  findAll,
  findById,
  findDuplicate,
  create,
  update,
  patch,
  remove,
  getMonthlyBudgets,
};
export default {
  getSpentAmount,
  findAll,
  findById,
  findDuplicate,
  create,
  update,
  patch,
  remove,
  getMonthlyBudgets,
};
