import mariadb from 'mariadb';
import dotenv from 'dotenv';

dotenv.config();

const pool = mariadb.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'game_db',
  connectionLimit: 5,
  acquireTimeout: 10000,  // Add timeout for school network
  connectTimeout: 10000
});

// Test the connection
(async () => {
  let conn;
  try {
    conn = await pool.getConnection();
    console.log('✅ Successfully connected to MariaDB!');
    console.log(`   Database: ${process.env.DB_NAME} on ${process.env.DB_HOST}`);
  } catch (err) {
    console.error('❌ MariaDB connection failed:');
    console.error(`   Error: ${err.message}`);
    console.error('   Check your credentials in the .env file');
  } finally {
    if (conn) conn.release();
  }
})();

export default pool;