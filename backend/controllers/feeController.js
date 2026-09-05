import Fee from '../models/Fee.js';

export const getAllFees = async (req, res, next) => {
  try {
    const { status, class: className } = req.query;
    let query = {};
    if (status) query.status = status;
    if (className) query.class = className;

    const fees = await Fee.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: fees.length, fees });
  } catch (error) {
    next(error);
  }
};

export const createFee = async (req, res, next) => {
  try {
    const fee = await Fee.create(req.body);
    res.status(201).json({ success: true, fee });
  } catch (error) {
    next(error);
  }
};

export const updateFee = async (req, res, next) => {
  try {
    const fee = await Fee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, fee });
  } catch (error) {
    next(error);
  }
};
