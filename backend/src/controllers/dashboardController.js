import transactionModel from '../models/transactionModel.js';
import budgetModel from '../models/budgetModel.js';
import userModel from '../models/userModel.js';
import { renderTransaction } from '../views/transactionView.js';
import { renderBudget } from '../views/budgetView.js';
import { generateMonthlyReportPdf } from '../utils/pdfGenerator.js';

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
  const currentYear = req.query.year ? parseInt(req.query.year, 10) : now.getFullYear();
  const currentMonth = req.query.month ? parseInt(req.query.month, 10) : now.getMonth() + 1;

  const totalIncome = await transactionModel.getTotalByType(userId, 'INCOME');
  const totalExpense = await transactionModel.getTotalByType(userId, 'EXPENSE');
  const totalBalance = totalIncome - totalExpense;

  const monthlyIncome = await transactionModel.getMonthlyByType(userId, 'INCOME', currentMonth, currentYear);
  const monthlyExpense = await transactionModel.getMonthlyByType(userId, 'EXPENSE', currentMonth, currentYear);

  const budgets = await budgetModel.getMonthlyBudgets(userId, currentMonth, currentYear);
  const monthlyBudget = budgets.reduce((sum, b) => sum + parseFloat(b.amount), 0);

  // Centralized calculations:
  // Remaining Budget = Total Budget - Total Expense (Formula: Remaining = Budget - Spent)
  const remainingBudget = monthlyBudget - monthlyExpense;
  // Savings = Total Income - Total Expense (Savings = Income - Expenses)
  const savings = monthlyIncome - monthlyExpense;
  const budgetSpent = monthlyExpense;
  const budgetPercentage = monthlyBudget > 0 ? Math.round((monthlyExpense / monthlyBudget) * 1000) / 10 : 0;

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

  const categoryBudgets = await Promise.all(
    budgets.map(async (b) => {
      const spent = await budgetModel.getSpentAmount(userId, b.category, b.month, b.year);
      return renderBudget(b, spent);
    })
  );

  return res.status(200).json({
    total_balance: parseFloat(totalBalance.toFixed(2)),
    total_income: parseFloat(totalIncome.toFixed(2)),
    total_expense: parseFloat(totalExpense.toFixed(2)),
    monthly_income: parseFloat(monthlyIncome.toFixed(2)),
    monthly_expense: parseFloat(monthlyExpense.toFixed(2)),
    monthly_budget: parseFloat(monthlyBudget.toFixed(2)),
    remaining_budget: parseFloat(remainingBudget.toFixed(2)),
    savings: parseFloat(savings.toFixed(2)),
    budget_spent: parseFloat(budgetSpent.toFixed(2)),
    budget_percentage: budgetPercentage,
    recent_transactions: recentTransactions,
    category_summary: categorySummary,
    category_budgets: categoryBudgets,
    current_month: currentMonth,
    current_year: currentYear,
    current_month_name: MONTH_NAMES[currentMonth] || `Month ${currentMonth}`,
  });
}

