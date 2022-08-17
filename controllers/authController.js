// MODULES
const jwt = require('jsonwebtoken');
const util = require('util');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// FUNCTIONS
// Function that will sign the JSON Web Token.
const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

// The promisified version of the jwt.verify() function.
const verifyToken = util.promisify(jwt.verify);

// The signUp function allows us to create a new user, and also returns
// a JWT (JSON Web Token) to automatically give the new user authorization
// to the protected routes.
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

// the login function allows users that already have accounts to get
// a new JWT, giving the access to the protected routes.
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if the request has an email and a password. Both required to
  // allow a user to login.
  if (!email || !password) {
    return next(
      new AppError('Please provide your email and password to login!', 400)
    );
  }

  // 2) Check if the password and email are from a real user. Firstly, we
  // will search for a user in the database with the same email, as the
  // email are indexes, no user can have the same email as other user.
  // After we do the query to find the user, we check if the password
  // that was sent is valid. If both the verifications are valid,
  // we can assure that the login attempt was valid.
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(
      new AppError(
        "There isn't an account with this combination of email and password! Try again with another combination",
        401
      )
    );
  }

  // Finally, we can sign a new token with the user's id in the payload
  // (used in other functions) and send it back to give him access.
  const token = signToken({ id: user._id });
  return res.status(200).json({ status: 'success', token });
});

// The protect() function will allow us to protect our routes from unauthorized
// access, from users who aren't logged in, who have expired JWT or who are
// using tokens that were issued before the last password change.
exports.protect = catchAsync(async (req, res, next) => {
  // 1) The first step is to verify if the user sent us a authorization header, that
  // follows the JWT pattern: Authorization: Bearer [token].
  if (
    !req.headers.authorization &&
    !req.headers.authorization.startsWith('Bearer ')
  ) {
    return next(
      new AppError('You need to be logged in before accessing this route!', 401)
    );
  }

  // 2) After checking for the existence of a authorization header, and confirming
  // that the content was in accordance to the JWT pattern, we can verify if the
  // token is valid.
  const token = req.headers.authorization.split('Bearer ')[1];
  const decodedToken = await verifyToken(token, process.env.JWT_SECRET);
  if (!decodedToken) {
    return next(new AppError('Please try to login again!'));
  }

  // 3) Check if the user still exists to make sure that an inactive user can't
  // access our protected routes, because he doesn't have the permissions anymore.
  const currentUser = await User.findById(decodedToken.id);

  if (!currentUser) {
    return next(
      new AppError('Please try again with an active or existent account!', 401)
    );
  }

  // 4) Check if the user changed the password before the token was created. This
  // avoids access from tokens that were issued before a password change, a pattern
  // that makes sure we are only giving access to the account's real owner.
  if (currentUser.changedPasswordAfter(decodedToken.iat)) {
    return next(new AppError('Your token is outdated. Please login again!'));
  }

  // If everything was successful, we can simply go to the next middleware.
  next();
});
