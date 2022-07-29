// MODULES
const Tour = require('../models/tourModel');

// EXPORTING
exports.getAllTours = async (req, res) => {
  try {
    // Advanced filtering
    const queryString = JSON.stringify(req.query);

    const parsedQueryString = queryString.replace(
      /\bgte|gt|lt|lte\b/g,
      (match) => `$${match}`
    );
    const parsedQueryObj = JSON.parse(parsedQueryString);

    // Creating the query
    const allToursQuery = Tour.find(parsedQueryObj);
    // Invoking the query
    const allTours = await allToursQuery;

    res.status(200).json({
      status: 'success',
      // O results não faz parte do JSend, mas é um padrão adotado no curso de Node
      results: allTours.length,
      data: allTours,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getOneTour = async (req, res) => {
  try {
    const { id } = req.params;
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

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({ status: 'success', data: newTour });
  } catch (err) {
    res.status(400).json({ status: 'fail', data: 'Invalid data sent!' });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const { id } = req.params;
    const tour = await Tour.findByIdAndUpdate(
      { _id: id },
      { ...req.body },
      { returnDocument: 'after', runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      data: tour,
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: "Couldn't execute the operation! Try again with valid data",
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    const { id } = req.params;
    const tour = await Tour.findByIdAndDelete(id);

    if (!tour) throw new Error();

    res.status(204).json({
      status: 'success',
      data: tour,
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: 'Could not delete the desired ID! Try again with other values!',
    });
  }

  // if (id > -1 && id < toursData.length) {
  //   res.status(204).json({ status: 'success', tours: null });
  // } else res.status(404).json({ status: 'fail', message: 'Invalid ID!' });
};
