// Uma boa prática comum é definir a versão da API na URL, dessa forma é possível atualizar à aplicação sem correr
// o risco de prejudicar clientes que ainda se utilizam de uma versão anterior. Por isso, definir a versão facilita
// que o acesso seja mantido mesmo que novas versões sejam desenvolvidas.

// Modules
const express = require('express');
const path = require('path');
const fs = require('fs');
const morgan = require('morgan');

// Creating the server
const app = express();

// Middlewares
app.use(morgan('dev'));
app.use(express.json());
// O middleware express.json() é necessário para que o req.body consiga lidar com JSON, caso ele não seja
// adicionado não é possível ler o JSON do req.body (ele vai estar indefinido).`

app.use((req, res, next) => {
  console.log('Hello from the middleware!');
  next();
});

// Paths
const toursPath = path.join(`${__dirname}/dev-data/data/tours-simple.json`);

// JSON
const toursData = JSON.parse(fs.readFileSync(toursPath));

// Functions
// Tours
const getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    // O results não faz parte do JSend, mas é um padrão adotado no curso de Node do Jonas Schmedtmann
    results: toursData.length,
    data: toursData,
  });
};

const getOneTour = (req, res) => {
  const id = Number(req.params.id);
  const tour = toursData.find(({ id: tourId }) => tourId === id);

  if (!tour) {
    res.status(404).json({
      status: 'fail',
      message: 'Invalid ID. Try again with a valid one!',
    });
  } else {
    res.status(200).json({
      status: 'success',
      tours: tour,
    });
  }
};

const createTour = (req, res) => {
  const newId = toursData.at(-1).id + 1;
  const newTour = {
    id: newId,
    ...req.body,
  };

  toursData.push(newTour);
  const stringifiedToursData = JSON.stringify(toursData);

  fs.writeFile(toursPath, stringifiedToursData, (err) => {
    if (err) res.status(500).json({ status: 'fail', data: newTour });
    else res.status(201).json({ status: 'success', data: newTour });
  });
};

const updateTour = (req, res) => {
  const id = Number(req.params.id);

  if (id > -1 && id < toursData.length)
    res.status(200).json({ status: 'success', tours: '<Tour data here!>' });
  else res.status(404).json({ status: 'fail', message: 'Invalid ID!' });
};

const deleteTour = (req, res) => {
  const id = Number(req.params.id);

  if (id > -1 && id < toursData.length)
    res.status(204).json({ status: 'success', tours: null });
  else res.status(404).json({ status: 'fail', message: 'Invalid ID!' });
};

// Users
const getAllUsers = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This route is not yet defined!' });
};

const getOneUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This route is not yet defined!' });
};
const createUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This route is not yet defined!' });
};
const updateUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This route is not yet defined!' });
};
const deleteUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This route is not yet defined!' });
};

// Routes
const tourRouter = express.Router();
const userRouter = express.Router();

tourRouter.route('/').get(getAllTours).post(createTour);

tourRouter.route('/:id').get(getOneTour).patch(updateTour).delete(deleteTour);

userRouter.route('/').get(getAllUsers).post(createUser);
userRouter.route('/:id').get(getOneUser).patch(updateUser).delete(deleteUser);

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// Quando queremos receber parâmetros de uma requisição basta defini-los na rota.
// :parametro => Define um parâmetro obrigatório
// :parametro? => Define um parâmetro opcional
// app.get('/api/v1/tours', getAllTours);
// app.post('/api/v1/tours', createTour)
// app.get('/api/v1/tours/:id', getOneTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

// Defining the port
const port = 8000;
app.listen(port, () =>
  console.log(`The server is listening at localhost:${port}`)
);
