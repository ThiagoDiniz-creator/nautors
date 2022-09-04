// MODULES
const AppError = require('../utils/appError');
const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const ApiFeatures = require('../utils/apiFeatures');

// This function will return all reviews, with the desired filtering, fields, sorting and pagination.
exports.getAllReviews = catchAsync(async (req, res, next) => {
  const featuresObj = new ApiFeatures(Review.find(), req.query);
  // 1) Make the query correspond to the user's request.
  featuresObj.filter().fields().sort().paginate();

  // 2) Execute the query.
  const results = await featuresObj.query;
  const { length } = results;

  // 3) Return the query.
  res.status(200).json({ status: 'success', results: length, data: results });
});

exports.getOneReview = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  // 1) Check for the ID.
  if (!id) {
    return next(new AppError('Please, provide an ID for the query!', 400));
  }

  // 2) Query for the review.
  const review = await Review.findById(id);
  if (!review) {
    return next(new AppError('No review was found with the provided ID!', 404));
  }

  // 3) Return the review.
  res.status(200).json({ status: 'success', data: review });
});

// This function will create a new review. Must be logged-in to use it.
exports.createReview = catchAsync(async (req, res, next) => {
  // 1) Try to create the review.
  const newReview = await Review.create({ ...req.body, user: req.user._id });

  // 2) Return the new review object.
  res.status(201).json({ status: 'success', data: newReview });
});
