const mysql = require('mysql2/promise');

async function runMigration() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'feedelate',
      port: 3306
    });

    console.log('✓ Connected to database');

    const sql = 'ALTER TABLE lendet ADD COLUMN ideaDeadlinesJson JSON NULL;';
    await connection.execute(sql);

    console.log('✓ Migration successful: ideaDeadlinesJson column added');

    await connection.end();
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('✓ Column already exists');
    } else {
      console.error('✗ Migration failed:', error.message);
    }
    process.exit(1);
  }
}

runMigration();
