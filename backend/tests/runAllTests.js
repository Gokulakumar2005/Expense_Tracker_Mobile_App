import testPasswordUtils from './utils.test.js';
import testViews from './views.test.js';
import testMiddlewares from './middlewares.test.js';
import testModels from './models.test.js';
import testApi from './api.test.js';
import { pool } from '../src/config/db.js';

async function runAll() {
  console.log('====================================');
  console.log('Starting Test Suite for All Files (ESM)...');
  console.log('====================================\n');

  try {
    await testPasswordUtils();
    await testViews();
    await testMiddlewares();
    await testModels();
    await testApi();

    console.log('\n====================================');
    console.log('All Test Suites Passed Successfully!');
    console.log('====================================');
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('\nTest Suite Failed:', err.message);
    await pool.end();
    process.exit(1);
  }
}

runAll();
