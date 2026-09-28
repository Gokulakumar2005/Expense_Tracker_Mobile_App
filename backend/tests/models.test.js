import assert from 'assert';
import userModel from '../src/models/userModel.js';
import transactionModel from '../src/models/transactionModel.js';
import budgetModel from '../src/models/budgetModel.js';

async function testModels() {
  console.log('Testing Models directly against DB...');

  const user = await userModel.findByEmail('demo@pockettrack.com');
  assert.ok(user, 'Demo user should exist in DB');
  assert.strictEqual(user.email, 'demo@pockettrack.com');

  const userById = await userModel.findById(user.id);
  assert.ok(userById, 'Demo user by id should exist');

  assert.ok(Array.isArray(transactionModel.EXPENSE_CATEGORIES));
  assert.ok(Array.isArray(transactionModel.INCOME_CATEGORIES));

  const totalInc = await transactionModel.getTotalByType(user.id, 'INCOME');
  assert.strictEqual(typeof totalInc, 'number');

  const monthlyInc = await transactionModel.getMonthlyByType(user.id, 'INCOME', 9, 2026);
  assert.strictEqual(typeof monthlyInc, 'number');

  const recent = await transactionModel.getRecent(user.id, 3);
  assert.ok(Array.isArray(recent));

  const categories = await transactionModel.getCategorySummary(user.id, 9, 2026);
  assert.ok(Array.isArray(categories));

  const budgets = await budgetModel.getMonthlyBudgets(user.id, 9, 2026);
  assert.ok(Array.isArray(budgets));

  const spent = await budgetModel.getSpentAmount(user.id, 'Food', 9, 2026);
  assert.strictEqual(typeof spent, 'number');

  console.log('  All Model tests passed.');
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  testModels().catch((err) => {
    console.error('Models test failed:', err);
    process.exit(1);
  });
}

export { testModels };
export default testModels;
