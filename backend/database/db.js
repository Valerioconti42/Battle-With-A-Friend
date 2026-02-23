import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables from your .env file
dotenv.config();

// Create the connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'my_app_database', // Replace with your actual default DB name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the connection immediately when the server starts
try {
  const connection = await pool.getConnection();
  console.log('✅ Successfully connected to the MySQL database!');
  connection.release();
} catch (error) {
  console.error('❌ Database connection failed:');
  console.error(error.message);
}

export default pool;
