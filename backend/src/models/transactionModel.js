import { query } from '../config/db.js';

const EXPENSE_CATEGORIES = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Entertainment',
  'Health',
  'Education',
  'Travel',
  'Rent',
  'Subscriptions',
  'Other',
];

const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Investment',
  'Business',
  'Gift',
  'Other',
];

async function findAll(userId, filters = {}) {
  const conditions = ['user_id = $1'];
  const params = [userId];
  let paramIdx = 2;

  if (filters.transaction_type) {
    conditions.push(`transaction_type = $${paramIdx++}`);
    params.push(filters.transaction_type.trim().toUpperCase());
  }

  if (filters.category && filters.category.toLowerCase() !== 'all') {
    conditions.push(`LOWER(category) = $${paramIdx++}`);
    params.push(filters.category.trim().toLowerCase());
  }

  if (filters.date) {
    const parsed = new Date(filters.date);
    if (!isNaN(parsed)) {
      conditions.push(`transaction_date = $${paramIdx++}`);
      params.push(filters.date);
    }
  }

  if (filters.month) {
    const m = parseInt(filters.month, 10);
    if (m >= 1 && m <= 12) {
      conditions.push(`EXTRACT(MONTH FROM transaction_date) = $${paramIdx++}`);
      params.push(m);
    }
  }

  if (filters.year) {
    const y = parseInt(filters.year, 10);
    if (!isNaN(y)) {
      conditions.push(`EXTRACT(YEAR FROM transaction_date) = $${paramIdx++}`);
      params.push(y);
    }
  }

  if (filters.start_date) {
    const sd = new Date(filters.start_date);
    if (!isNaN(sd)) {
      conditions.push(`transaction_date >= $${paramIdx++}`);
      params.push(filters.start_date);
    }
  }

  if (filters.end_date) {
    const ed = new Date(filters.end_date);
    if (!isNaN(ed)) {
      conditions.push(`transaction_date <= $${paramIdx++}`);
      params.push(filters.end_date);
    }
  }

  if (filters.search) {
    const s = filters.search.trim();
    conditions.push(`(LOWER(title) LIKE $${paramIdx} OR LOWER(description) LIKE $${paramIdx})`);
    params.push(`%${s.toLowerCase()}%`);
    paramIdx++;
  }

  const orderingMap = {
    newest: 'transaction_date DESC, created_at DESC',
    oldest: 'transaction_date ASC, created_at ASC',
    highest: 'amount DESC, transaction_date DESC',
    lowest: 'amount ASC, transaction_date DESC',
  };
  const orderKey = (filters.ordering || 'newest').toLowerCase();
  const orderBy = orderingMap[orderKey] || orderingMap.newest;

  const whereClause = conditions.join(' AND ');
  const result = await query(
    `SELECT * FROM transactions_transaction WHERE ${whereClause} ORDER BY ${orderBy}`,
    params
  );
  return result.rows;
}

async function findById(id, userId) {
  const result = await query(
    'SELECT * FROM transactions_transaction WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  return result.rows[0] || null;
}

async function create(userId, { title, amount, transaction_type, category, description, transaction_date }) {
  const txDate = transaction_date || new Date().toISOString().split('T')[0];
  const result = await query(
    `INSERT INTO transactions_transaction (user_id, title, amount, transaction_type, category, description, transaction_date, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
     RETURNING *`,
    [
      userId,
      title.trim(),
      parseFloat(amount),
      transaction_type.trim().toUpperCase(),
      category.trim(),
      (description || '').trim(),
      txDate,
    ]
  );
  return result.rows[0];
}

async function update(id, userId, { title, amount, transaction_type, category, description, transaction_date }) {
  const txDate = transaction_date || new Date().toISOString().split('T')[0];
  const result = await query(
    `UPDATE transactions_transaction
     SET title = $1, amount = $2, transaction_type = $3, category = $4,
         description = $5, transaction_date = $6, updated_at = NOW()
     WHERE id = $7 AND user_id = $8
     RETURNING *`,
    [
      title.trim(),
      parseFloat(amount),
      transaction_type.trim().toUpperCase(),
      category.trim(),
      (description || '').trim(),
      txDate,
      id,
      userId,
    ]
  );
  return result.rows[0] || null;
}

async function patch(id, userId, current, updates) {
  const title = updates.title !== undefined ? updates.title.trim() : current.title;
  const amount = updates.amount !== undefined ? parseFloat(updates.amount) : current.amount;
  const txType = updates.transaction_type !== undefined ? updates.transaction_type.trim().toUpperCase() : current.transaction_type;
  const category = updates.category !== undefined ? updates.category.trim() : current.category;
  const description = updates.description !== undefined ? updates.description.trim() : current.description;
  const txDate = updates.transaction_date !== undefined ? updates.transaction_date : current.transaction_date;

  const result = await query(
    `UPDATE transactions_transaction
     SET title = $1, amount = $2, transaction_type = $3, category = $4,
         description = $5, transaction_date = $6, updated_at = NOW()
     WHERE id = $7 AND user_id = $8
     RETURNING *`,
    [title, amount, txType, category, description, txDate, id, userId]
  );
  return result.rows[0] || null;
}

async function remove(id, userId) {
  const result = await query(
    'DELETE FROM transactions_transaction WHERE id = $1 AND user_id = $2 RETURNING id',
    [id, userId]
  );
  return result.rows[0] || null;
}

async function getTotalByType(userId, type) {
  const result = await query(
    `SELECT COALESCE(SUM(amount), 0) AS total
     FROM transactions_transaction
     WHERE user_id = $1 AND transaction_type = $2`,
    [userId, type]
  );
  return parseFloat(result.rows[0].total) || 0;
}

async function getMonthlyByType(userId, type, month, year) {
  const result = await query(
    `SELECT COALESCE(SUM(amount), 0) AS total
     FROM transactions_transaction
     WHERE user_id = $1
       AND transaction_type = $2
       AND EXTRACT(MONTH FROM transaction_date) = $3
       AND EXTRACT(YEAR FROM transaction_date) = $4`,
    [userId, type, month, year]
  );
  return parseFloat(result.rows[0].total) || 0;
}

async function getRecent(userId, limit = 5) {
  const result = await query(
    `SELECT * FROM transactions_transaction WHERE user_id = $1
     ORDER BY transaction_date DESC, created_at DESC LIMIT $2`,
    [userId, limit]
  );
  return result.rows;
}

async function getCategorySummary(userId, month, year) {
  const result = await query(
    `SELECT category,
            SUM(amount) AS total_amount,
            COUNT(id) AS transaction_count
     FROM transactions_transaction
     WHERE user_id = $1
       AND transaction_type = 'EXPENSE'
       AND EXTRACT(MONTH FROM transaction_date) = $2
       AND EXTRACT(YEAR FROM transaction_date) = $3
     GROUP BY category
     ORDER BY total_amount DESC`,
    [userId, month, year]
  );
  return result.rows;
}

export {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  findAll,
  findById,
  create,
  update,
  patch,
  remove,
  getTotalByType,
  getMonthlyByType,
  getRecent,
  getCategorySummary,
};
export default {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  findAll,
  findById,
  create,
  update,
  patch,
  remove,
  getTotalByType,
  getMonthlyByType,
  getRecent,
  getCategorySummary,
};
