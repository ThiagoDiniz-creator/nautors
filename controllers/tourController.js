// Modules
const fs = require('fs');
const path = require('path');

// Paths
const toursPath = path.join(__dirname, '/../dev-data/data/tours-simple.json');

// JSON
const toursData = JSON.parse(fs.readFileSync(toursPath));

// Functions
exports.checkId = (req, res, next, val) => {
  // Temos as três variáveis comuns de um middleware (req, res, next) e uma especial
  // , o quarto argumento é o valor do parâmetro que estamos buscando (nesse caso o id).
  if (val < -1 || val > toursData.length) {
    return res.status(404).json({ status: 'fail', message: 'Invalid ID!' });
  }
  // Nesse caso estamos verificando se o ID é válido, se ele não for encerraremos o ciclo
  // aqui nesse middleware.
  next();
};

exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    // O results não faz parte do JSend, mas é um padrão adotado no curso de Node
    results: toursData.length,
    data: toursData,
  });
};

exports.getOneTour = (req, res) => {
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

exports.checkTourData = (req, res, next) => {
  const { name, price } = req.body;

  if (!name || !price || Number(price) < 0 || !Number(price)) {
    return res.status(500).json({
      status: 'error',
      message: 'Invalid data! You need both a price and a name!',
    });
  }
  next();
};

exports.createTour = (req, res) => {
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

exports.updateTour = (req, res) => {
  const id = Number(req.params.id);

  if (id > -1 && id < toursData.length) {
    res.status(200).json({ status: 'success', tours: '<Tour data here!>' });
  } else res.status(404).json({ status: 'fail', message: 'Invalid ID!' });
};

exports.deleteTour = (req, res) => {
  const id = Number(req.params.id);

  if (id > -1 && id < toursData.length) {
    res.status(204).json({ status: 'success', tours: null });
  } else res.status(404).json({ status: 'fail', message: 'Invalid ID!' });
};
