import OnlineClass from '../models/OnlineClass.js';
import User from '../models/User.js';

// @desc    Get online classes filtered by role and grade
// @route   GET /api/online-classes
export const getOnlineClasses = async (req, res, next) => {
  try {
    const { class: className, status } = req.query;
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
    } else if (req.user.role === 'teacher') {
      if (className) query.class = className;
      else if (req.user.assignedClasses && req.user.assignedClasses.length > 0) {
        query.class = { $in: req.user.assignedClasses };
      }
    } else if (className) {
      query.class = className;
    }

    if (status) query.status = status;

    const classes = await OnlineClass.find(query).sort({ scheduledAt: 1 });
    res.status(200).json({ success: true, count: classes.length, onlineClasses: classes });
  } catch (error) {
    next(error);
  }
};

// @desc    Schedule new online class (Admin & Teacher only)
// @route   POST /api/online-classes
export const createOnlineClass = async (req, res, next) => {
  try {
    const { title, subject, class: className, scheduledAt, duration, meetingUrl, platform, description } = req.body;

    if (!title || !subject || !className || !scheduledAt || !meetingUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, subject, class, scheduledAt, meetingUrl'
      });
    }

    // Basic URL validation
    try {
      new URL(meetingUrl);
    } catch (_) {
      return res.status(400).json({ success: false, message: 'Please provide a valid meeting URL' });
    }

    const onlineClass = await OnlineClass.create({
      title,
      subject,
      class: className,
      teacherId: req.user._id,
      teacherName: req.user.name,
      scheduledAt: new Date(scheduledAt),
      duration: duration || 45,
      meetingUrl,
      platform: platform || (meetingUrl.includes('zoom') ? 'Zoom' : meetingUrl.includes('meet') ? 'Google Meet' : 'Live Classroom'),
      description: description || ''
    });

    res.status(201).json({ success: true, message: 'Online class scheduled successfully', onlineClass });
  } catch (error) {
    next(error);
  }
};

// @desc    Update online class status / details (Teacher or Admin)
// @route   PUT /api/online-classes/:id
export const updateOnlineClass = async (req, res, next) => {
  try {
    const onlineClass = await OnlineClass.findById(req.params.id);
    if (!onlineClass) {
      return res.status(404).json({ success: false, message: 'Online class not found' });
    }

    if (req.user.role !== 'admin' && onlineClass.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this online class' });
    }

    Object.assign(onlineClass, req.body);
    await onlineClass.save();

    res.status(200).json({ success: true, message: 'Online class updated', onlineClass });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete online class
// @route   DELETE /api/online-classes/:id
export const deleteOnlineClass = async (req, res, next) => {
  try {
    const onlineClass = await OnlineClass.findById(req.params.id);
    if (!onlineClass) {
      return res.status(404).json({ success: false, message: 'Online class not found' });
    }

    if (req.user.role !== 'admin' && onlineClass.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this online class' });
    }

    await onlineClass.deleteOne();
    res.status(200).json({ success: true, message: 'Online class deleted' });
  } catch (error) {
    next(error);
  }
};
