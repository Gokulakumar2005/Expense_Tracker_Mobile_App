import transactionModel from '../models/transactionModel.js';
import budgetModel from '../models/budgetModel.js';
import { renderTransaction } from '../views/transactionView.js';
import { renderBudget } from '../views/budgetView.js';

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const MONTH_ABBR = [
  '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

async function getDashboard(req, res) {
  const userId = req.user.id;
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const totalIncome = await transactionModel.getTotalByType(userId, 'INCOME');
  const totalExpense = await transactionModel.getTotalByType(userId, 'EXPENSE');
  const totalBalance = totalIncome - totalExpense;

  const monthlyIncome = await transactionModel.getMonthlyByType(userId, 'INCOME', currentMonth, currentYear);
  const monthlyExpense = await transactionModel.getMonthlyByType(userId, 'EXPENSE', currentMonth, currentYear);

  const budgets = await budgetModel.getMonthlyBudgets(userId, currentMonth, currentYear);
  const monthlyBudget = budgets.reduce((sum, b) => sum + parseFloat(b.amount), 0);

  let budgetSpent = 0;
  for (const b of budgets) {
    budgetSpent += await budgetModel.getSpentAmount(userId, b.category, b.month, b.year);
  }

  let remainingBudget, budgetPercentage;
  if (monthlyBudget > 0) {
    remainingBudget = monthlyBudget - budgetSpent;
    budgetPercentage = Math.min(100, Math.round((budgetSpent / monthlyBudget) * 1000) / 10);
  } else {
    remainingBudget = monthlyIncome - monthlyExpense;
    budgetPercentage = 0;
  }

  const recentRows = await transactionModel.getRecent(userId, 5);
  const recentTransactions = recentRows.map(renderTransaction);

  const categoryRows = await transactionModel.getCategorySummary(userId, currentMonth, currentYear);
  const categorySummary = categoryRows.map((cat) => {
    const amount = parseFloat(cat.total_amount) || 0;
    const pct = monthlyExpense > 0 ? Math.round((amount / monthlyExpense) * 1000) / 10 : 0;
    return {
      category: cat.category,
      total_amount: parseFloat(amount.toFixed(2)),
      percentage: pct,
      transaction_count: parseInt(cat.transaction_count, 10),
    };
  });

  return res.status(200).json({
    total_balance: parseFloat(totalBalance.toFixed(2)),
    total_income: parseFloat(totalIncome.toFixed(2)),
    total_expense: parseFloat(totalExpense.toFixed(2)),
    monthly_income: parseFloat(monthlyIncome.toFixed(2)),
    monthly_expense: parseFloat(monthlyExpense.toFixed(2)),
    monthly_budget: parseFloat(monthlyBudget.toFixed(2)),
    remaining_budget: parseFloat(remainingBudget.toFixed(2)),
    budget_spent: parseFloat(budgetSpent.toFixed(2)),
    budget_percentage: budgetPercentage,
    recent_transactions: recentTransactions,
    category_summary: categorySummary,
    current_month: currentMonth,
    current_year: currentYear,
    current_month_name: MONTH_NAMES[currentMonth],
  });
}

async function getReports(req, res) {
  const userId = req.user.id;
  const now = new Date();
  const q = req.query;

  let targetMonth, targetYear, periodLabel;
  const period = q.period || 'current_month';

  if (q.month && q.year) {
    targetMonth = parseInt(q.month, 10);
    targetYear = parseInt(q.year, 10);
    if (isNaN(targetMonth) || isNaN(targetYear)) {
      targetMonth = now.getMonth() + 1;
      targetYear = now.getFullYear();
    }
    periodLabel = `${MONTH_NAMES[targetMonth]} ${targetYear}`;
  } else if (period === 'previous_month') {
    if (now.getMonth() === 0) {
      targetMonth = 12;
      targetYear = now.getFullYear() - 1;
    } else {
      targetMonth = now.getMonth();
      targetYear = now.getFullYear();
    }
    periodLabel = `${MONTH_NAMES[targetMonth]} ${targetYear}`;
  } else {
    targetMonth = now.getMonth() + 1;
    targetYear = now.getFullYear();
    periodLabel = `${MONTH_NAMES[targetMonth]} ${targetYear}`;
  }

  const incomeTotal = await transactionModel.getMonthlyByType(userId, 'INCOME', targetMonth, targetYear);
  const expenseTotal = await transactionModel.getMonthlyByType(userId, 'EXPENSE', targetMonth, targetYear);
  const netSavings = incomeTotal - expenseTotal;
  const savingsRate = incomeTotal > 0 ? Math.round((netSavings / incomeTotal) * 1000) / 10 : 0;

  const catRows = await transactionModel.getCategorySummary(userId, targetMonth, targetYear);
  const categoryBreakdown = catRows.map((cat) => {
    const amount = parseFloat(cat.total_amount) || 0;
    const pct = expenseTotal > 0 ? Math.round((amount / expenseTotal) * 1000) / 10 : 0;
    return {
      category: cat.category,
      total_amount: parseFloat(amount.toFixed(2)),
      percentage: pct,
      transaction_count: parseInt(cat.transaction_count, 10),
    };
  });

  const monthlyTrends = [];
  for (let i = 5; i >= 0; i--) {
    let m = (now.getMonth() + 1) - i;
    let y = now.getFullYear();
    while (m <= 0) {
      m += 12;
      y -= 1;
    }

    const mIncome = await transactionModel.getMonthlyByType(userId, 'INCOME', m, y);
    const mExpense = await transactionModel.getMonthlyByType(userId, 'EXPENSE', m, y);

    monthlyTrends.push({
      month: m,
      year: y,
      month_name: MONTH_ABBR[m],
      income: parseFloat(mIncome.toFixed(2)),
      expense: parseFloat(mExpense.toFixed(2)),
      net_savings: parseFloat((mIncome - mExpense).toFixed(2)),
    });
  }

  const budgets = await budgetModel.getMonthlyBudgets(userId, targetMonth, targetYear);
  const budgetUsage = await Promise.all(
    budgets.map(async (b) => {
      const spent = await budgetModel.getSpentAmount(userId, b.category, b.month, b.year);
      return renderBudget(b, spent);
    })
  );

  return res.status(200).json({
    period,
    period_label: periodLabel,
    target_month: targetMonth,
    target_year: targetYear,
    income_total: parseFloat(incomeTotal.toFixed(2)),
    expense_total: parseFloat(expenseTotal.toFixed(2)),
    net_savings: parseFloat(netSavings.toFixed(2)),
    savings_rate: savingsRate,
    category_breakdown: categoryBreakdown,
    monthly_trends: monthlyTrends,
    budget_usage: budgetUsage,
  });
}

export {
  getDashboard,
  getReports,
};
export default {
  getDashboard,
  getReports,
};
