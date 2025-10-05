require('dotenv').config();
const { connect } = require('./config/db');
const PublicRequest = require('./models/PublicRequest');

async function seed() {
  await connect();

  await PublicRequest.deleteMany(); // Clear old data

  const sampleRequests = [
    { product: 'Irish Potatoes', totalQuantityKg: 15000, deadline: new Date('2025-10-10') },
    { product: 'Beans', totalQuantityKg: 8000, deadline: new Date('2025-10-10') },
    { product: 'Cassava', totalQuantityKg: 6000, deadline: new Date('2025-10-10') },
  ];

  await PublicRequest.insertMany(sampleRequests);
  console.log('✅ Public requests seeded!');
  process.exit();
}

seed();
