const mongoose = require("mongoose");
const { isEmail } = require("validator");
const { USER, ADMIN, MANAGER } = require("../utils/userRoles");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [isEmail, "Please enter a valid email"],
  },
  password: {
    type: String,
    required: true,
  },
  token: {
    type: String,
  },
  role: {
    type: String,
    enum: [USER, ADMIN, MANAGER],
    default: USER,
  },
  avatar: {
    type: String,
    default: "uploads/profile.jpg",
  },
});

module.exports = mongoose.model("User", userSchema);
