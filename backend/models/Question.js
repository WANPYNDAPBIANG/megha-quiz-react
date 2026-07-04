import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Topic",
    required: true,
    index: true
  },
  question: {
    type: String,
    required: true,
    trim: true
  },
  options: {
    type: [String],
    required: true,
    validate: [val => val.length === 4, "{PATH} must contain exactly 4 options"]
  },
  correctAnswer: {
    type: Number, 
    required: true,
    min: 0,
    max: 3
  },
  explanation: {
    type: String,
    required: true
  },
  questionImage: {
    type: String,
    default: ""
  },

  pdfNotesUrl: { type: String, default: "" },         // Google Drive links
  videoExplanationUrl: { type: String, default: "" }
}, { timestamps: true });

const Question = mongoose.models.Question || mongoose.model("Question", questionSchema);
export default Question;
