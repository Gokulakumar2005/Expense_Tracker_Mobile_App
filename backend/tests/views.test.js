import assert from 'assert';
import { renderUser } from '../src/views/userView.js';
import { renderTransaction, renderTransactions } from '../src/views/transactionView.js';
import { renderBudget, renderBudgetSummary } from '../src/views/budgetView.js';

async function testViews() {
  console.log('Testing Views...');

  const mockUser = {
    id: 1,
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    password: 'secret_hash',
    is_staff: false,
    created_at: '2026-09-01T00:00:00Z',
    updated_at: '2026-09-01T00:00:00Z',
  };
  const renderedUser = renderUser(mockUser);
  assert.strictEqual(renderedUser.id, 1);
  assert.strictEqual(renderedUser.email, 'john@example.com');
  assert.strictEqual(renderedUser.password, undefined);

  const mockTx = {
    id: 10,
    user_id: 1,
    title: 'Groceries',
    amount: '150.50',
    transaction_type: 'EXPENSE',
    category: 'Food',
    description: 'Weekly food',
    transaction_date: '2026-09-15',
    created_at: '2026-09-15T00:00:00Z',
    updated_at: '2026-09-15T00:00:00Z',
  };
  const renderedTx = renderTransaction(mockTx);
  assert.strictEqual(renderedTx.id, 10);
  assert.strictEqual(renderedTx.user, 1);
  assert.strictEqual(renderedTx.formatted_amount, '150.50');

  const renderedList = renderTransactions([mockTx]);
  assert.strictEqual(renderedList.length, 1);

  const mockBudget = {
    id: 5,
    user_id: 1,
    category: 'Food',
    amount: '500.00',
    month: 9,
    year: 2026,
    created_at: '2026-09-01T00:00:00Z',
    updated_at: '2026-09-01T00:00:00Z',
  };
  const renderedBdg = renderBudget(mockBudget, 150.50);
  assert.strictEqual(renderedBdg.id, 5);
  assert.strictEqual(renderedBdg.spent, '150.50');
  assert.strictEqual(renderedBdg.remaining, '349.50');
  assert.strictEqual(renderedBdg.percentage_used, 30.1);
  assert.strictEqual(renderedBdg.is_exceeded, false);

  const summary = renderBudgetSummary({
    month: 9,
    year: 2026,
    totalBudget: 1000,
    totalSpent: 400,
    budgetCount: 2,
    exceededCount: 0,
    warningCount: 0,
  });
  assert.strictEqual(summary.total_budget, 1000);
  assert.strictEqual(summary.total_spent, 400);
  assert.strictEqual(summary.remaining_budget, 600);
  assert.strictEqual(summary.percentage_used, 40);

  console.log('  All View tests passed.');
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  testViews().catch((err) => {
    console.error('Views test failed:', err);
    process.exit(1);
  });
}

export { testViews };
export default testViews;
