const ErrorResponse = require('../utils/errorResponse');

exports.checkPlanAccess = (...allowedPlans) => {
  return (req, res, next) => {
    const userPlan = req.user?.plan || 'free';
    if (!allowedPlans.includes(userPlan)) {
      return next(
        new ErrorResponse(
          `Upgrade to ${allowedPlans.join(' or ')} plan to access this feature`,
          403
        )
      );
    }
    next();
  };
};
