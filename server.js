const app = require('./app');

const port = 8000;
app.listen(port, () =>
  console.log(`The server is listening at localhost:${port}`)
);
