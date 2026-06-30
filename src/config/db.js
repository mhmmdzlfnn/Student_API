import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  // Mengaktifkan SSL jika terhubung ke host eksternal (Supabase)
  ssl: process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost') && !process.env.DATABASE_URL.includes('127.0.0.1')
    ? { rejectUnauthorized: false }
    : false
});

// Test database connection on startup
(async () => {
  try {
    const client = await pool.connect();
    console.log('Database connected successfully to Supabase (PostgreSQL).');
    client.release();
  } catch (error) {
    console.error('Database connection failed:', error.message);
  }
})();

export default pool;
