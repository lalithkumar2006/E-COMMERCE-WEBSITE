const db = require('../config/db');

const tableArg = process.argv[2];

if (!tableArg) {
  console.log('\n======================================================');
  console.log('📊 AVAILABLE DATABASE TABLES');
  console.log('======================================================');
  
  const tables = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name NOT LIKE 'sqlite_%'
    ORDER BY name ASC
  `).all();

  console.table(tables);
  console.log('\n👉 Usage: node server/src/utils/view-db.js <table_name>');
  console.log('   Example: node server/src/utils/view-db.js users');
  console.log('   Example: node server/src/utils/view-db.js products');
  console.log('   Example: node server/src/utils/view-db.js orders');
  console.log('   Example: node server/src/utils/view-db.js payments\n');
  process.exit(0);
}

try {
  const query = `SELECT * FROM ${tableArg} LIMIT 50`;
  const rows = db.prepare(query).all();

  console.log(`\n======================================================`);
  console.log(`📋 TABLE: ${tableArg.toUpperCase()} (${rows.length} rows)`);
  console.log(`======================================================`);

  if (rows.length === 0) {
    console.log(`Table "${tableArg}" is currently empty.`);
  } else {
    // Trim long descriptions for clean table formatting
    const cleanedRows = rows.map(r => {
      const copy = { ...r };
      for (const k in copy) {
        if (typeof copy[k] === 'string' && copy[k].length > 40) {
          copy[k] = copy[k].substring(0, 37) + '...';
        }
      }
      return copy;
    });
    console.table(cleanedRows);
  }
  console.log('');
} catch (err) {
  console.error(`\n❌ Error querying table "${tableArg}":`, err.message);
  console.log('Run "node server/src/utils/view-db.js" to list valid table names.\n');
}
