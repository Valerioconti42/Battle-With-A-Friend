import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Prende tutti gli argomenti dopo lo script (i nomi dei file di migrazione)
const migrationNames = process.argv.slice(2);

if (migrationNames.length === 0) {
  console.error('❌ Devi specificare almeno un file di migrazione');
  console.log('Esempio: node migrate.js 001_create_users.sql 002_add_indexes.sql');
  process.exit(1);
}

(async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true
  });

  try {
    for (const migrationName of migrationNames) {
      const migrationPath = path.join(__dirname, 'migrations', migrationName);

      if (!fs.existsSync(migrationPath)) {
        console.error(`❌ Migrazione non trovata: ${migrationName}`);
        process.exit(1);
      }

      const sql = fs.readFileSync(migrationPath, 'utf8');
      console.log(`🚀 Esecuzione migrazione: ${migrationName}`);
      await connection.query(sql);
      console.log(`✅ Migrazione completata: ${migrationName}`);
    }

    console.log('🎉 Tutte le migrazioni sono state eseguite con successo');
  } catch (err) {
    console.error('❌ Migrazione fallita:', err);
    process.exit(1);
  } finally {
    await connection.end();
  }
})();