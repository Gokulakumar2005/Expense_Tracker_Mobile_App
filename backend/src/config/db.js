import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

let connectionConfig;
const DATABASE_URL = process.env.DATABASE_URL;

if (DATABASE_URL) {
  let url = DATABASE_URL;
  if (url.includes('@dpg-') && !url.includes('.render.com') && !url.includes('.com/')) {
    url = url.replace(/(@dpg-[a-z0-9\-]+)(\/|$)/, '$1.singapore-postgres.render.com$2');
    if (!url.includes('?')) {
      url += '?sslmode=require';
    }
  }

  connectionConfig = {
    connectionString: url,
    ssl: url.includes('render.com') || url.includes('sslmode=require')
      ? { rejectUnauthorized: false }
      : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  };
} else {
  connectionConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'pockettrack_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  };
}

const pool = new Pool(connectionConfig);

pool.on('error', (err) => {
  console.error('Unexpected error on idle client:', err.message);
});

const query = (text, params) => pool.query(text, params);
const getClient = () => pool.connect();

export { pool, query, getClient };
export default { pool, query, getClient };
