import Leaderboard from "../models/Leaderboard.js";

// Save a newly finished quiz attempt result metrics snapshot
export const addLeaderboardRecord = async (req, res) => {
  try {
    const { userName, topicTitle, score, totalQuestions, accuracy } = req.body;
    
    // Grabs the authenticated userId injected by your auth middleware setup
    const userId = req.userId || req.body.userId; 

    const newRecord = new Leaderboard({
      userId,
      userName: userName || "Guest Candidate",
      topicTitle,
      score,
      totalQuestions,
      accuracy
    });

    await newRecord.save();
    res.status(201).json({ success: true, message: "Score posted successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Pull top scores globally, sorted descending from highest down to lowest
export const getGlobalLeaderboard = async (req, res) => {
  try {
    const topScores = await Leaderboard.find({})
      .sort({ score: -1, accuracy: -1 }) // Sort by score, tiebreaker by accuracy percent
      .limit(10); // Limit to top 10 rows for optimal performance
      
    res.status(200).json({ success: true, data: topScores });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
