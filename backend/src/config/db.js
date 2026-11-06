const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.includes('<db_username>') || uri.includes('<db_password>')) {
    console.warn('\n============================================================');
    console.warn('[MongoDB Atlas Warning]: Database credentials are not configured.');
    console.warn('Please update MONGODB_URI in backend/.env with your valid username & password.');
    console.warn('Format: mongodb+srv://<username>:<password>@cluster0.n3m8vyc.mongodb.net/nagpur_real_estate?retryWrites=true&w=majority&appName=Cluster0');
    console.warn('============================================================\n');
    return false;
  }

  try {
    const options = {
      autoIndex: true, // Build indexes automatically in development
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
    };

    const conn = await mongoose.connect(uri, options);
    isConnected = true;
    console.log(`[MongoDB Connected]: Host -> ${conn.connection.host}, Database -> ${conn.connection.name}`);
    return true;
  } catch (error) {
    isConnected = false;
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    console.error('The server will continue running, but database operations will fail until valid credentials and network access (0.0.0.0/0 on Atlas) are configured.');
    return false;
  }
};

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('[MongoDB Disconnected]: Attempting to reconnect when triggered...');
});

mongoose.connection.on('reconnected', () => {
  isConnected = true;
  console.log('[MongoDB Reconnected successfully]');
});

const checkDBStatus = () => ({
  isConnected,
  readyState: mongoose.connection.readyState,
  host: mongoose.connection.host || 'Not connected',
  name: mongoose.connection.name || 'nagpur_real_estate'
});

module.exports = { connectDB, checkDBStatus };

