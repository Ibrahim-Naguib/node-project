const { validationResult } = require("express-validator");
const User = require("../models/user.model");
const { SUCCESS, FAIL, ERROR } = require("../utils/httpStatus");
const asyncWrapper = require("../middlewares/asyncWrapper");
const appError = require("../utils/appError");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");

const getAllUsers = asyncWrapper(async (req, res) => {
  const query = req.query;

  const limit = query.limit ? parseInt(query.limit) : 10;
  const page = query.page ? parseInt(query.page) : 1;
  const skip = (page - 1) * limit;

  const users = await User.find({}, { __v: false, password: false })
    .limit(limit)
    .skip(skip);
  res.json({ status: SUCCESS, data: { users } });
});

const register = asyncWrapper(async (req, res, next) => {
  const { firstName, lastName, email, password, role } = req.body;

  const oldUser = await User.findOne({ email: email });
  if (oldUser) {
    const error = appError.create("User already exists", 400, FAIL);
    return next(error);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  newUser = new User({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    role,
    avatar: req.file.filename,
  });

  const token = await generateToken({
    email: newUser.email,
    id: newUser._id,
    role: newUser.role,
  });
  newUser.token = token;

  await newUser.save();
  res.status(201).json({ status: SUCCESS, data: { user: newUser } });
});

const login = asyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email && !password) {
    const error = appError.create(
      "Please provide email and password",
      400,
      FAIL
    );
    return next(error);
  }

  const user = await User.findOne({ email: email });
  if (!user) {
    const error = appError.create("User not found", 404, FAIL);
    return next(error);
  }
  const matchedPassword = await bcrypt.compare(password, user.password);

  if (user && matchedPassword) {
    const token = await generateToken({
      email: user.email,
      id: user._id,
      role: user.role,
    });
    return res.json({
      status: SUCCESS,
      data: { token },
    });
  } else {
    const error = appError.create("Invalid email or password", 401, FAIL);
    return next(error);
  }
});

module.exports = {
  getAllUsers,
  register,
  login,
};
