import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  class: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'leave', 'holiday'],
    required: true,
    default: 'present'
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  subject: {
    type: String,
    default: 'General'
  },
  remark: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

attendanceSchema.index({ studentId: 1, date: 1 });

export default mongoose.model('Attendance', attendanceSchema);
