import express from "express";

// 🌟 1. Combined Imports from quizController
import { 
  getAllExams, 
  getTopicsByExam, 
  getQuestionsByTopic 
} from "../controllers/quizController.js";

// 🌟 2. Combined Imports from leaderboardController
import { 
  addLeaderboardRecord, 
  getGlobalLeaderboard 
} from "../controllers/leaderboardController.js";

// 🌟 3. Combined Imports from quizAdminController
import { 
  createTopicEntry, 
  createQuestionEntry 
} from "../controllers/quizAdminController.js";

// Auth Middleware
import userAuth from "../middleware/userAuth.js";

const quizRouter = express.Router();

// ==========================================================
// PUBLIC USER READ PATHWAYS
// ==========================================================
quizRouter.get("/exams", getAllExams);
quizRouter.get("/exams/:examId/topics", getTopicsByExam);
quizRouter.get("/topics/:topicId/questions", getQuestionsByTopic);
quizRouter.get("/leaderboard/global", getGlobalLeaderboard);

// ==========================================================
// SECURED USER PATHWAYS
// ==========================================================
quizRouter.post("/leaderboard/submit", userAuth, addLeaderboardRecord);

// ==========================================================
// ADMIN WRITE PATHWAYS
// ==========================================================
quizRouter.post("/topics/create", createTopicEntry);
quizRouter.post("/questions/create", createQuestionEntry);

export default quizRouter;
