import { query, pool } from './db.js';

async function migrate() {
  try {
    await query(`DROP TABLE IF EXISTS budgets CASCADE;`);
    await query(`DROP TABLE IF EXISTS transactions CASCADE;`);
    await query(`DROP TABLE IF EXISTS users CASCADE;`);

    for (const [table, cols] of [
      ['accounts_user', ['created_at', 'updated_at']],
      ['transactions_transaction', ['created_at', 'updated_at']],
      ['budgets_budget', ['created_at', 'updated_at']],
    ]) {
      for (const col of cols) {
        await query(`
          DO $$
          BEGIN
            IF EXISTS (
              SELECT 1 FROM information_schema.columns
              WHERE table_schema = 'public' AND table_name = '${table}' AND column_name = '${col}'
            ) THEN
              EXECUTE 'ALTER TABLE ${table} ALTER COLUMN ${col} SET DEFAULT NOW()';
            END IF;
          END $$;
        `);
      }
    }

    await query(`CREATE INDEX IF NOT EXISTS idx_accounts_user_email ON accounts_user(email);`);

    await query(`CREATE INDEX IF NOT EXISTS idx_tx_user_id ON transactions_transaction(user_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_tx_type ON transactions_transaction(transaction_type);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_tx_category ON transactions_transaction(category);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_tx_date ON transactions_transaction(transaction_date);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_tx_user_date ON transactions_transaction(user_id, transaction_date DESC);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_tx_user_type ON transactions_transaction(user_id, transaction_type);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_tx_user_cat ON transactions_transaction(user_id, category);`);

    await query(`CREATE INDEX IF NOT EXISTS idx_bdg_user_id ON budgets_budget(user_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_bdg_user_year_month ON budgets_budget(user_id, year, month);`);

    await query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  migrate();
}

export { migrate };
export default migrate;
