// Modules
const Tour = require('../models/tourModel');

exports.getAllTours = async (req, res) => {
  try {
    const allTours = await Tour.find();

    res.status(200).json({
      status: 'success',
      // O results não faz parte do JSend, mas é um padrão adotado no curso de Node
      results: allTours.length,
      data: allTours,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: "Couldn't get all tours!",
    });
  }
};

exports.getOneTour = async (req, res) => {
  try {
    const { id } = req.params.id;
    const tour = await Tour.findById(id);

    if (!tour) throw new Error("Couldn't find the tour!");

    res.status(200).json({
      status: 'success',
      tours: tour,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: 'Invalid ID. Try again with a valid one!',
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

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({ status: 'success', data: newTour });
  } catch (err) {
    res.status(400).json({ status: 'fail', data: 'Invalid data sent!' });
  }
};

exports.updateTour = (req, res) => {
  const id = Number(req.params.id);

  // if (id > -1 && id < toursData.length) {
  //   res.status(200).json({ status: 'success', tours: '<Tour data here!>' });
  // } else res.status(404).json({ status: 'fail', message: 'Invalid ID!' });
};

exports.deleteTour = (req, res) => {
  const id = Number(req.params.id);

  // if (id > -1 && id < toursData.length) {
  //   res.status(204).json({ status: 'success', tours: null });
  // } else res.status(404).json({ status: 'fail', message: 'Invalid ID!' });
};
