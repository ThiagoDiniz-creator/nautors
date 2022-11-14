// MODULES
const jwt = require('jsonwebtoken');
const util = require('util');
const crypto = require('crypto');
const Email = require('../utils/email');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// FUNCTIONS
//  that will sign the JSON Web Token.
const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createAndSendToken = async (user, code, res) => {
  const token = signToken({ id: user._id });

  // Here we are creating a new Cookie for the JWT Token, by doing this and
  // limiting it to be httpOnly, we can be sure that it wil only be accessible
  // in http communication, and can't be changed directly by the browser.
  const cookieOptions = {
    expiresIn: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENVIRONMENT === 'production') {
    // Defining the option to secure only allows the cookie to be sent when
    // we are in an HTTPS connection. By doing this, only users that can connect
    // to our API using a safe connection are allowed.
    cookieOptions.secure = true;
  }

  // res.cookie() is used to set a new cookie into the http communication.
  res.cookie('jwt', token, cookieOptions);

  res.status(code).json({
    status: 'success',
    token,
  });
};

// The promisified version of the jwt.verify() function.
const verifyToken = util.promisify(jwt.verify);

// The signUp function allows us to create a new user, and also returns
// a JWT (JSON Web Token) to automatically give the new user authorization
// to the protected routes.
exports.signUp = catchAsync(async (req, res) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  newUser.password = undefined;

  const url = `${req.protocol}://${req.get('host')}/me`;
  const email = new Email(newUser, url);
  await email.sendWelcome();

  await createAndSendToken(newUser, 201, res);
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
  // noinspection JSUnresolvedFunction
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
  await createAndSendToken(user, 200, res);
});

// To protect() function will allow us to protect our routes from unauthorized
// access, from users who aren't logged in, who have expired JWT or who are
// using tokens that were issued before the last password change.
exports.protect = catchAsync(async (req, res, next) => {
  // 1) The first step is to verify if the user sent us an authorization header, that
  // follows the JWT pattern: Authorization: Bearer [token].
  if (
    (!req.headers.authorization ||
      !req.headers.authorization.startsWith('Bearer ')) &&
    !req.cookies.jwt
  ) {
    return next(
      new AppError('You need to be logged in before accessing this route!', 401)
    );
  }

  // 2) After checking for the existence of an authorization header, and confirming
  // that the content was in accordance to the JWT pattern, we can verify if the
  // token is valid.
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split('Bearer ')[1];
  } else {
    token = req.cookies.jwt;
  }

  const decodedToken = await verifyToken(token, process.env.JWT_SECRET);
  if (!decodedToken) {
    return next(new AppError('Please try to login again!'));
  }

  // 3) Check if the user still exists to make sure that an inactive user can't
  // access our protected routes, because he doesn't have the permissions anymore.
  // noinspection JSUnresolvedFunction
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
  req.user = currentUser;

  // If everything was successful, we can simply go to the next middleware.
  next();
});

// Only for rendered pages, no error will be sent
exports.isLoggedIn = catchAsync(async (req, res, next) => {
  if (req.cookies.jwt === 'logged-out') return next();
  // 1) The first step is to verify if the user sent us an authorization header, that
  // follows the JWT pattern: Authorization: Bearer [token].
  if (req.cookies.jwt) {
    const decodedToken = await verifyToken(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );
    if (!decodedToken) {
      return next();
    }

    // 3) Check if the user still exists to make sure that an inactive user can't
    // access our protected routes, because he doesn't have the permissions anymore.
    // noinspection JSUnresolvedFunction
    const currentUser = await User.findById(decodedToken.id);

    if (!currentUser) {
      return next();
    }

    // 4) Check if the user changed the password before the token was created. This
    // avoids access from tokens that were issued before a password change, a pattern
    // that makes sure we are only giving access to the account's real owner.
    if (currentUser.changedPasswordAfter(decodedToken.iat)) {
      return next();
    }
    res.locals.user = currentUser;
    // If everything was successful, we can simply go to the next middleware.
  }
  // If the condition failed, just proceed.
  next();
});

exports.logout = catchAsync(async (req, res) => {
  res.cookie('jwt', 'logged-out', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
});

// This function allows to restrict the access to certain routes to only the
// desired roles. Like admin, or lead-guide.
exports.restrictTo = (...roles) =>
  catchAsync(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You don't have permission to perform this action!", 403)
      );
    }

    next();
  });

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get the user's email from POST.
  const { email } = req.body;

  // Searching for the user
  const user = await User.findOne({ email });

  // If there is no user with this email
  if (!user) {
    return next(
      new AppError(
        "This email isn't currently in our database. You could sign-up, instead of resetting your password.",
        401
      )
    );
  }

  // 2) Create a random token.
  const token = await user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Email the user his random token.
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${token}`;
  // const message = `Forgot your password? Submit a Patch request with your new password and passwordConfirm to: ${resetURL}. If you didn't forgot your email, please ignore this message!`;

  try {
    await new Email(user, resetURL).sendPasswordReset();
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'An error has occurred when trying to send the reset password email. Please try again later!',
        500
      )
    );
  }

  res.status(200).json({ status: 'success', message: 'Token sent to email!' });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get the user based on the token
  const { token } = req.params;
  const { password, passwordConfirm } = req.body;
  const encryptedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: encryptedToken,
    passwordResetExpires: {
      $gt: Date.now(),
    },
  });

  // 2) If token has not expired, and there is a user, set the new password
  if (!user) {
    return next(new AppError("This token doesn't exists!", 404));
  }
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  // 3) Update changedPasswordAt property for the user
  await user.save();

  // 4) Log the user in, send the JWT to the client
  await createAndSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Confirm if the user sent both the password, the newPassword and newPasswordConfirm.
  // noinspection JSUnresolvedFunction
  const user = await User.findById(req.user.id).select('+password');
  const { passwordCurrent, password, passwordConfirm } = req.body;
  if (!(passwordCurrent && password && passwordConfirm)) {
    return next(
      new AppError(
        'Please, send  the password , the new password and the new password confirmation!',
        400
      )
    );
  }

  // 2) Confirm if the password is correct
  if (!(await user.correctPassword(passwordCurrent, user.password))) {
    return next(new AppError('The current password is incorrect!'), 401);
  }
  // 3) Change the user current password and passwordConfirm
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await user.save();

  // 4) Send the user a new JWT Token, so he can continue to be signed-in
  await createAndSendToken(user, 201, res);
});
