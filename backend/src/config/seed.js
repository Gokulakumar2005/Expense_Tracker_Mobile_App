import { hashPassword } from '../utils/passwordUtils.js';
import { query, pool } from './db.js';

async function seed() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@pockettrack.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
    const demoEmail = process.env.DEMO_USER_EMAIL || 'demo@pockettrack.com';
    const demoPassword = process.env.DEMO_USER_PASSWORD || 'PocketTrack@2026';

    const adminHash = await hashPassword(adminPassword);
    await query(
      `INSERT INTO accounts_user (first_name, last_name, email, password, is_staff, is_superuser, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       ON CONFLICT (email) DO UPDATE SET
         is_staff = EXCLUDED.is_staff,
         is_superuser = EXCLUDED.is_superuser
       RETURNING id, email`,
      ['Admin', 'PocketTrack', adminEmail, adminHash, true, true, true]
    );

    const demoHash = await hashPassword(demoPassword);
    await query(
      `INSERT INTO accounts_user (first_name, last_name, email, password, is_staff, is_superuser, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       ON CONFLICT (email) DO NOTHING
       RETURNING id, email`,
      ['Demo', 'User', demoEmail, demoHash, false, false, true]
    );

    console.log('Seeding completed successfully.');
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  seed();
}

export { seed };
export default seed;
