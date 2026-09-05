import Report from '../models/Report.js';

export const getReports = async (req, res, next) => {
  try {
    const { studentId, class: className } = req.query;
    let query = {};
    if (studentId) query.studentId = studentId;
    if (className) query.class = className;

    const reports = await Report.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: reports.length, reports });
  } catch (error) {
    next(error);
  }
};

export const createReport = async (req, res, next) => {
  try {
    const report = await Report.create(req.body);
    res.status(201).json({ success: true, report });
  } catch (error) {
    next(error);
  }
};
