const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_kt3yHwMW7RQi@ep-calm-sky-az2uy53g-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require'
});
client.connect().then(() => {
  return client.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
}).then(() => {
  console.log('Database cleaned successfully.');
  return client.end();
}).catch(console.error);
