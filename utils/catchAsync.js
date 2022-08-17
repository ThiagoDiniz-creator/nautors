// EXPORTING
// This function is a wrapper function, that will change how the async
// code is written. It can wrap async functions to make it possible to
// catch the errors, and send them to the error handling middleware.
// By doing this we will not need to use the try/catch block anymore.
module.exports = (fn) => (req, res, next) => {
  // We will receive the async function, and return a new function
  // with the three common parameters (req, res, next). These parameters
  // will be used to call the async function, and a catch method will be
  // chained to the function call, passing the error to the next function
  // if it ever happens.
  fn(req, res, next).catch(next);
};
