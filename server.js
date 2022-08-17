// MODULES
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// CONFIGURATION
// setting the current environment file to config.env.
// This file will provide the process.env with the variables
// that are declared inside it, such as the database password,
// and database connections string.
dotenv.config({ path: './config.env' });
// the DB is the database connection string, that is the the
// information we need to connect to MongoDB.
const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);
// With the connection string we can finally start our connection,
// it's important that this happens before the express app is started.
// To allow it to use the connection.
mongoose.connect(DB, {
  useNewUrlParser: true,
});

// UNCAUGHT EXCEPTION HANDLER
// This is the handler that will catch all the JS exceptions, that are
// coding errors, and will not allow the application to run anymore,
// because they will corrupt the app state.
// It also needs to come before the app, because in an error happens in
// the app configuration, it need to be handled properly.
process.on('uncaughtException', (err) => {
  console.log('An unhandled exception has occurred!');
  console.log(`${err.name}, ${err.message}`);
  process.exit(1);
});

// Starting the express app configuration and initialization.
const app = require('./app');

// Setting the port to the environment variable, or to the default 3000.
const port = process.env.PORT || 3000;

// Saving the server to a constant variable.
const server = app.listen(port, () =>
  console.log(`The server is listening at localhost:${port}`)
);

// UNHANDLED REJECTION HANDLER
// These are the async errors that aren't handled in the app.
// All errors that are not captured in any try/catch block or
// async wrapper function will be caught here.
process.on('unhandledRejection', (err) => {
  console.log('An unhadled rejection has happened');
  console.log(`${err.name}, ${err.message}`);
  // We first handle all the received requests, and stop receiving
  // new ones, before closing the app.
  server.close(() => {
    process.exit(1);
  });
});
