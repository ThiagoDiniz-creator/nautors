// MODULES
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Função que assina o token JWT
const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  newUser.password = undefined;

  const token = signToken({ id: newUser._id });

  res.status(201).json({ status: 'success', token, data: { user: newUser } });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(
      new AppError('Please provide your email and password to login!', 400)
    );
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(
      new AppError(
        "There isn't an account with this combination of email and password! Try again with another combination",
        401
      )
    );
  }
  const token = signToken({ id: user._id });
  return res.status(200).json({ status: 'success', token });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Check if there is a token.
  const { token } = req.body;

  if (!token) {
    return next(new AppError('', 401));
  }

  // 2) Verify if the token is valid.

  // 3) Check if the user still exists.

  // 4) Check if the user changed the password before the token was created.
  next();
});
