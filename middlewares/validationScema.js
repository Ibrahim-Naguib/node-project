const { body } = require("express-validator");

const validationSchema = () => {
  return [
    body("name")
      .notEmpty()
      .withMessage("Title is required")
      .isLength({ min: 2 })
      .withMessage("Title must be at least 2 characters"),
    body("price").notEmpty().withMessage("Price is required"),
  ];
};

module.exports = { validationSchema };
