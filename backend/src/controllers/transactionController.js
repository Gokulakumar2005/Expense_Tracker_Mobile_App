import transactionModel from '../models/transactionModel.js';
import { paginate } from '../middlewares/paginationMiddleware.js';
import { validationError } from '../middlewares/errorMiddleware.js';
import { renderTransaction, renderTransactions } from '../views/transactionView.js';

function validateTransaction(data, isPartial = false) {
  const errors = {};

  if (!isPartial || data.title !== undefined) {
    if (!data.title || !data.title.trim()) {
      errors.title = ['Title cannot be blank.'];
    }
  }

  if (!isPartial || data.amount !== undefined) {
    const amount = parseFloat(data.amount);
    if (isNaN(amount) || amount < 0.01) {
      errors.amount = ['Ensure this value is greater than or equal to 0.01.'];
    }
  }

  if (!isPartial || data.transaction_type !== undefined) {
    const txType = (data.transaction_type || '').trim().toUpperCase();
    if (!['INCOME', 'EXPENSE'].includes(txType)) {
      errors.transaction_type = ["Transaction type must be 'INCOME' or 'EXPENSE'."];
    }
  }

  if (!isPartial || data.category !== undefined) {
    if (!data.category || !data.category.trim()) {
      errors.category = ['Category cannot be blank.'];
    }
  }

  return errors;
}

async function listTransactions(req, res) {
  const userId = req.user.id;
  const rows = await transactionModel.findAll(userId, req.query);
  const serialized = renderTransactions(rows);
  const paginated = paginate(serialized, req.query, req);
  return res.status(200).json(paginated);
}

async function getCategories(req, res) {
  return res.status(200).json({
    expense_categories: transactionModel.EXPENSE_CATEGORIES,
    income_categories: transactionModel.INCOME_CATEGORIES,
  });
}

async function createTransaction(req, res) {
  const errors = validateTransaction(req.body, false);
  if (Object.keys(errors).length > 0) throw validationError(errors);

  const tx = await transactionModel.create(req.user.id, req.body);
  return res.status(201).json(renderTransaction(tx));
}

async function getTransaction(req, res) {
  const tx = await transactionModel.findById(req.params.id, req.user.id);
  if (!tx) {
    return res.status(404).json({ detail: 'Not found.' });
  }
  return res.status(200).json(renderTransaction(tx));
}

async function updateTransaction(req, res) {
  const errors = validateTransaction(req.body, false);
  if (Object.keys(errors).length > 0) throw validationError(errors);

  const existing = await transactionModel.findById(req.params.id, req.user.id);
  if (!existing) {
    return res.status(404).json({ detail: 'Not found.' });
  }

  const updated = await transactionModel.update(req.params.id, req.user.id, req.body);
  return res.status(200).json(renderTransaction(updated));
}

async function patchTransaction(req, res) {
  const errors = validateTransaction(req.body, true);
  if (Object.keys(errors).length > 0) throw validationError(errors);

  const current = await transactionModel.findById(req.params.id, req.user.id);
  if (!current) {
    return res.status(404).json({ detail: 'Not found.' });
  }

  const updated = await transactionModel.patch(req.params.id, req.user.id, current, req.body);
  return res.status(200).json(renderTransaction(updated));
}

async function deleteTransaction(req, res) {
  const deleted = await transactionModel.remove(req.params.id, req.user.id);
  if (!deleted) {
    return res.status(404).json({ detail: 'Not found.' });
  }
  return res.status(200).json({ message: 'Transaction deleted successfully.' });
}

export {
  listTransactions,
  getCategories,
  createTransaction,
  getTransaction,
  updateTransaction,
  patchTransaction,
  deleteTransaction,
};
export default {
  listTransactions,
  getCategories,
  createTransaction,
  getTransaction,
  updateTransaction,
  patchTransaction,
  deleteTransaction,
};
