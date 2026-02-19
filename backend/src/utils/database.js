import mariadb from 'mariadb';
import dotenv from 'dotenv';

dotenv.config();

const pool = mariadb.createPool({
  host: process.env.localhost,
  user: process.env.valerio.conti,
  password: process.env.VxChXGe5&qPB,
  database: process.env.DB_NAME,
  connectionLimit: 5
});

export default pool;
