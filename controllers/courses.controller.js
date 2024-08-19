const { validationResult } = require("express-validator");
const Course = require("../models/course.model");
const { SUCCESS, FAIL, ERROR } = require("../utils/httpStatus");
const asyncWrapper = require("../middlewares/asyncWrapper");
const appError = require("../utils/appError");

const getCourses = asyncWrapper(async (req, res) => {
  const query = req.query;

  const limit = query.limit ? parseInt(query.limit) : 10;
  const page = query.page ? parseInt(query.page) : 1;
  const skip = (page - 1) * limit;

  const courses = await Course.find({}, { __v: false }).limit(limit).skip(skip);
  res.json({ status: SUCCESS, data: { courses } });
});

const getCourseById = asyncWrapper(async (req, res, next) => {
  const course = await Course.findById(req.params.courseId, { __v: false });
  if (!course) {
    const err = appError.create("Course is not found", 404, FAIL);
    return next(err);
  }
  return res.json({ status: SUCCESS, data: { course } });
});

const addCourse = asyncWrapper(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = appError.create(errors.array(), 400, FAIL);
    return next(err);
  }

  const newCourse = new Course(req.body);
  await newCourse.save();
  res.status(201).json({ status: SUCCESS, data: { course: newCourse } });
});

const updateCourse = asyncWrapper(async (req, res) => {
  const courseId = req.params.courseId;
  const updatedCourse = await Course.findByIdAndUpdate(
    courseId,
    { $set: req.body },
    { new: true }
  );
  res.json({ status: SUCCESS, data: { course: updateCourse } });
});

const deleteCourse = asyncWrapper(async (req, res) => {
  const courseId = req.params.courseId;
  await Course.findByIdAndDelete(courseId);
  res.json({ status: SUCCESS, data: null });
});

module.exports = {
  getCourses,
  getCourseById,
  addCourse,
  updateCourse,
  deleteCourse,
};
