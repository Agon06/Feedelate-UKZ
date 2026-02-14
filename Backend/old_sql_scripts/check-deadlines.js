const mysql = require('mysql2/promise');

async function checkDeadlines() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'feedelate'
  });

  console.log('✓ Connected to database');

  // Check table structure
  const [columns] = await connection.execute('DESCRIBE lendet');
  console.log('\n📋 Kolona që përmbajnë "deadline":');
  columns.filter(col => col.Field.toLowerCase().includes('deadline')).forEach(col => {
    console.log(`  - ${col.Field} (${col.Type})`);
  });

  // Check if there's data in ideaDeadlinesJson
  const [rows] = await connection.execute(
    'SELECT id, emriLendes, ideaDeadlinesJson FROM lendet WHERE ideaDeadlinesJson IS NOT NULL LIMIT 5'
  );
  
  console.log('\n📊 Të dhëna në ideaDeadlinesJson:');
  if (rows.length === 0) {
    console.log('  ⚠️ Nuk ka të dhëna në ideaDeadlinesJson');
  } else {
    rows.forEach(row => {
      console.log(`  Lenda: ${row.emriLendes} (ID: ${row.id})`);
      console.log(`  JSON: ${JSON.stringify(row.ideaDeadlinesJson)}`);
    });
  }

  await connection.end();
}

checkDeadlines().catch(console.error);
