const AppError = require('../utils/appError');

const sendErrorDev = (err, res) => {
  // If we are in development enviroment, we should send as much information as we can to the client
  // because, in this situation, we are going to be the client.
  res.status(err.statusCode).json({
    status: 'fail',
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

const sendErrorProd = (err, res) => {
  // If we are in production enviroment, we should send as little data as possible. Only the sufficient
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

const handleCastError = (err) =>
  new AppError(`Invalid ${err.path}: ${err.value}`, 400);

const handleDuplicateKeyError = (err) =>
  new AppError(
    `The value ${err.keyValue.name} is already in the database. Try again with another one!`,
    400
  );

const handleValidationError = (err) => {
  const errors = Object.keys(err.errors).map((name) => err.errors[name]);

  return new AppError(
    `The following validations errors occurred: ${errors.join('. ')}`,
    400
  );
};

const handleJsonWebTokenError = () =>
  new AppError('Please try to login again!', 401);

const handleTokenExpiredError = () =>
  new AppError('Your token has expired! Login again!', 401);

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

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
