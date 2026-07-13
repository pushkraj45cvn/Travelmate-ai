const mongoose = require('mongoose');

/**
 * Get the MongoDB URI from environment variables.
 * Validates it exists before connecting — prevents the confusing
 * "openUri() must be a string, got undefined" error.
 */
const getMongoURI = () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('\n=== MongoDB Configuration Error ==='.red.bold);
    console.error('MONGODB_URI is not set!'.red.underline.bold);
    console.error('\nTo fix this:'.yellow);
    console.error('  • Locally:  Add MONGODB_URI to your server/.env file'.yellow);
    console.error('  • Render:   Add MONGODB_URI in Render Dashboard → Environment Variables'.yellow);
    console.error('\nExample:'.gray);
    console.error('  mongodb+srv://user:pass@cluster.mongodb.net/db?retryWrites=true&w=majority\n'.gray);
    throw new Error('MONGODB_URI environment variable is not defined');
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
    if (!error.message.includes('MONGODB_URI environment variable')) {
      console.error('\n=== MongoDB Connection Error ==='.red.bold);
      console.error(`Message: ${error.message}`.red.underline.bold);

      if (error.name === 'MongoServerError' && error.message.includes('bad auth')) {
        console.error('\n💡 TIP: Check username/password in MONGODB_URI and Atlas Database Access'.yellow);
      } else if (error.name === 'MongooseServerSelectionError') {
        console.error('\n💡 TIP: Check IP whitelist in Atlas → Network Access'.yellow);
      }
    }
    throw error;
  }
};

module.exports = connectDB;
