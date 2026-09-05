import mongoose from 'mongoose';

const testSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  class: { type: String, required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  duration: { type: Number, default: 30 }, // in minutes
  totalMarks: { type: Number, default: 20 },
  passingMarks: { type: Number, default: 8 },
  questions: [{
    question: { type: String, required: true },
    type: { type: String, enum: ['mcq', 'truefalse', 'short'], default: 'mcq' },
    options: [{ type: String }],
    correctAnswer: { type: String, required: true },
    marks: { type: Number, default: 1 }
  }],
  status: { type: String, enum: ['draft', 'published', 'completed'], default: 'published' },
  attempts: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    studentName: String,
    score: Number,
    percentage: Number,
    submittedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model('Test', testSchema);
