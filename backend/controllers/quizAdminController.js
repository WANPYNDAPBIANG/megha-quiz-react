import Topic from "../models/Topic.js";
import Question from "../models/Question.js";

// 🌟 1. HANDLES CREATING A NEW TOPIC PAPER SHEET UNDER AN EXAM
export const createTopicEntry = async (req, res) => {
  try {
    const { examId, title } = req.body;

    if (!examId || !title) {
      return res.status(400).json({ success: false, message: "Missing required fields: examId or title" });
    }

    // Initialize with 0 questions
    const newTopic = new Topic({
      examId,
      title,
      questionCount: 0
    });

    await newTopic.save();
    res.status(201).json({ success: true, data: newTopic });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 🌟 2. HANDLES CREATING A NEW MCQ QUESTION AND AUTO-INCREMENTS PARENT COUNTERS
export const createQuestionEntry = async (req, res) => {
  try {
    const { topicId, question, options, correctAnswer, explanation, pdfNotesUrl, videoExplanationUrl } = req.body;

    if (!topicId || !question || !options || correctAnswer === undefined || !explanation) {
      return res.status(400).json({ success: false, message: "Missing required question fields" });
    }

    // Save the new question document directly into the 'questions' collection
    const newQuestion = new Question({
      topicId,
      question,
      options,
      correctAnswer: Number(correctAnswer),
      explanation,
      pdfNotesUrl: pdfNotesUrl || "",
      videoExplanationUrl: videoExplanationUrl || ""
    });

    await newQuestion.save();

    // 🔗 NESTING AUTOMATION: Increment the 'questionCount' property inside the parent Topic document natively
    await Topic.findByIdAndUpdate(topicId, { $inc: { questionCount: 1 } });

    res.status(201).json({ success: true, data: newQuestion });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
