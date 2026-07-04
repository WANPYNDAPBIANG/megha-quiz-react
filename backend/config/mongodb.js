import mongoose from "mongoose";

const connectDB = async () => {
  mongoose.connection.on("connected", () => console.log("🚀 Database Connected Successfully"));
  mongoose.connection.on("error", (err) => console.error("❌ Mongoose Connection Error:", err));

  try {
    // UPDATED: Added structural connection timeout flags
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Fail fast (5s) instead of freezing for 30s
      socketTimeoutMS: 45000,         // Keep the socket connection stable
    });
  } catch (error) {
    console.error("❌ Initial Database Handshake Failed:", error.message);
  }
};

export default connectDB;
