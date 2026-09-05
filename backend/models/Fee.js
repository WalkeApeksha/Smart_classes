import mongoose from 'mongoose';

const feeSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  studentName: { type: String, required: true },
  class: { type: String, required: true },
  month: { type: String, required: true },
  year: { type: Number, default: () => new Date().getFullYear() },
  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  paidDate: { type: Date },
  status: { type: String, enum: ['pending', 'paid', 'overdue'], default: 'pending' },
  paymentMethod: { type: String, default: 'online' },
  transactionId: { type: String },
  receiptNumber: { type: String },
  remarks: { type: String }
}, { timestamps: true });

export default mongoose.model('Fee', feeSchema);
