const db = require('../config/db');

const identifier = process.argv[2];

if (!identifier) {
  console.log('\n======================================================');
  console.log('🗑️  DELETE USER UTILITY');
  console.log('======================================================');
  console.log('Usage: node server/src/utils/delete-user.js <email_or_id>');
  console.log('Example: node server/src/utils/delete-user.js 3');
  console.log('Example: node server/src/utils/delete-user.js user@example.com\n');
  process.exit(0);
}

try {
  // Find user by ID or Email
  const user = db.prepare(`
    SELECT id, name, email, role FROM users 
    WHERE id = ? OR email = ?
  `).get(identifier, identifier);

  if (!user) {
    console.log(`\n❌ User not found with ID or Email: "${identifier}"\n`);
    process.exit(1);
  }

  // Safety protection for primary admin
  if (user.role === 'admin' && user.id === 1) {
    console.log(`\n⚠️  Cannot delete primary system administrator (ID 1).\n`);
    process.exit(1);
  }

  // Delete associated user data and user record
  db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(user.id);
  db.prepare('DELETE FROM wishlist_items WHERE user_id = ?').run(user.id);
  db.prepare('DELETE FROM addresses WHERE user_id = ?').run(user.id);
  db.prepare('DELETE FROM reviews WHERE user_id = ?').run(user.id);
  db.prepare('UPDATE orders SET user_id = NULL WHERE user_id = ?').run(user.id);
  db.prepare('UPDATE transactions SET user_id = NULL WHERE user_id = ?').run(user.id);
  db.prepare('DELETE FROM users WHERE id = ?').run(user.id);

  console.log('\n======================================================');
  console.log(`✅ USER DELETED SUCCESSFULLY!`);
  console.log('======================================================');
  console.log(`ID:    ${user.id}`);
  console.log(`Name:  ${user.name}`);
  console.log(`Email: ${user.email}`);
  console.log(`Role:  ${user.role}`);
  console.log('======================================================\n');
} catch (err) {
  console.error('\n❌ Error deleting user:', err.message, '\n');
}
