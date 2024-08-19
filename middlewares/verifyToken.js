const jwt = require("jsonwebtoken");
const { FAIL, ERROR } = require("../utils/httpStatus");
const appError = require("../utils/appError");
const verifyToken = (req, res, next) => {
  const authHeader =
    req.headers["Authorization"] || req.headers["authorization"];
  if (!authHeader) {
    const error = appError.create("Unauthorized", 401, FAIL);
    return next(error);
  }
  const token = authHeader && authHeader.split(" ")[1];
  try {
    const currentUser = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.currentUser = currentUser;
    next();
  } catch (error) {
    const err = appError.create("Invalid token", 401, ERROR);
    return next(err);
  }
};

module.exports = verifyToken;
