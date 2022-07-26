// MODULES
const dotenv = require('dotenv');

// CONFIGURATION
dotenv.config({ path: './config.env' });

const app = require('./app');

const port = process.env.PORT || 3000;

app.listen(port, () =>
  console.log(`The server is listening at localhost:${port}`)
);
