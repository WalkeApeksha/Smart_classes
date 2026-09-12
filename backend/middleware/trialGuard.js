/**
 * Middleware to enforce subscription and 15-day free trial on premium features
 */
export const checkTrialStatus = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  // Admins always have unrestricted access
  if (req.user.role === 'admin') {
    return next();
  }

  // If user has active paid subscription
  if (req.user.subscriptionStatus === 'active') {
    return next();
  }

  // Check trial expiration date on server (Never trust client)
  if (req.user.trialEndDate && new Date() > new Date(req.user.trialEndDate)) {
    return res.status(403).json({
      success: false,
      trialExpired: true,
      message: 'Your 15-day institutional free trial has expired. Please contact your school administrator to activate full access.'
    });
  }

  next();
};

export default checkTrialStatus;
