import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';

const migrationName = process.argv[2];

if (!migrationName) {
  console.error('❌ Please provide a migration file name');
  process.exit(1);
}

const migrationPath = path.join(
  process.cwd(),
  'backend/database/migrations',
  migrationName
);

if (!fs.existsSync(migrationPath)) {
  console.error(`❌ Migration not found: ${migrationName}`);
  process.exit(1);
}

(async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true
  });

  try {
    const sql = fs.readFileSync(migrationPath, 'utf8');
    console.log(`🚀 Running migration: ${migrationName}`);
    await connection.query(sql);
    console.log('✅ Migration completed successfully');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    await connection.end();
  }
})();
