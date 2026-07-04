import mongoose from "mongoose";

const topicSchema = new mongoose.Schema({
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Exam",
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  questionCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

const Topic = mongoose.models.Topic || mongoose.model("Topic", topicSchema);
export default Topic;
