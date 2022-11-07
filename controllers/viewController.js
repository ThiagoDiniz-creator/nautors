// MODULES
const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/userModel');
const filterObj = require('../utils/filterObj');

exports.getOverview = catchAsync(async (req, res) => {
  // 1) Get data from the collection.
  const tours = await Tour.find();

  // 2) Render tour data to the template.
  res.status(200).render('overview', {
    title: 'All tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1) Get the param
  const { slug } = req.params;

  // 2) Find the proper tour
  const tour = await Tour.findOne({ slug }).populate({
    path: 'reviews',
    populate: { path: 'user' },
  });

  // 3) Check if the tour was found
  if (!tour) {
    return next(new AppError('Page was not found!', 404));
  }

  // 4) Send the page, with the data back.
  res.status(200).render('tour', {
    title: tour.name.toUpperCase(),
    tour,
  });
});

exports.login = catchAsync(async (req, res) =>
  res.status(200).render('login', { title: 'Log into your account' })
);

exports.getAccount = catchAsync(async (req, res) => {
  res.status(200).render('account', { title: 'Account' });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  // 1) Change the different data
  const newData = filterObj(req.body, ['email', 'name']);
  // 3) Send the user a new data object, and the success response
  res.locals.user = await User.findByIdAndUpdate(req.user.id, newData, {
    new: true,
    runValidators: true,
  });
  res.status(201).render('account', { title: 'Account' });
});
