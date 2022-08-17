// The app should only contain logic that is exclusive to Express
// all the configuration that isn't part of Express is done in the
// server.js file.
// MODULES
const express = require('express');
const morgan = require('morgan');
const path = require('path');
const errorController = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');

// CREATING THE SERVER
const app = express();

// PATHS
const publicPath = path.join(__dirname, '/public');

// MIDDLEWARES
// This is the middleware that will print in the console all the
// requests, their response time and the response status code.
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// This is the middleware that will allows us to access the files
// that are in the public folder.
app.use(express.static(publicPath));
// This is the middleware that will parse the JSON that is in the
// request body. Making it possible to handle data from POST, PATCH
// and PUT requests.
app.use(express.json());

// ROUTERS
// We are giving these sub-applications their own routes. All the
// routes that they define inside their own application will be accessible
// if you add these prefixes.
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// This is the undefined route middleware, it will send an equal error message
// to all the clients who try to access a not defined route.
app.all('*', (req, res, next) => {
  next(
    new AppError(
      `The route ${req.originalUrl} was not found on this server!`,
      404
    )
  );
});

// Here we are defining the error handling middleware, that will receive
// all the detected errors. (The errors are detected when they are sent
// in the next function: next(err)).
app.use(errorController);

// EXPORTING
module.exports = app;
