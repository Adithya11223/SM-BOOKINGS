const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_kt3yHwMW7RQi@ep-calm-sky-az2uy53g-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require'
});
client.connect().then(() => {
  return client.query(`
    UPDATE business_settings SET 
      business_name = 'SM Saloon',
      owner_name = 'Shalini Banja',
      owner_title = 'Lead Stylist & Founder',
      tagline = 'Experience the best salon services',
      description = 'Welcome to SM Saloon, your premium destination for hair, skin, and nail care. We provide top-notch services at our shop and at your doorstep.',
      address = '123 Beauty Avenue, Makeup City, Fashion State',
      phone_number = '+1 987-654-3210',
      whatsapp_number = '+1 987-654-3210',
      email = 'contact@smsaloon.com',
      instagram = '@smsaloon_official',
      facebook = 'SM Saloon',
      youtube = 'SM Saloon TV',
      threads = '@smsaloon_official'
  `);
}).then(() => {
  console.log('Business settings updated successfully.');
  return client.end();
}).catch(console.error);
