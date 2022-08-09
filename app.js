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
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.static(publicPath));
app.use(express.json());

// O middleware express.json() é necessário para que o req.body consiga lidar com JSON, caso ele não seja
// adicionado não é possível ler o JSON do req.body (ele vai estar indefinido).`

// ROUTERS
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  next(
    new AppError(
      `The route ${req.originalUrl} was not found on this server!`,
      404
    )
  );
});

// Error handling middleware.
app.use(errorController);

module.exports = app;
