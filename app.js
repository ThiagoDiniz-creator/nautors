// The app should only contain logic that is exclusive to Express
// all the configuration that isn't part of Express is done in the
// server.js file.
// MODULES
const express = require('express');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const errorController = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const AppError = require('./utils/appError');

// CREATING THE SERVER
const app = express();

// PATHS
const viewsPath = path.join(__dirname, 'views');
const publicPath = path.join(__dirname, 'public');

// PUG
app.set('view engine', 'pug');
app.set('views', viewsPath);

// This is the middleware that will allow us to access the files
// that are in the public folder.
app.use(express.static(publicPath));

// MIDDLEWARES
// This is the middleware that will print in the console all the
// requests, their response time and the response status code.
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// This is the middleware that will parse the JSON that is in the
// request body. Making it possible to handle data from POST, PATCH
// and PUT requests. The limit option makes it impossible for clients
// to send too big JSON files, like what happens in DDOS.
app.use(express.json({ limit: '10kb' }));

// Limiting requests from the same client.
// the rateLimit package allows us to block a user from trying to send
// too many requests, so it can avoid DDOS attempts, and also excessive
// traffic from the clients. You should define the limit and the time with
// caution, because different APIs have different limits and need different
// amounts of requests and block times.
const limiter = rateLimit({
  // The user can send a maximum of 100 requests per hour
  max: 100,
  // The time range that will register the amount of requests.
  windowMs: 60 * 60 * 1000,
  // The message in the client reached the request's limit.
  message: 'Too many requests from this IP! Please, try again in a hour.',
});
app.use(limiter);

// Protecting HTTP requests
// Helmet is a NPM package that automatically adds a big number of headers
// that will make our connection safer, and will reduce the odds of getting
// type of http manipulation.
app.use(helmet());

// Data sanitization against NoSQL Query Injection.
// the NoSQL Query Injection happens when we allow clients to send any
// data, without looking for malicious data, such as queries. With a NoSQL
// query (like a mongoDB query) you can bypass mechanisms like the login,
// and do an enormous amount of damage to an API.
app.use(mongoSanitize());

// Data sanitization against XSS
// Cross-site scripting is a technique that consists of injecting malicious
// code in the website. So, imagine that you have your username, the website
// will show it to you and other users. Knowing about this, you insert some
// malicious JS code in it. This code will be executed whenever someone loads
// a page that have your username in it. Following this logic, you could add
// a ton of malicious code in anyplace where you can write anything you want.
// the XSS sanitization will remove dangerous tags or code from the input,
// avoiding this kind of attack.
app.use(xss());

// Protecting against parameter pollution.
// Parameter pollution is another type of attack, that tries to make the application
// stopping to work. It will use an unexpected number of some parameter (like sort),
// so when the app tries to use it as just one or as an expected amount, it will break
// and the server will stop. Because of this, this kind of attack is very common in DDOS
// attempts.
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// ROUTES
// View router
app.use('/', viewRouter);

// We are giving these sub-applications their own routes. All the
// routes that they define inside their own application will be accessible
// if you add these prefixes.
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

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
