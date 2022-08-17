// This class will make our error handling better, by allowing us to
// give more information to our errors, and setting additional info
// automatically.
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// EXPORTING
module.exports = AppError;