async function getMonthlyFinancialReportData(userId, query) {
  const now = new Date();
  let targetMonth, targetYear, periodLabel;
  const period = query.period || 'current_month';

  if (query.month && query.year) {
    targetMonth = parseInt(query.month, 10);
    targetYear = parseInt(query.year, 10);
    if (isNaN(targetMonth) || isNaN(targetYear) || targetMonth < 1 || targetMonth > 12) {
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
  const budgets = await budgetModel.getMonthlyBudgets(userId, targetMonth, targetYear);
  const totalBudget = budgets.reduce((sum, b) => sum + parseFloat(b.amount), 0);

  // Centralized calculations:
  const remainingBudget = totalBudget - expenseTotal;
  const savings = incomeTotal - expenseTotal;
  const savingsRate = incomeTotal > 0 ? Math.round((savings / incomeTotal) * 1000) / 10 : 0;

  // Category-level budget analysis
  const categories = await Promise.all(
    budgets.map(async (b) => {
      const spent = await budgetModel.getSpentAmount(userId, b.category, b.month, b.year);
      const budgetAmount = parseFloat(b.amount);
      const remaining = budgetAmount - spent;
      const percentageUsed = budgetAmount > 0 ? Math.round((spent / budgetAmount) * 1000) / 10 : 0;
      return {
        id: b.id,
        category: b.category,
        budget: budgetAmount,
        spent: parseFloat(spent.toFixed(2)),
        remaining: parseFloat(remaining.toFixed(2)),
        percentage_used: percentageUsed,
        is_exceeded: spent > budgetAmount,
        is_warning: spent <= budgetAmount && percentageUsed >= 80,
      };
    })
  );

  // Spending breakdown by category
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

  // Month transactions (strictly isolated to targetMonth and targetYear)
  const monthTransactions = await transactionModel.findAll(userId, {
    month: targetMonth,
    year: targetYear,
    ordering: 'newest',
  });
  const transactions = monthTransactions.map(renderTransaction);

  // 6-Month trends
  const monthlyTrends = [];
  for (let i = 5; i >= 0; i--) {
    let m = targetMonth - i;
    let y = targetYear;
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

  // Backward compatible budget_usage
  const budgetUsage = categories.map((c) =>
    renderBudget(
      {
        id: c.id,
        user_id: userId,
        category: c.category,
        amount: c.budget,
        month: targetMonth,
        year: targetYear,
      },
      c.spent
    )
  );

  return {
    period,
    period_label: periodLabel,
    month: targetMonth,
    year: targetYear,
    target_month: targetMonth,
    target_year: targetYear,
    total_income: parseFloat(incomeTotal.toFixed(2)),
    total_budget: parseFloat(totalBudget.toFixed(2)),
    total_expenses: parseFloat(expenseTotal.toFixed(2)),
    income_total: parseFloat(incomeTotal.toFixed(2)),
    expense_total: parseFloat(expenseTotal.toFixed(2)),
    remaining_budget: parseFloat(remainingBudget.toFixed(2)),
    savings: parseFloat(savings.toFixed(2)),
    net_savings: parseFloat(savings.toFixed(2)),
    savings_rate: savingsRate,
    categories,
    budget_usage: budgetUsage,
    category_breakdown: categoryBreakdown,
    transactions,
    monthly_trends: monthlyTrends,
  };
}

async function getReports(req, res) {
  const userId = req.user.id;
  const reportData = await getMonthlyFinancialReportData(userId, req.query);
  return res.status(200).json(reportData);
}

async function downloadMonthlyReportPdf(req, res) {
  const userId = req.user.id;
  const reportData = await getMonthlyFinancialReportData(userId, req.query);
  const user = await userModel.findById(userId);

  const pdfBuffer = await generateMonthlyReportPdf({
    user,
    month: reportData.target_month,
    year: reportData.target_year,
    summary: {
      total_income: reportData.total_income,
      total_budget: reportData.total_budget,
      total_expenses: reportData.total_expenses,
      remaining_budget: reportData.remaining_budget,
      savings: reportData.savings,
    },
    categories: reportData.categories,
    categoryBreakdown: reportData.category_breakdown,
    transactions: reportData.transactions,
  });

  const filename = `PocketTrack_Report_${reportData.target_year}_${String(reportData.target_month).padStart(2, '0')}.pdf`;

  if (req.query.format === 'base64') {
    return res.status(200).json({
      success: true,
      filename,
      month: reportData.target_month,
      year: reportData.target_year,
      base64: pdfBuffer.toString('base64'),
    });
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Length', pdfBuffer.length);
  return res.status(200).send(pdfBuffer);
}

export {
  getDashboard,
  getReports,
  downloadMonthlyReportPdf,
};
export default {
  getDashboard,
  getReports,
  downloadMonthlyReportPdf,
};
