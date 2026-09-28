import assert from 'assert';
import { hashPassword, verifyPassword } from '../src/utils/passwordUtils.js';

async function testPasswordUtils() {
  console.log('Testing passwordUtils...');

  const plain = 'SecretPass123';
  const hashed = await hashPassword(plain);

  assert.ok(hashed.startsWith('pbkdf2_sha256$'), 'Hash should start with pbkdf2_sha256$');

  const valid = await verifyPassword(plain, hashed);
  assert.strictEqual(valid, true, 'Valid password verification failed');

  const invalid = await verifyPassword('WrongPassword', hashed);
  assert.strictEqual(invalid, false, 'Invalid password should not verify');

  const empty = await verifyPassword('', hashed);
  assert.strictEqual(empty, false, 'Empty password should not verify');

  console.log('  All passwordUtils tests passed.');
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  testPasswordUtils().catch((err) => {
    console.error('passwordUtils test failed:', err);
    process.exit(1);
  });
}

export { testPasswordUtils };
export default testPasswordUtils;
