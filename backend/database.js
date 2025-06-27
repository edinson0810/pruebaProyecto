// db.js
// backend/database.js
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '#Aprendiz2024',
  database: 'restaurant_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;






