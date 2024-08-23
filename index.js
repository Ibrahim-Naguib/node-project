const express = require('express');
const cors = require('cors');
const coursesRouter = require('./routes/courses.route');
const usersRouter = require('./routes/users.route');
const path = require('path');
require('dotenv').config();

const app = express();
const mongoose = require('mongoose');
const { ERROR } = require('./utils/httpStatus');
const url = process.env.MONGODB_URI;

mongoose.connect(url).then(() => {
  console.log('Connected to the database');
});

app.use(cors());
app.use(express.json());
app.use('/api/courses', coursesRouter);
app.use('/api/users', usersRouter);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'data', 'docs.json'));
});

app.all('*', (req, res, next) => {
  return res.status(404).json({ status: ERROR, message: 'Resource not found' });
});

app.use((error, req, res, next) => {
  return res.status(error.statusCode || 500).json({
    status: error.statusText || ERROR,
    message: error.message,
    code: error.statusCode || 500,
    data: null,
  });
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Server is running on port 3000');
});
