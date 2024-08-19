const express = require("express");
const verifyToken = require("../middlewares/verifyToken");
const multer = require("multer");
const appError = require("../utils/appError");
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    const fileName = `user-${Date.now()}.${ext}`;
    cb(null, fileName);
  },
});

const fileFilter = (req, file, cb) => {
  const imageType = file.mimetype.split("/")[0];
  if (imageType === "image") {
    return cb(null, true);
  } else {
    return cb(appError.create("Only images are allowed", 400), false);
  }
};

const upload = multer({
  storage: diskStorage,
  fileFilter: fileFilter,
});

const router = express.Router();
const {
  getAllUsers,
  register,
  login,
} = require("../controllers/users.controller");

router.route("/").get(verifyToken, getAllUsers);

router.route("/register").post(upload.single("avatar"), register);
router.route("/login").post(login);

module.exports = router;
