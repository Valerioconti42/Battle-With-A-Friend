import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Carica le variabili d'ambiente dal file .env (o db.env)
dotenv.config({ path: '.env' }); // Se il file si chiama db.env, usa { path: 'db.env' }

// Crea il pool di connessioni
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'game_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
});

// Test della connessione all'avvio
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connessione al database riuscita!');
    connection.release();
  } catch (error) {
    console.error('❌ Connessione al database fallita:');
    console.error(error.message);
    process.exit(1); // Esce dal processo se non può connettersi al DB
  }
})();

export default pool;
