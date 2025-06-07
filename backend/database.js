import mysql from 'mysql2';

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Yamir081015',
  database: 'restaurant_system'
});

db.connect(err => {
  if (err) {
    console.error('Error al conectar la base de datos:', err);
    return;
  }
  console.log('Conexión exitosa a la base de datos');
});

export default db;


