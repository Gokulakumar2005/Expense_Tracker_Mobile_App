import budgetModel from '../models/budgetModel.js';
import { paginate } from '../middlewares/paginationMiddleware.js';
import { validationError } from '../middlewares/errorMiddleware.js';
import { renderBudget, renderBudgetSummary } from '../views/budgetView.js';

function validateBudget(data, isPartial = false) {
  const errors = {};

  if (!isPartial || data.amount !== undefined) {
    const amount = parseFloat(data.amount);
    if (isNaN(amount) || amount <= 0) {
      errors.amount = ['Budget amount must be greater than 0.'];
    }
  }

  if (!isPartial || data.category !== undefined) {
    if (!data.category || !data.category.trim()) {
      errors.category = ['Category cannot be blank.'];
    }
  }

  if (!isPartial || data.month !== undefined) {
    const month = parseInt(data.month, 10);
    if (isNaN(month) || month < 1 || month > 12) {
      errors.month = ['Month must be between 1 and 12.'];
    }
  }

  if (!isPartial || data.year !== undefined) {
    const year = parseInt(data.year, 10);
    if (isNaN(year) || year < 2000 || year > 2100) {
      errors.year = ['Year must be between 2000 and 2100.'];
    }
  }

  return errors;
}

async function listBudgets(req, res) {
  const userId = req.user.id;
  const rows = await budgetModel.findAll(userId, req.query);

  const serialized = await Promise.all(
    rows.map(async (b) => {
      const spent = await budgetModel.getSpentAmount(userId, b.category, b.month, b.year);
      return renderBudget(b, spent);
    })
  );

  const paginated = paginate(serialized, req.query, req);
  return res.status(200).json(paginated);
}

async function getBudgetSummary(req, res) {
  const userId = req.user.id;
  const now = new Date();

  const month = req.query.month ? parseInt(req.query.month, 10) : now.getMonth() + 1;
  const year = req.query.year ? parseInt(req.query.year, 10) : now.getFullYear();

  const budgets = await budgetModel.getMonthlyBudgets(userId, month, year);

  let totalBudget = 0;
  let totalSpent = 0;
  let exceededCount = 0;
  let warningCount = 0;

  for (const b of budgets) {
    const amount = parseFloat(b.amount);
    const spent = await budgetModel.getSpentAmount(userId, b.category, b.month, b.year);
    const pct = amount > 0 ? (spent / amount) * 100 : 0;

    totalBudget += amount;
    totalSpent += spent;

    if (spent > amount) {
      exceededCount++;
    } else if (pct >= 80 && pct <= 100) {
      warningCount++;
    }
  }

  return res.status(200).json(
    renderBudgetSummary({
      month,
      year,
      totalBudget,
      totalSpent,
      budgetCount: budgets.length,
      exceededCount,
      warningCount,
    })
  );
}

async function createBudget(req, res) {
  const errors = validateBudget(req.body, false);
  if (Object.keys(errors).length > 0) throw validationError(errors);

  const { category, amount, month, year } = req.body;
  const userId = req.user.id;

  const exists = await budgetModel.findDuplicate(userId, category, month, year);
  if (exists) {
    throw validationError([`A budget for '${category}' already exists for ${month}/${year}.`]);
  }

  const created = await budgetModel.create(userId, { category, amount, month, year });
  const spent = await budgetModel.getSpentAmount(userId, created.category, created.month, created.year);
  return res.status(201).json(renderBudget(created, spent));
}

async function getBudget(req, res) {
  const budget = await budgetModel.findById(req.params.id, req.user.id);
  if (!budget) {
    return res.status(404).json({ detail: 'Not found.' });
  }

  const spent = await budgetModel.getSpentAmount(req.user.id, budget.category, budget.month, budget.year);
  return res.status(200).json(renderBudget(budget, spent));
}

async function updateBudget(req, res) {
  const errors = validateBudget(req.body, false);
  if (Object.keys(errors).length > 0) throw validationError(errors);

  const existing = await budgetModel.findById(req.params.id, req.user.id);
  if (!existing) {
    return res.status(404).json({ detail: 'Not found.' });
  }

  const { category, amount, month, year } = req.body;
  const userId = req.user.id;

  const exists = await budgetModel.findDuplicate(userId, category, month, year, req.params.id);
  if (exists) {
    throw validationError([`A budget for '${category}' already exists for ${month}/${year}.`]);
  }

  const updated = await budgetModel.update(req.params.id, userId, { category, amount, month, year });
  const spent = await budgetModel.getSpentAmount(userId, updated.category, updated.month, updated.year);
  return res.status(200).json(renderBudget(updated, spent));
}

async function patchBudget(req, res) {
  const errors = validateBudget(req.body, true);
  if (Object.keys(errors).length > 0) throw validationError(errors);

  const current = await budgetModel.findById(req.params.id, req.user.id);
  if (!current) {
    return res.status(404).json({ detail: 'Not found.' });
  }

  const userId = req.user.id;
  const newCategory = req.body.category !== undefined ? req.body.category.trim() : current.category;
  const newMonth = req.body.month !== undefined ? parseInt(req.body.month, 10) : current.month;
  const newYear = req.body.year !== undefined ? parseInt(req.body.year, 10) : current.year;

  const exists = await budgetModel.findDuplicate(userId, newCategory, newMonth, newYear, req.params.id);
  if (exists) {
    throw validationError([`A budget for '${newCategory}' already exists for ${newMonth}/${newYear}.`]);
  }

  const updated = await budgetModel.patch(req.params.id, userId, current, req.body);
  const spent = await budgetModel.getSpentAmount(userId, updated.category, updated.month, updated.year);
  return res.status(200).json(renderBudget(updated, spent));
}

async function deleteBudget(req, res) {
  const deleted = await budgetModel.remove(req.params.id, req.user.id);
  if (!deleted) {
    return res.status(404).json({ detail: 'Not found.' });
  }
  return res.status(200).json({ message: 'Budget deleted successfully.' });
}

export {
  listBudgets,
  getBudgetSummary,
  createBudget,
  getBudget,
  updateBudget,
  patchBudget,
  deleteBudget,
};
export default {
  listBudgets,
  getBudgetSummary,
  createBudget,
  getBudget,
  updateBudget,
  patchBudget,
  deleteBudget,
};
