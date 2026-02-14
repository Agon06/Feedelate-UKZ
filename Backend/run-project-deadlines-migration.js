const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

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

    const migrationFile = path.join(__dirname, 'migration_add_project_deadlines_json.sql');
    const sql = fs.readFileSync(migrationFile, 'utf8');
    
    await connection.execute(sql);

    console.log('✓ Migration successful: projectDeadlinesJson column added to lendet table');

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('✗ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
