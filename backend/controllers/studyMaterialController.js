import StudyMaterial from '../models/StudyMaterial.js';
import User from '../models/User.js';

// @desc    Get study materials filtered by role & class
// @route   GET /api/notes
export const getStudyMaterials = async (req, res, next) => {
  try {
    const { subject, class: className, search } = req.query;
    let query = {};

    if (req.user.role === 'student') {
      query.class = req.user.class;
    } else if (req.user.role === 'parent') {
      let childClasses = [];
      const children = await User.find({
        $or: [
          { _id: { $in: req.user.children?.map(c => c.studentId) || [] } },
          { parentEmail: req.user.email.toLowerCase() }
        ]
      }).select('class');
      childClasses = children.map(c => c.class).filter(Boolean);
      query.class = { $in: childClasses };
    } else if (className) {
      query.class = className;
    }

    if (subject) query.subject = subject;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const materials = await StudyMaterial.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: materials.length, materials });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload new study material (Admin & Teacher only)
// @route   POST /api/notes
export const uploadStudyMaterial = async (req, res, next) => {
  try {
    const { title, description, subject, class: className } = req.body;
    let fileUrl = req.body.fileUrl;
    let fileName = req.body.fileName;
    let fileSize = req.body.fileSize || '1.5 MB';
    let fileType = req.body.fileType || 'pdf';

    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
      fileName = req.file.originalname;
      fileType = req.file.mimetype.split('/')[1] || 'pdf';
      fileSize = `${(req.file.size / (1024 * 1024)).toFixed(1)} MB`;
    }

    if (!fileUrl) {
      return res.status(400).json({ success: false, message: 'Please provide a file or fileUrl' });
    }

    const material = await StudyMaterial.create({
      title,
      description,
      subject,
      class: className,
      uploadedBy: req.user._id,
      uploaderName: req.user.name,
      fileUrl,
      fileName: fileName || `${title}.pdf`,
      fileType,
      fileSize
    });

    res.status(201).json({ success: true, message: 'Study material uploaded successfully', material });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete study material (Owner teacher or Admin only)
// @route   DELETE /api/notes/:id
export const deleteStudyMaterial = async (req, res, next) => {
  try {
    const material = await StudyMaterial.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    if (req.user.role !== 'admin' && material.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this study material' });
    }

    await material.deleteOne();
    res.status(200).json({ success: true, message: 'Study material deleted successfully' });
  } catch (error) {
    next(error);
  }
};
