// MODULES
const express = require('express');
const morgan = require('morgan');
const path = require('path');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

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

app.use((req, res, next) => {
  console.log('Hello from the middleware!');
  next();
});

// ROUTERS
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
