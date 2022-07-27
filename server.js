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

const app = require('./app');

const port = process.env.PORT || 3000;

app.listen(port, () =>
  console.log(`The server is listening at localhost:${port}`)
);
