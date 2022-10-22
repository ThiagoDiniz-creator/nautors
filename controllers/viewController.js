// MODULES
const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res) => {
  // 1) Get data from the collection.
  const tours = await Tour.find();

  // 2) Render tour data to the template.
  res.status(200).render('overview', {
    title: 'All tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res) => {
  // 1) Get the param
  const { slug } = req.params;

  // 2) Find the proper tour
  const tour = await Tour.findOne({ slug }).populate({
    path: 'reviews',
    populate: { path: 'user' },
  });

  console.log(tour);

  // 3) Check if the tour was found
  if (!tour) {
    res.status(404).json({ status: 'fail', message: 'Page was not found!' });
  }

  // 4) Send the page, with the data back.
  res.status(200).render('tour', {
    title: 'The Forest Hiker',
    tour,
  });
});
