// MODULES
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// CONFIGURATION
dotenv.config({ path: './config.env' });
const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);
mongoose.connect(DB, {
  useNewUrlParser: true,
});

// UNCAUGHT EXCEPTION HANDLER
process.on('uncaughtException', (err) => {
  console.log('An unhandled exception has occurred!');
  console.log(`${err.name}, ${err.message}`);
  process.exit(1);
});

const app = require('./app');

const port = process.env.PORT || 3000;

const server = app.listen(port, () =>
  console.log(`The server is listening at localhost:${port}`)
);

// UNHANDLED REJECTION HANDLER
process.on('unhandledRejection', (err) => {
  console.log('An unhadled rejection has happened');
  console.log(`${err.name}, ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});
