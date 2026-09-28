import http from 'http';
import app from '../src/server.js';

function makeRequest(server, method, path, body, token) {
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

async function testApi() {
  console.log('Testing Express API endpoints...');

  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));

  try {
    const health = await makeRequest(server, 'GET', '/health/');
    if (health.status !== 200 || health.body.status !== 'ok') {
      throw new Error(`Health check failed: ${JSON.stringify(health)}`);
    }

    const ts = Date.now();
    const testEmail = `test_esm_${ts}@pockettrack.com`;

    const reg = await makeRequest(server, 'POST', '/api/auth/register/', {
      first_name: 'ESM',
      last_name: 'Tester',
      email: testEmail,
      password: 'TestPassword123',
      confirm_password: 'TestPassword123',
    });
    if (reg.status !== 201 || !reg.body.tokens.access) {
      throw new Error(`Registration failed: ${JSON.stringify(reg)}`);
    }

    const regDup = await makeRequest(server, 'POST', '/api/auth/register/', {
      first_name: 'ESM',
      last_name: 'Tester',
      email: testEmail,
      password: 'TestPassword123',
      confirm_password: 'TestPassword123',
    });
    if (regDup.status !== 400) {
      throw new Error(`Duplicate registration should return 400: ${regDup.status}`);
    }

    const login = await makeRequest(server, 'POST', '/api/auth/login/', {
      email: 'demo@pockettrack.com',
      password: 'PocketTrack@2026',
    });
    if (login.status !== 200 || !login.body.tokens.access) {
      throw new Error(`Login failed: ${JSON.stringify(login)}`);
    }

    const accessToken = login.body.tokens.access;
    const refreshToken = login.body.tokens.refresh;

    const badLogin = await makeRequest(server, 'POST', '/api/auth/login/', {
      email: 'demo@pockettrack.com',
      password: 'WrongPassword',
    });
    if (badLogin.status !== 400) {
      throw new Error(`Bad login should return 400: ${badLogin.status}`);
    }

    const refreshed = await makeRequest(server, 'POST', '/api/auth/refresh/', {
      refresh: refreshToken,
    });
    if (refreshed.status !== 200 || !refreshed.body.access) {
      throw new Error(`Token refresh failed: ${JSON.stringify(refreshed)}`);
    }

    const profile = await makeRequest(server, 'GET', '/api/auth/profile/', null, accessToken);
    if (profile.status !== 200 || !profile.body.first_name) {
      throw new Error(`Get profile failed: ${JSON.stringify(profile)}`);
    }

    const profileUpdate = await makeRequest(server, 'PUT', '/api/auth/profile/', {
      first_name: 'Demo',
      last_name: 'User',
    }, accessToken);
    if (profileUpdate.status !== 200) {
      throw new Error(`Update profile failed: ${JSON.stringify(profileUpdate)}`);
    }

    const txList = await makeRequest(server, 'GET', '/api/transactions/', null, accessToken);
    if (txList.status !== 200 || !Array.isArray(txList.body.results)) {
      throw new Error(`List transactions failed: ${JSON.stringify(txList)}`);
    }

    const cats = await makeRequest(server, 'GET', '/api/transactions/categories/', null, accessToken);
    if (cats.status !== 200 || !Array.isArray(cats.body.expense_categories)) {
      throw new Error(`Get categories failed: ${JSON.stringify(cats)}`);
    }

    const txCreate = await makeRequest(server, 'POST', '/api/transactions/', {
      title: 'ESM Test Transaction',
      amount: 45.50,
      transaction_type: 'EXPENSE',
      category: 'Food',
      description: 'Testing ESM controller',
      transaction_date: '2026-09-01',
    }, accessToken);
    if (txCreate.status !== 201 || !txCreate.body.id) {
      throw new Error(`Create transaction failed: ${JSON.stringify(txCreate)}`);
    }

    const txId = txCreate.body.id;

    const txGet = await makeRequest(server, 'GET', `/api/transactions/${txId}/`, null, accessToken);
    if (txGet.status !== 200 || txGet.body.id !== txId) {
      throw new Error(`Get transaction failed: ${JSON.stringify(txGet)}`);
    }

    const txPut = await makeRequest(server, 'PUT', `/api/transactions/${txId}/`, {
      title: 'ESM Updated Transaction',
      amount: 50.00,
      transaction_type: 'EXPENSE',
      category: 'Transport',
      description: 'Updated via ESM',
      transaction_date: '2026-09-02',
    }, accessToken);
    if (txPut.status !== 200 || txPut.body.title !== 'ESM Updated Transaction') {
      throw new Error(`Update transaction failed: ${JSON.stringify(txPut)}`);
    }

    const txDel = await makeRequest(server, 'DELETE', `/api/transactions/${txId}/`, null, accessToken);
    if (txDel.status !== 200) {
      throw new Error(`Delete transaction failed: ${JSON.stringify(txDel)}`);
    }

    const bdgList = await makeRequest(server, 'GET', '/api/budgets/', null, accessToken);
    if (bdgList.status !== 200 || !Array.isArray(bdgList.body.results)) {
      throw new Error(`List budgets failed: ${JSON.stringify(bdgList)}`);
    }

    const bdgSummary = await makeRequest(server, 'GET', '/api/budgets/summary/?month=9&year=2026', null, accessToken);
    if (bdgSummary.status !== 200 || typeof bdgSummary.body.total_budget !== 'number') {
      throw new Error(`Budget summary failed: ${JSON.stringify(bdgSummary)}`);
    }

    const bdgCreate = await makeRequest(server, 'POST', '/api/budgets/', {
      category: `ESMTestCat_${ts}`,
      amount: 300.00,
      month: 9,
      year: 2026,
    }, accessToken);
    if (bdgCreate.status !== 201 || !bdgCreate.body.id) {
      throw new Error(`Create budget failed: ${JSON.stringify(bdgCreate)}`);
    }

    const bdgId = bdgCreate.body.id;

    const bdgGet = await makeRequest(server, 'GET', `/api/budgets/${bdgId}/`, null, accessToken);
    if (bdgGet.status !== 200 || bdgGet.body.id !== bdgId) {
      throw new Error(`Get budget failed: ${JSON.stringify(bdgGet)}`);
    }

    const bdgDel = await makeRequest(server, 'DELETE', `/api/budgets/${bdgId}/`, null, accessToken);
    if (bdgDel.status !== 200) {
      throw new Error(`Delete budget failed: ${JSON.stringify(bdgDel)}`);
    }

    const dash = await makeRequest(server, 'GET', '/api/dashboard/', null, accessToken);
    if (dash.status !== 200 || typeof dash.body.total_balance !== 'number') {
      throw new Error(`Dashboard failed: ${JSON.stringify(dash)}`);
    }

    const reports = await makeRequest(server, 'GET', '/api/dashboard/reports/?period=current_month', null, accessToken);
    if (reports.status !== 200 || !Array.isArray(reports.body.monthly_trends)) {
      throw new Error(`Reports failed: ${JSON.stringify(reports)}`);
    }

    const unauth = await makeRequest(server, 'GET', '/api/transactions/', null, null);
    if (unauth.status !== 401) {
      throw new Error(`Unauthenticated should return 401: ${unauth.status}`);
    }

    console.log('  All API endpoint tests passed.');
  } finally {
    server.close();
  }
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  testApi().catch((err) => {
    console.error('API test failed:', err);
    process.exit(1);
  });
}

export { testApi };
export default testApi;
