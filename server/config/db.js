const mongoose = require('mongoose');

/**
 * Get MongoDB URI from environment variables.
 * Validates it exists before connecting.
 */
const getMongoURI = () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('\n=== MongoDB Configuration Error ===');
    console.error('MONGODB_URI is not set!');

    console.error('\nTo fix this:');
    console.error('  • Locally: Add MONGODB_URI to server/.env');
    console.error('  • Render: Add MONGODB_URI in Dashboard → Environment Variables');

    throw new Error('MONGODB_URI environment variable is not defined');
  }

  return uri;
};


/**
 * Connect MongoDB Atlas
 */
const connectDB = async () => {
  try {
    const uri = getMongoURI();

    const conn = await mongoose.connect(uri);

    console.log(
      `MongoDB Connected: ${conn.connection.host}`
    );

    return conn;

  } catch (error) {

    console.error('\n=== MongoDB Connection Error ===');
    console.error(`Message: ${error.message}`);

    if (
      error.name === 'MongoServerError' &&
      error.message.includes('bad auth')
    ) {
      console.error(
        'TIP: Check username/password in MONGODB_URI and Atlas Database Access'
      );
    }

    if (error.name === 'MongooseServerSelectionError') {
      console.error(
        'TIP: Check Atlas Network Access IP whitelist'
      );
    }

    throw error;
  }
};


/**
 * Test MongoDB connection status
 */



module.exports = {
  connectDB,
  testConnection
};