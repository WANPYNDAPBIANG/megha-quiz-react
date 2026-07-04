import Exam from "../models/Exam.js";
import Topic from "../models/Topic.js";
import Question from "../models/Question.js";

// Fetch all exam templates
export const getAllExams = async (req, res) => {
  try {
    const exams = await Exam.find({});
    res.status(200).json({ success: true, data: exams });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fetch topics for chosen parent exam tracking token
export const getTopicsByExam = async (req, res) => {
  try {
    const topics = await Topic.find({ examId: req.params.examId });
    res.status(200).json({ success: true, data: topics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fetch questions mapped to sub-topic layout parameter elements
export const getQuestionsByTopic = async (req, res) => {
  try {
    const questions = await Question.find({ topicId: req.params.topicId });
    res.status(200).json({ success: true, data: questions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
