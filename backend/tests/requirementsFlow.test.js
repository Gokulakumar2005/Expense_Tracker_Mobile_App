import http from 'http';
import assert from 'assert';
import app from '../src/server.js';
import { pool } from '../src/config/db.js';

function request(server, method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const port = server.address().port;
    const bodyStr = body ? JSON.stringify(body) : '';

    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(bodyStr),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const options = {
      hostname: '127.0.0.1',
      port,
      path,
      method,
      headers,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    });

    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

async function runRequirementsTests() {
  console.log('====================================================');
  console.log('Running Comprehensive Verification Suite (Tests 1-8)');
  console.log('====================================================\n');

  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));

  try {
    const ts = Date.now();

    // Setup User A
    const userAEmail = `user_a_${ts}@pockettrack.com`;
    const regA = await request(server, 'POST', '/api/auth/register/', {
      first_name: 'UserA',
      last_name: 'Tester',
      email: userAEmail,
      password: 'SecurePassword123!',
      confirm_password: 'SecurePassword123!',
    });
    assert.strictEqual(regA.status, 201, 'User A registration should return 201');
    const tokenA = regA.body.tokens.access;
    const userAId = regA.body.user.id;

    // Setup User B
    const userBEmail = `user_b_${ts}@pockettrack.com`;
    const regB = await request(server, 'POST', '/api/auth/register/', {
      first_name: 'UserB',
      last_name: 'Tester',
      email: userBEmail,
      password: 'SecurePassword123!',
      confirm_password: 'SecurePassword123!',
    });
    assert.strictEqual(regB.status, 201, 'User B registration should return 201');
    const tokenB = regB.body.tokens.access;
    const userBId = regB.body.user.id;

    console.log('Test 1 — Create Budget (Rent = 8000, Food = 5000, Transport = 3000)');
    const bRent = await request(server, 'POST', '/api/budgets/', {
      category: 'Rent',
      amount: 8000,
      month: 9,
      year: 2026,
    }, tokenA);
    assert.strictEqual(bRent.status, 201);
    const rentBudgetId = bRent.body.id;

    const bFood = await request(server, 'POST', '/api/budgets/', {
      category: 'Food',
      amount: 5000,
      month: 9,
      year: 2026,
    }, tokenA);
    assert.strictEqual(bFood.status, 201);

    const bTransport = await request(server, 'POST', '/api/budgets/', {
      category: 'Transport',
      amount: 3000,
      month: 9,
      year: 2026,
    }, tokenA);
    assert.strictEqual(bTransport.status, 201);

    // Verify Total Budget = 16,000
    const summary1 = await request(server, 'GET', '/api/budgets/summary/?month=9&year=2026', null, tokenA);
    assert.strictEqual(summary1.status, 200);
    assert.strictEqual(summary1.body.total_budget, 16000, 'Total Budget must equal 16000');
    console.log('  -> PASS: Total Budget = 16,000');

    console.log('\nTest 2 — Add Expense (Rent Expense = 2000)');
    const txRent = await request(server, 'POST', '/api/transactions/', {
      title: 'Rent Payment',
      amount: 2000,
      transaction_type: 'EXPENSE',
      category: 'Rent',
      transaction_date: '2026-09-05',
    }, tokenA);
    assert.strictEqual(txRent.status, 201);

    // Verify Budget = 8000, Spent = 2000, Remaining = 6000
    const rentBudgetCheck = await request(server, 'GET', `/api/budgets/${rentBudgetId}/`, null, tokenA);
    assert.strictEqual(rentBudgetCheck.status, 200);
    assert.strictEqual(parseFloat(rentBudgetCheck.body.amount), 8000, 'Stored budget amount must remain 8000');
    assert.strictEqual(parseFloat(rentBudgetCheck.body.spent), 2000, 'Spent must be 2000');
    assert.strictEqual(parseFloat(rentBudgetCheck.body.remaining), 6000, 'Remaining must be 6000');
    console.log('  -> PASS: Stored Budget = 8000 (NOT changed to 6000), Spent = 2000, Remaining = 6000');

    console.log('\nTest 3 — Edit Budget (Change Rent Budget 8000 -> 7000)');
    const rentBudgetEdit = await request(server, 'PUT', `/api/budgets/${rentBudgetId}/`, {
      category: 'Rent',
      amount: 7000,
      month: 9,
      year: 2026,
    }, tokenA);
    assert.strictEqual(rentBudgetEdit.status, 200);
    assert.strictEqual(parseFloat(rentBudgetEdit.body.amount), 7000, 'Updated budget must be 7000');
    assert.strictEqual(parseFloat(rentBudgetEdit.body.spent), 2000, 'Spent must still be 2000');
    assert.strictEqual(parseFloat(rentBudgetEdit.body.remaining), 5000, 'Remaining must be 5000');
    console.log('  -> PASS: Budget = 7000, Spent = 2000, Remaining = 5000');

    console.log('\nTest 4 — Overspending (Food Budget = 5000, Food Expense = 6000)');
    const txFood = await request(server, 'POST', '/api/transactions/', {
      title: 'Groceries and dining',
      amount: 6000,
      transaction_type: 'EXPENSE',
      category: 'Food',
      transaction_date: '2026-09-10',
    }, tokenA);
    assert.strictEqual(txFood.status, 201);

    const foodBudgetCheck = await request(server, 'GET', `/api/budgets/${bFood.body.id}/`, null, tokenA);
    assert.strictEqual(foodBudgetCheck.status, 200);
    assert.strictEqual(parseFloat(foodBudgetCheck.body.remaining), -1000, 'Remaining must be -1000');
    assert.strictEqual(foodBudgetCheck.body.is_exceeded, true, 'is_exceeded must be true');
    console.log('  -> PASS: Food Remaining = -1000, is_exceeded = true');

    console.log('\nTest 5 — Monthly Summary (Income, Budget, Expenses, Remaining Budget, Savings)');
    // Add income: 40,000
    const txSalary = await request(server, 'POST', '/api/transactions/', {
      title: 'Monthly Salary',
      amount: 40000,
      transaction_type: 'INCOME',
      category: 'Salary',
      transaction_date: '2026-09-01',
    }, tokenA);
    assert.strictEqual(txSalary.status, 201);

    // Current State for Sept 2026:
    // Total Income = 40,000
    // Total Budget = Rent(7000) + Food(5000) + Transport(3000) = 15,000
    // Total Expenses = Rent(2000) + Food(6000) = 8,000
    // Remaining Budget = 15,000 - 8,000 = 7,000
    // Savings = 40,000 - 8,000 = 32,000
    const reportSept = await request(server, 'GET', '/api/reports/monthly/?month=9&year=2026', null, tokenA);
    assert.strictEqual(reportSept.status, 200);
    assert.strictEqual(reportSept.body.total_income, 40000);
    assert.strictEqual(reportSept.body.total_budget, 15000);
    assert.strictEqual(reportSept.body.total_expenses, 8000);
    assert.strictEqual(reportSept.body.remaining_budget, 7000);
    assert.strictEqual(reportSept.body.savings, 32000);
    console.log('  -> PASS: Income = 40,000, Budget = 15,000, Expenses = 8,000, Remaining = 7,000, Savings = 32,000');

    console.log('\nTest 6 — Month Separation (August 2026 vs September 2026)');
    // Add August transactions and budget
    await request(server, 'POST', '/api/budgets/', {
      category: 'Rent',
      amount: 25000,
      month: 8,
      year: 2026,
    }, tokenA);

    await request(server, 'POST', '/api/transactions/', {
      title: 'August Rent',
      amount: 20000,
      transaction_type: 'EXPENSE',
      category: 'Rent',
      transaction_date: '2026-08-15',
    }, tokenA);

    const reportAug = await request(server, 'GET', '/api/reports/monthly/?month=8&year=2026', null, tokenA);
    assert.strictEqual(reportAug.status, 200);
    assert.strictEqual(reportAug.body.total_budget, 25000);
    assert.strictEqual(reportAug.body.total_expenses, 20000);
    assert.strictEqual(reportAug.body.remaining_budget, 5000);

    // Verify September data was not changed by August
    const reportSeptCheck = await request(server, 'GET', '/api/reports/monthly/?month=9&year=2026', null, tokenA);
    assert.strictEqual(reportSeptCheck.body.total_budget, 15000, 'September total budget must remain 15000');
    assert.strictEqual(reportSeptCheck.body.total_expenses, 8000, 'September expenses must remain 8000');
    console.log('  -> PASS: August and September data are strictly isolated and preserved');

    console.log('\nTest 7 — PDF Generation & Contents');
    const pdfResponse = await request(server, 'GET', '/api/reports/monthly/pdf?month=9&year=2026', null, tokenA);
    assert.strictEqual(pdfResponse.status, 200);
    assert.strictEqual(pdfResponse.headers['content-type'], 'application/pdf');
    const pdfDataStr = typeof pdfResponse.body === 'string' ? pdfResponse.body : pdfResponse.body.toString();
    assert.ok(pdfDataStr.startsWith('%PDF'), 'PDF signature must be present');

    const pdfBase64Res = await request(server, 'GET', '/api/reports/monthly/pdf?month=9&year=2026&format=base64', null, tokenA);
    assert.strictEqual(pdfBase64Res.status, 200);
    assert.ok(pdfBase64Res.body.base64.length > 500, 'Base64 PDF must contain data');
    console.log('  -> PASS: PDF successfully generated with proper headers, %PDF signature and base64 format');

    console.log('\nTest 8 — Security (User Isolation)');
    // User B cannot access User A's budget
    const userBAccessBudgets = await request(server, 'GET', `/api/budgets/${rentBudgetId}/`, null, tokenB);
    assert.strictEqual(userBAccessBudgets.status, 404, 'User B must not see User A budget by ID');

    // User B report must be empty
    const userBReport = await request(server, 'GET', '/api/reports/monthly/?month=9&year=2026', null, tokenB);
    assert.strictEqual(userBReport.body.total_income, 0);
    assert.strictEqual(userBReport.body.total_expenses, 0);
    assert.strictEqual(userBReport.body.total_budget, 0);
    assert.strictEqual(userBReport.body.transactions.length, 0);
    console.log('  -> PASS: User B cannot access User A financial data or report');

    console.log('\n====================================================');
    console.log('All 8 Requirements Tests Passed Successfully!');
    console.log('====================================================\n');
  } finally {
    server.close();
  }
}

runRequirementsTests()
  .then(async () => {
    await pool.end();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error('Requirements test failed:', err);
    await pool.end();
    process.exit(1);
  });
