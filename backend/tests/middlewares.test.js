import assert from 'assert';
import { generateTokens } from '../src/middlewares/authMiddleware.js';
import { paginate } from '../src/middlewares/paginationMiddleware.js';
import { validationError } from '../src/middlewares/errorMiddleware.js';

async function testMiddlewares() {
  console.log('Testing Middlewares...');

  const mockUser = { id: 42 };
  const tokens = generateTokens(mockUser);
  assert.ok(tokens.access, 'Access token generated');
  assert.ok(tokens.refresh, 'Refresh token generated');

  const rows = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const paginated = paginate(rows, { page: '2', page_size: '3' }, null);
  assert.strictEqual(paginated.count, 10);
  assert.strictEqual(paginated.results.length, 3);
  assert.strictEqual(paginated.results[0], 4);

  const err = validationError({ field: ['Error message'] });
  assert.strictEqual(err.isValidation, true);
  assert.strictEqual(err.status, 400);

  console.log('  All Middleware tests passed.');
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  testMiddlewares().catch((err) => {
    console.error('Middlewares test failed:', err);
    process.exit(1);
  });
}

export { testMiddlewares };
export default testMiddlewares;
