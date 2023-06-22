const mongoose = require('mongoose');
require('dotenv').config();


const connectDB = async () => {
  try {
    await mongoose.connect(`mongodb+srv://amoswachira50:${process.env.DB_PASSWORD}@cluster-supplychain.p1jtb0o.mongodb.net/?retryWrites=true&w=majority`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to the database');
  } catch (error) {
    console.error('Failed to connect to the database:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
