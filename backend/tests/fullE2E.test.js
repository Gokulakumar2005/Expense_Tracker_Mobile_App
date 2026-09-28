import http from 'http';
import https from 'https';
import assert from 'assert';
import app from '../src/server.js';
import { pool } from '../src/config/db.js';

function request(baseUrl, method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const isHttps = baseUrl.startsWith('https://');
    const urlObj = new URL(baseUrl + path);
    const bodyStr = body ? JSON.stringify(body) : '';

    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(bodyStr),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method,
      headers,
    };

    const client = isHttps ? https : http;
    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

async function runEndToEndScenario(targetUrl, targetName) {
  console.log(`\n======================================================`);
  console.log(`Running End-to-End Functional Test on: ${targetName}`);
  console.log(`Base URL: ${targetUrl}`);
  console.log(`======================================================\n`);

  const ts = Date.now();
  const testEmail = `e2e_tester_${ts}@pockettrack.com`;
  const testPassword = 'SecurePassword@2026';
  const firstName = 'Alex';
  const lastName = 'Morgan';

  console.log(`Step 1: Registering new user account (${testEmail})...`);
  const regRes = await request(targetUrl, 'POST', '/api/auth/register/', {
    first_name: firstName,
    last_name: lastName,
    email: testEmail,
    password: testPassword,
    confirm_password: testPassword,
  });
  assert.strictEqual(regRes.status, 201, `Expected status 201 on register, got ${regRes.status}`);
  assert.ok(regRes.body.tokens.access, 'Should return access token');
  assert.ok(regRes.body.tokens.refresh, 'Should return refresh token');
  assert.strictEqual(regRes.body.user.email, testEmail);
  console.log('  -> Registration successful!');

  console.log('Step 2: Logging in with the newly created account...');
  const loginRes = await request(targetUrl, 'POST', '/api/auth/login/', {
    email: testEmail,
    password: testPassword,
  });
  assert.strictEqual(loginRes.status, 200, `Expected status 200 on login, got ${loginRes.status}`);
  const accessToken = loginRes.body.tokens.access;
  const refreshToken = loginRes.body.tokens.refresh;
  assert.ok(accessToken, 'Should return access token');
  assert.ok(refreshToken, 'Should return refresh token');
  console.log('  -> Login successful, JWT tokens acquired!');

  console.log('Step 3: Checking User Profile...');
  const profileRes = await request(targetUrl, 'GET', '/api/auth/profile/', null, accessToken);
  assert.strictEqual(profileRes.status, 200);
  assert.strictEqual(profileRes.body.first_name, firstName);
  assert.strictEqual(profileRes.body.email, testEmail);

  const updateProfileRes = await request(targetUrl, 'PUT', '/api/auth/profile/', {
    first_name: 'Alexander',
    last_name: 'Morgan',
  }, accessToken);
  assert.strictEqual(updateProfileRes.status, 200);
  assert.strictEqual(updateProfileRes.body.first_name, 'Alexander');
  console.log('  -> Profile verified and updated successfully!');

  console.log('Step 4: Fetching Transaction Categories...');
  const catRes = await request(targetUrl, 'GET', '/api/transactions/categories/', null, accessToken);
  assert.strictEqual(catRes.status, 200);
  assert.ok(Array.isArray(catRes.body.expense_categories));
  assert.ok(Array.isArray(catRes.body.income_categories));
  console.log(`  -> Retrieved ${catRes.body.expense_categories.length} expense and ${catRes.body.income_categories.length} income categories.`);

  console.log('Step 5: Creating Income and Expense Transactions...');
  const dateStr = new Date().toISOString().split('T')[0];

  const salaryRes = await request(targetUrl, 'POST', '/api/transactions/', {
    title: 'Monthly Salary',
    amount: 5000.00,
    transaction_type: 'INCOME',
    category: 'Salary',
    description: 'Corporate payroll',
    transaction_date: dateStr,
  }, accessToken);
  assert.strictEqual(salaryRes.status, 201);
  const salaryId = salaryRes.body.id;

  const freelanceRes = await request(targetUrl, 'POST', '/api/transactions/', {
    title: 'Consulting Project',
    amount: 1200.00,
    transaction_type: 'INCOME',
    category: 'Freelance',
    description: 'Mobile app design',
    transaction_date: dateStr,
  }, accessToken);
  assert.strictEqual(freelanceRes.status, 201);

  const foodRes = await request(targetUrl, 'POST', '/api/transactions/', {
    title: 'Groceries Supermarket',
    amount: 350.00,
    transaction_type: 'EXPENSE',
    category: 'Food',
    description: 'Weekly organic groceries',
    transaction_date: dateStr,
  }, accessToken);
  assert.strictEqual(foodRes.status, 201);

  const transportRes = await request(targetUrl, 'POST', '/api/transactions/', {
    title: 'Metro Pass',
    amount: 120.00,
    transaction_type: 'EXPENSE',
    category: 'Transport',
    description: 'Monthly commute pass',
    transaction_date: dateStr,
  }, accessToken);
  assert.strictEqual(transportRes.status, 201);

  const rentRes = await request(targetUrl, 'POST', '/api/transactions/', {
    title: 'Apartment Rent',
    amount: 1500.00,
    transaction_type: 'EXPENSE',
    category: 'Rent',
    description: 'Monthly apartment lease',
    transaction_date: dateStr,
  }, accessToken);
  assert.strictEqual(rentRes.status, 201);
  console.log('  -> Created 2 income transactions ($6,200) and 3 expense transactions ($1,970).');

  console.log('Step 6: Listing and Filtering Transactions...');
  const txList = await request(targetUrl, 'GET', '/api/transactions/?ordering=newest', null, accessToken);
  assert.strictEqual(txList.status, 200);
  assert.strictEqual(txList.body.count, 5);
  assert.strictEqual(txList.body.results.length, 5);

  const expenseOnly = await request(targetUrl, 'GET', '/api/transactions/?transaction_type=EXPENSE', null, accessToken);
  assert.strictEqual(expenseOnly.status, 200);
  assert.strictEqual(expenseOnly.body.count, 3);

  const searchFood = await request(targetUrl, 'GET', '/api/transactions/?search=Groceries', null, accessToken);
  assert.strictEqual(searchFood.status, 200);
  assert.strictEqual(searchFood.body.count, 1);
  console.log('  -> Transactions query, pagination, filtering, and search verified!');

  console.log('Step 7: Testing Transaction Update and Delete...');
  const txToUpdate = await request(targetUrl, 'PUT', `/api/transactions/${salaryId}/`, {
    title: 'Monthly Salary (with bonus)',
    amount: 5500.00,
    transaction_type: 'INCOME',
    category: 'Salary',
    description: 'Payroll plus quarterly bonus',
    transaction_date: dateStr,
  }, accessToken);
  assert.strictEqual(txToUpdate.status, 200);
  assert.strictEqual(txToUpdate.body.title, 'Monthly Salary (with bonus)');
  assert.strictEqual(parseFloat(txToUpdate.body.amount), 5500);

  const tempTx = await request(targetUrl, 'POST', '/api/transactions/', {
    title: 'Coffee to delete',
    amount: 5.50,
    transaction_type: 'EXPENSE',
    category: 'Food',
    description: 'Quick espresso',
    transaction_date: dateStr,
  }, accessToken);
  const tempId = tempTx.body.id;

  const delRes = await request(targetUrl, 'DELETE', `/api/transactions/${tempId}/`, null, accessToken);
  assert.strictEqual(delRes.status, 200);
  console.log('  -> Transaction update and deletion verified!');

  console.log('Step 8: Creating and Testing Budgets...');
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const foodBudgetRes = await request(targetUrl, 'POST', '/api/budgets/', {
    category: 'Food',
    amount: 500.00,
    month: currentMonth,
    year: currentYear,
  }, accessToken);
  assert.strictEqual(foodBudgetRes.status, 201);
  assert.strictEqual(parseFloat(foodBudgetRes.body.amount), 500);
  assert.strictEqual(parseFloat(foodBudgetRes.body.spent), 350);
  assert.strictEqual(parseFloat(foodBudgetRes.body.remaining), 150);
  assert.strictEqual(foodBudgetRes.body.percentage_used, 70);
  assert.strictEqual(foodBudgetRes.body.is_exceeded, false);

  const transportBudgetRes = await request(targetUrl, 'POST', '/api/budgets/', {
    category: 'Transport',
    amount: 150.00,
    month: currentMonth,
    year: currentYear,
  }, accessToken);
  assert.strictEqual(transportBudgetRes.status, 201);
  assert.strictEqual(parseFloat(transportBudgetRes.body.spent), 120);
  assert.strictEqual(transportBudgetRes.body.is_warning, true);

  const budgetSummaryRes = await request(targetUrl, 'GET', `/api/budgets/summary/?month=${currentMonth}&year=${currentYear}`, null, accessToken);
  assert.strictEqual(budgetSummaryRes.status, 200);
  assert.strictEqual(budgetSummaryRes.body.total_budget, 650);
  assert.strictEqual(budgetSummaryRes.body.total_spent, 470);
  assert.strictEqual(budgetSummaryRes.body.remaining_budget, 180);
  console.log('  -> Budget tracking, spent amounts, percentages, warning alerts, and summary verified!');

  console.log('Step 9: Checking Dashboard Metrics...');
  const dashRes = await request(targetUrl, 'GET', '/api/dashboard/', null, accessToken);
  assert.strictEqual(dashRes.status, 200);
  assert.strictEqual(dashRes.body.total_income, 6700);
  assert.strictEqual(dashRes.body.total_expense, 1970);
  assert.strictEqual(dashRes.body.total_balance, 4730);
  assert.strictEqual(dashRes.body.monthly_income, 6700);
  assert.strictEqual(dashRes.body.monthly_expense, 1970);
  assert.ok(Array.isArray(dashRes.body.recent_transactions));
  assert.ok(dashRes.body.recent_transactions.length > 0);
  assert.ok(Array.isArray(dashRes.body.category_summary));
  console.log('  -> Dashboard balance ($4,730), income ($6,700), expense ($1,970), and categories verified!');

  console.log('Step 10: Checking Reports & Trends...');
  const reportsRes = await request(targetUrl, 'GET', `/api/dashboard/reports/?period=current_month`, null, accessToken);
  assert.strictEqual(reportsRes.status, 200);
  assert.strictEqual(reportsRes.body.income_total, 6700);
  assert.strictEqual(reportsRes.body.expense_total, 1970);
  assert.strictEqual(reportsRes.body.net_savings, 4730);
  assert.ok(reportsRes.body.savings_rate > 0);
  assert.ok(Array.isArray(reportsRes.body.monthly_trends));
  assert.strictEqual(reportsRes.body.monthly_trends.length, 6);
  assert.ok(Array.isArray(reportsRes.body.budget_usage));
  console.log(`  -> Reports verified! Savings rate: ${reportsRes.body.savings_rate}%, Trends: 6 months.`);

  console.log('Step 11: Testing Token Refresh...');
  const refreshRes = await request(targetUrl, 'POST', '/api/auth/refresh/', {
    refresh: refreshToken,
  });
  assert.strictEqual(refreshRes.status, 200);
  assert.ok(refreshRes.body.access, 'Should return fresh access token');
  const freshAccess = refreshRes.body.access;

  const authVerify = await request(targetUrl, 'GET', '/api/auth/profile/', null, freshAccess);
  assert.strictEqual(authVerify.status, 200);
  console.log('  -> Token refresh verified!');

  console.log('Step 12: Testing Security & Authentication Enforcement...');
  const noAuthRes = await request(targetUrl, 'GET', '/api/transactions/', null, null);
  assert.strictEqual(noAuthRes.status, 401);

  const fakeAuthRes = await request(targetUrl, 'GET', '/api/dashboard/', null, 'invalid_token_123');
  assert.strictEqual(fakeAuthRes.status, 401);
  console.log('  -> Security and authentication guards verified!');

  console.log(`\n>>> SUCCESS: All 12 Functional Test Steps PASSED for ${targetName}! <<<\n`);
}

async function runAll() {
  console.log('======================================================');
  console.log('STARTING FULL SYSTEM END-TO-END VALIDATION');
  console.log('======================================================');

  const localServer = app.listen(0);
  await new Promise((resolve) => localServer.once('listening', resolve));
  const localPort = localServer.address().port;
  const localUrl = `http://127.0.0.1:${localPort}`;

  try {
    await runEndToEndScenario(localUrl, 'LOCAL EXPRESS BACKEND');

    const liveUrl = 'https://expense-tracker-mobile-app-backend-j1ep.onrender.com';
    await runEndToEndScenario(liveUrl, 'LIVE RENDER BACKEND');

    console.log('======================================================');
    console.log('ALL LOCAL AND LIVE BACKEND TESTS PASSED 100%!');
    console.log('======================================================');
  } finally {
    localServer.close();
    await pool.end();
  }
}

runAll().catch((err) => {
  console.error('\nE2E Test Failed:', err);
  pool.end();
  process.exit(1);
});
