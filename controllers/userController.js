// MODULES
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const filterObj = require('../utils/filterObj');

// FUNCTIONS
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res
    .status(200)
    .json({ status: 'success', results: users.length, data: users });
});

exports.getOneUser = catchAsync(async (req, res, next) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This route is not yet defined!' });
});

exports.createUser = catchAsync(async (req, res, next) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This route is not yet defined!' });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This route is not yet defined!' });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Check if the user POSTed password data.
  if (
    Object.getOwnPropertyNames(req.body).find(
      (el) =>
        el === 'password' ||
        el === 'passwordConfirm' ||
        el === 'passwordCurrent'
    ) !== undefined
  ) {
    return next(
      new AppError(
        'This route is not used to password update. Please use the update-my-password route!',
        400
      )
    );
  }
  // 2) Change the different data
  const user = await User.findById(req.user.id);
  const newData = filterObj(req.body, ['email', 'name']);
  await user.updateOne(newData, {
    new: true,
    runValidators: true,
  });

  // 3) Send the user a new data object, and the success response
  res.status(201).json({ status: 'success', data: user });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This route is not yet defined!' });
});
