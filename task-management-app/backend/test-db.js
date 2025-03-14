import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully!');
    console.log('Connection state:', mongoose.connection.readyState);
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return false;
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('Connection closed');
  }
}

testConnection();