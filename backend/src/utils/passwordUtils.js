import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const DJANGO_PBKDF2_ALGORITHM = 'pbkdf2_sha256';
const DEFAULT_ITERATIONS = 150000;
const DJANGO_HASH_DIGEST = 'sha256';

function hashPassword(password) {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('base64');
    const iterations = DEFAULT_ITERATIONS;
    const keylen = 32;

    crypto.pbkdf2(password, salt, iterations, keylen, DJANGO_HASH_DIGEST, (err, derivedKey) => {
      if (err) return reject(err);
      const hash = derivedKey.toString('base64');
      resolve(`${DJANGO_PBKDF2_ALGORITHM}$${iterations}$${salt}$${hash}`);
    });
  });
}

function verifyPassword(password, storedHash) {
  return new Promise((resolve, reject) => {
    if (!storedHash || !password) {
      return resolve(false);
    }

    if (storedHash.startsWith('pbkdf2_sha256$')) {
      const parts = storedHash.split('$');
      if (parts.length !== 4) return resolve(false);

      const [, iterations, salt, storedKey] = parts;
      const iterCount = parseInt(iterations, 10);
      const keylen = 32;

      crypto.pbkdf2(password, salt, iterCount, keylen, DJANGO_HASH_DIGEST, (err, derivedKey) => {
        if (err) return reject(err);
        const hash = derivedKey.toString('base64');
        try {
          const a = Buffer.from(hash);
          const b = Buffer.from(storedKey);
          if (a.length !== b.length) {
            return resolve(false);
          }
          resolve(crypto.timingSafeEqual(a, b));
        } catch {
          resolve(hash === storedKey);
        }
      });
      return;
    }

    if (storedHash.startsWith('$2b$') || storedHash.startsWith('$2a$')) {
      bcrypt.compare(password, storedHash)
        .then(resolve)
        .catch(reject);
      return;
    }

    resolve(false);
  });
}

export { hashPassword, verifyPassword };
export default { hashPassword, verifyPassword };
