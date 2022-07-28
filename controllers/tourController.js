// MODULES
const Tour = require('../models/tourModel');

// EXPORTING
exports.getAllTours = async (req, res) => {
  try {
    // find() select all the elements from the document. If it had a condition, it would only return the documents that
    // were approved.
    const queryValues = req.query;

    const allToursQuery = Tour.find(queryValues);

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
      message: "Couldn't get all tours!",
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
