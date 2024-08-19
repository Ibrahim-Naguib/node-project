const express = require("express");
const {
  getCourses,
  getCourseById,
  addCourse,
  updateCourse,
  deleteCourse,
} = require("../controllers/courses.controller");
const { validationSchema } = require("../middlewares/validationScema");
const verifyToken = require("../middlewares/verifyToken");
const { ADMIN, MANAGER } = require("../utils/userRoles");
const allowedTo = require("../middlewares/allowedTo");

const router = express.Router();

router
  .route("/")
  .get(getCourses)
  .post(verifyToken, allowedTo(MANAGER), validationSchema(), addCourse);

router
  .route("/:courseId")
  .get(getCourseById)
  .patch(updateCourse)
  .delete(verifyToken, allowedTo(ADMIN, MANAGER), deleteCourse);

module.exports = router;
