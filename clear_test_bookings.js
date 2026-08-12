const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_kt3yHwMW7RQi@ep-calm-sky-az2uy53g-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require'
});

async function clearBookings() {
  try {
    await client.connect();
    
    // Delete notifications first because they might reference bookings
    await client.query('DELETE FROM notification');
    
    // Delete booking items
    await client.query('DELETE FROM booking_item');
    
    // Finally delete bookings
    await client.query('DELETE FROM booking');
    
    console.log('Successfully cleared all test bookings and notifications!');
  } catch (err) {
    console.error('Error clearing bookings:', err);
  } finally {
    await client.end();
  }
}

clearBookings();
