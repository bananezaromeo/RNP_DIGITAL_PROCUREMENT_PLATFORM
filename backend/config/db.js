const mongoose = require('mongoose');

async function connect() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dpamis_dev';
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { autoIndex: true });
  console.log('Connected to MongoDB');
}

module.exports = { connect };
