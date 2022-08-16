// MODULES
const jwt = require('jsonwebtoken');
const util = require('util');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Função que assina o token JWT
const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const verifyToken = util.promisify(jwt.verify);

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
  if (
    !req.headers.authorization &&
    !req.headers.authorization.startsWith('Bearer ')
  ) {
    return next(
      new AppError('You need to be logged in before acessing this route!', 401)
    );
  }

  // 2) Verify if the token is valid.
  const token = req.headers.authorization.split('Bearer ')[1];
  const decodedToken = await verifyToken(token, process.env.JWT_SECRET);
  if (!decodedToken) {
    return next(new AppError('Please try to login again!'));
  }

  // 3) Check if the user still exists.
  const currentUser = await User.findById(decodedToken.id);

  if (!currentUser) {
    return next(
      new AppError('Please try again with an active or existent account!', 401)
    );
  }

  // 4) Check if the user changed the password before the token was created.
  if (currentUser.changedPasswordAfter(decodedToken.iat)) {
    return next(new AppError('Your token is outdated. Please login again!'));
  }

  next();
});
