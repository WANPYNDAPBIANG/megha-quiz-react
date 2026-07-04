import mongoose from "mongoose";

const leaderboardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // References your existing user auth table structure
    required: false
  },
  userName: {
    type: String,
    required: true
  },
  topicTitle: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  accuracy: {
    type: Number,
    required: true
  }
}, { timestamps: true });

const Leaderboard = mongoose.models.Leaderboard || mongoose.model("Leaderboard", leaderboardSchema, "leaderboard");
export default Leaderboard;
