const appError = require("../utils/appError");
const { FAIL } = require("../utils/httpStatus");

module.exports = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.currentUser.role)) {
      const error = appError.create(
        "You are not allowed to perform this action",
        403,
        FAIL
      );
      return next(error);
    }
    next();
  };
};
