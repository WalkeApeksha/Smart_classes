import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  authorName: { type: String, default: 'Principal Office' },
  targetRoles: [{ type: String, enum: ['admin', 'teacher', 'student', 'parent'] }],
  targetClasses: [{ type: String }],
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  attachments: [{
    fileName: String,
    fileUrl: String
  }],
  isPublished: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Announcement', announcementSchema);
