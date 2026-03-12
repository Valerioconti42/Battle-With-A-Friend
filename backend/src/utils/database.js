import * as mariadb from 'mariadb';
import dotenv from 'dotenv';

dotenv.config();

const pool = mariadb.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'game_db',
  connectionLimit: 5,
  acquireTimeout: 60000,
  connectTimeout: 60000,
  socketTimeout: 60000,
  ssl: false
});

// Test della connessione
(async () => {
  let conn;
  try {
    console.log('🔄 Attempting to connect to MariaDB...');
    console.log(`   Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    console.log(`   Database: ${process.env.DB_NAME}`);
    
    conn = await pool.getConnection();
    console.log('✅ Successfully connected to MariaDB!');
    
    const result = await conn.query('SELECT 1 + 1 AS solution');
    console.log(`   Query test: 1+1 = ${result[0].solution}`);
    
  } catch (err) {
    console.error('❌ MariaDB connection failed:');
    console.error(`   Error: ${err.message}`);
  } finally {
    if (conn) conn.release();
  }
})();

export default pool;