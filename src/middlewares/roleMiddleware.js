export const restrictTo = (...roles) => {
  return (req, res, next) => {
    // req.user is populated by protect middleware
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to perform this action'
      });
    }
    next();
  };
};
