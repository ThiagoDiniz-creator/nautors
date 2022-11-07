// MODULES
// noinspection JSUnresolvedFunction

const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const filterObj = require('../utils/filterObj');
const HandlerFactory = require('./handlerFactory');

// FUNCTIONS
// This will get all the users, with the request sorting, filtering, pagination and fields.
exports.getAllUsers = HandlerFactory.getAll(User);

// This will get a specific user, that will be defined by the id param.
exports.getOneUser = HandlerFactory.getOne(User);

// This will create a new user, getting the data from the request's body.
exports.createUser = HandlerFactory.createOne(User);

// This will update an active user, by using the body's data.
exports.updateUser = HandlerFactory.updateOne(User);

// This will allow clients to update their own profile.
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

exports.deleteMe = catchAsync(async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// This middleware will set the param to id.
exports.getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};

// This will allow admins to manually delete user.
exports.deleteUser = HandlerFactory.deleteOne(User);
