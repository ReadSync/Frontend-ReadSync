import mysql from 'mysql2/promise';

// Gunakan createPool untuk better performance
const connection = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'readsync',
});

export default connection;