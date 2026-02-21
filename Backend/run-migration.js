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

    const sql = 'ALTER TABLE studentet ADD COLUMN academicYear VARCHAR(32) NULL;';
    await connection.execute(sql);

    console.log('✓ Migration successful: academicYear column added to studentet table');

    await connection.end();
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('✓ academicYear column already exists');
    } else {
      console.error('✗ Migration failed:', error.message);
    }
    process.exit(1);
  }
}

runMigration();
