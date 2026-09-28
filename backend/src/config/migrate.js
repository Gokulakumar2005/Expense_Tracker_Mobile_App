import { query, pool } from './db.js';

async function migrate() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS accounts_user (
        id            BIGSERIAL PRIMARY KEY,
        password      VARCHAR(255) NOT NULL,
        last_login    TIMESTAMPTZ,
        is_superuser  BOOLEAN NOT NULL DEFAULT FALSE,
        first_name    VARCHAR(150) NOT NULL,
        last_name     VARCHAR(150) NOT NULL,
        email         VARCHAR(255) NOT NULL UNIQUE,
        is_active     BOOLEAN NOT NULL DEFAULT TRUE,
        is_staff      BOOLEAN NOT NULL DEFAULT FALSE,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS transactions_transaction (
        id                BIGSERIAL PRIMARY KEY,
        title             VARCHAR(200) NOT NULL,
        amount            NUMERIC(12, 2) NOT NULL CHECK (amount >= 0.01),
        transaction_type  VARCHAR(10) NOT NULL CHECK (transaction_type IN ('INCOME', 'EXPENSE')),
        category          VARCHAR(50) NOT NULL,
        description       TEXT NOT NULL DEFAULT '',
        transaction_date  DATE NOT NULL DEFAULT CURRENT_DATE,
        created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        user_id           BIGINT NOT NULL REFERENCES accounts_user(id) ON DELETE CASCADE
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS budgets_budget (
        id          BIGSERIAL PRIMARY KEY,
        category    VARCHAR(50) NOT NULL,
        amount      NUMERIC(12, 2) NOT NULL CHECK (amount >= 0.01),
        month       SMALLINT NOT NULL CHECK (month >= 1 AND month <= 12),
        year        SMALLINT NOT NULL CHECK (year >= 2000 AND year <= 2100),
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        user_id     BIGINT NOT NULL REFERENCES accounts_user(id) ON DELETE CASCADE
      );
    `);

    await query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'unique_user_category_month_year_budget'
        ) THEN
          ALTER TABLE budgets_budget
            ADD CONSTRAINT unique_user_category_month_year_budget
            UNIQUE (user_id, category, month, year);
        END IF;
      END $$;
    `);

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
