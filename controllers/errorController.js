// MODULES
const AppError = require('../utils/appError');

// sendErrorDev is a function created to send developers the highest level of
// detail and information when creating errors.
const sendErrorDev = (err, res) => {
  // If we are in development environment, we should send as much information as we can to the client
  // because, in this situation, we are going to be the client.
  res.status(err.statusCode).json({
    status: 'fail',
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

// sendErrorProd was developed to give clients well formatted and written error
// messages, that will convey information in a simple and non-technical language.
const sendErrorProd = (err, res) => {
  // If we are in production environment, we should send as little data as possible. Only the sufficient
  // to help the client understand the problem, and take measures to avoid it (if is possible).
  if (err.isOperational) {
    // If the error is operational, and safe to send more details.
    res.status(err.statusCode).json({
      status: 'fail',
      message: err.message,
    });
  } else {
    // 1) Log the error
    console.error(`Error: ${err}`);

    // 2) Send the generic message
    // If the error isn't operational, we can't leak any details
    res.status(500).json({
      status: 'fail',
      message: 'Something went wrong!',
    });
  }
};

// This function was created to specifically deal with Mongoose cast errors.
const handleCastError = (err) =>
  new AppError(`Invalid ${err.path}: ${err.value}`, 400);

// the handleDuplicateKeyError was built to handle the duplicate key errors,
// that happens when we try to add a new document with an index that was
// already used in a currently existent document.
const handleDuplicateKeyError = (err) =>
  new AppError(
    `The value ${err.keyValue.name} is already in the database. Try again with another one!`,
    400
  );

// the handleValidationError is a function that will create a nicely formatted
// response to an N amount of validation errors that may occur. Allowing the client
// to see all the errors individually, and take the correct actions.
const handleValidationError = (err) => {
  const errors = Object.keys(err.errors).map((name) => err.errors[name]);

  return new AppError(
    `The following validations errors occurred: ${errors.join('. ')}`,
    400
  );
};

// This function was created to deal specifically with the invalid JWT error.
const handleJsonWebTokenError = () =>
  new AppError('Please try to login again!', 401);

// The handleTokenExpiredError function was developed to send a simple message
// to the client when he tries to connect with an expired JWT.
const handleTokenExpiredError = () =>
  new AppError('Your token has expired! Login again!', 401);

// This is the error handling middleware, that will be used when an error is
// sent as the next() function parameter (next(err)). It will deal with all
// the errors that happen in our application.
module.exports = (err, req, res, next) => {
  // Setting the error values to default, if they didn't have any.
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Verifying the current environment, to decide between development errors and
  // production errors.
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (error.name === 'CastError') error = handleCastError(error);
    if (error.code === 11000) error = handleDuplicateKeyError(error);
    if (error.errors) error = handleValidationError(error);
    if (error.name === 'JsonWebTokenError') {
      error = handleJsonWebTokenError(error);
    }
    if (error.name === 'TokenExpiredError') {
      error = handleTokenExpiredError(error);
    }

    sendErrorProd(error, res);
  }
};
