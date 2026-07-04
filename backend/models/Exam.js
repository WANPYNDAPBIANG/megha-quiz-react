import mongoose from "mongoose";

const examSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: ["MPSC", "MPSC LDA", "Police", "TET", "Secretariat", "General GK"],
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  }
}, { timestamps: true });

const Exam = mongoose.models.Exam || mongoose.model("Exam", examSchema);
export default Exam;
