const mysql = require('mysql2/promise');

async function check() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'rootpassword123',
    database: 'osint_db'
  });

  try {
    const [users] = await connection.execute('SELECT id, email, username FROM users');
    console.log('USERS:', users);

    const [projects] = await connection.execute('SELECT id, name, user_id FROM projects');
    console.log('PROJECTS:', projects);

    const [scans] = await connection.execute('SELECT id, target_id, status FROM scans WHERE id = 95');
    console.log('SCAN 95:', scans);

  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}

check();
