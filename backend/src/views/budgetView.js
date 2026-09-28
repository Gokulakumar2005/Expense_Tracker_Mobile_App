function renderBudget(budget, spentAmount) {
  const amount = parseFloat(budget.amount);
  const spent = spentAmount || 0;
  const remaining = amount - spent;
  const percentageUsed = amount > 0 ? Math.round((spent / amount) * 1000) / 10 : 0;
  const isExceeded = spent > amount;
  const isWarning = !isExceeded && percentageUsed >= 80 && percentageUsed <= 100;

  return {
    id: budget.id,
    user: budget.user_id,
    category: budget.category,
    amount: budget.amount,
    month: budget.month,
    year: budget.year,
    spent: spent.toFixed(2),
    remaining: remaining.toFixed(2),
    percentage_used: percentageUsed,
    is_exceeded: isExceeded,
    is_warning: isWarning,
    created_at: budget.created_at,
    updated_at: budget.updated_at,
  };
}

function renderBudgetSummary({ month, year, totalBudget, totalSpent, budgetCount, exceededCount, warningCount }) {
  const remaining = totalBudget - totalSpent;
  const percentageUsed = totalBudget > 0
    ? Math.round((totalSpent / totalBudget) * 1000) / 10
    : 0;

  return {
    month,
    year,
    total_budget: parseFloat(totalBudget.toFixed(2)),
    total_spent: parseFloat(totalSpent.toFixed(2)),
    remaining_budget: parseFloat(remaining.toFixed(2)),
    percentage_used: percentageUsed,
    budget_count: budgetCount,
    exceeded_count: exceededCount,
    warning_count: warningCount,
  };
}

export { renderBudget, renderBudgetSummary };
export default { renderBudget, renderBudgetSummary };
