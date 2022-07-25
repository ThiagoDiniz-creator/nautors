// Modules
const fs = require('fs');
const path = require('path');

// Paths
const toursPath = path.join(`${__dirname}/../dev-data/data/tours-simple.json`);

// JSON
const toursData = JSON.parse(fs.readFileSync(toursPath));

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

  if (id > -1 && id < toursData.length)
    res.status(200).json({ status: 'success', tours: '<Tour data here!>' });
  else res.status(404).json({ status: 'fail', message: 'Invalid ID!' });
};

exports.deleteTour = (req, res) => {
  const id = Number(req.params.id);

  if (id > -1 && id < toursData.length)
    res.status(204).json({ status: 'success', tours: null });
  else res.status(404).json({ status: 'fail', message: 'Invalid ID!' });
};
