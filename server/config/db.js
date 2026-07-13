const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error("MONGODB_URI is missing");
    }

    const conn = await mongoose.connect(uri);

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    return conn;

  } catch (error) {
  console.error("\n=== FAILED TO START SERVER ===");
  console.error(error);
  process.exit(1);
}
};

module.exports = connectDB;