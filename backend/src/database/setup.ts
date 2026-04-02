import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'ledger_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err: Error) => {
  console.error('❌ Unexpected PostgreSQL pool error:', err.message);
});

export async function initializeDatabase(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK(role IN ('admin', 'analyst', 'viewer')) DEFAULT 'viewer',
        status VARCHAR(20) NOT NULL CHECK(status IN ('active', 'inactive')) DEFAULT 'active',
        avatar_url TEXT DEFAULT '',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS financial_records (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        amount NUMERIC(15, 2) NOT NULL CHECK(amount > 0),
        type VARCHAR(20) NOT NULL CHECK(type IN ('income', 'expense')),
        category VARCHAR(100) NOT NULL,
        date DATE NOT NULL,
        notes TEXT DEFAULT '',
        status VARCHAR(20) NOT NULL CHECK(status IN ('verified', 'pending', 'cleared')) DEFAULT 'pending',
        is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_records_type ON financial_records(type);
      CREATE INDEX IF NOT EXISTS idx_records_category ON financial_records(category);
      CREATE INDEX IF NOT EXISTS idx_records_date ON financial_records(date);
      CREATE INDEX IF NOT EXISTS idx_records_deleted ON financial_records(is_deleted);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    `);

    console.log('✅ PostgreSQL tables initialized');
  } finally {
    client.release();
  }
}

export async function query(text: string, params?: any[]) {
  return pool.query(text, params);
}

export async function getOne(text: string, params?: any[]) {
  const result = await pool.query(text, params);
  return result.rows[0] || null;
}

export async function getMany(text: string, params?: any[]) {
  const result = await pool.query(text, params);
  return result.rows;
}

export default pool;
