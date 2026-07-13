const mongoose = require('mongoose');

/**
 * Get the MongoDB URI from environment variables.
 * Falls back gracefully with a helpful error if not set.
 */
const getMongoURI = () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('\n=== MongoDB Configuration Error ==='.red.bold);
    console.error('MONGODB_URI is not set!'.red.underline.bold);
    console.error('\nTo fix this:'.yellow);
    console.error('  • Locally:  Add MONGODB_URI to your server/.env file'.yellow);
    console.error('  • Render:   Add MONGODB_URI in Render Dashboard → Environment Variables'.yellow);
    console.error('\nExample format:'.gray);
    console.error('  mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority\n'.gray);
    throw new Error('MONGODB_URI environment variable is not defined');
  }

  if (typeof uri !== 'string' || uri.trim() === '') {
    throw new Error('MONGODB_URI environment variable is empty');
  }

  return uri;
};

const connectDB = async () => {
  try {
    const uri = getMongoURI();
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);
    return conn;
  } catch (error) {
    // Don't log twice if it's already our custom error
    if (!error.message.includes('MONGODB_URI environment variable')) {
      console.error('\n=== MongoDB Connection Error ==='.red.bold);
      console.error(`Name: ${error.name}`.red);
      console.error(`Message: ${error.message}`.red.underline.bold);
      if (error.code) console.error(`Code: ${error.code}`.red);

      if (error.name === 'MongoServerError' && error.message.includes('bad auth')) {
        console.error('\n💡 TIP: Authentication failed. Check that:'.yellow);
        console.error('   1. The username and password in MONGODB_URI are correct'.yellow);
        console.error('   2. The database user exists in Atlas → Database Access'.yellow);
        console.error('   3. Your IP is whitelisted in Atlas → Network Access\n'.yellow);
      } else if (error.name === 'MongooseServerSelectionError') {
        console.error('\n💡 TIP: Could not reach the cluster. Check that:'.yellow);
        console.error('   1. The cluster hostname is correct'.yellow);
        console.error('   2. Your IP is whitelisted in Atlas → Network Access'.yellow);
        console.error('   3. The cluster is running\n'.yellow);
      }
    }

    throw error;
  }
};

module.exports = connectDB;
