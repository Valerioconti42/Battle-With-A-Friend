import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'proxy.marconicloud.it',
  user: process.env.DB_USER || 'valerio.conti_app',
  password: process.env.DB_PASSWORD || 'VxChXGe5&qPB',
  database: process.env.DB_NAME || '5DINF_P1_valerio.conti',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
