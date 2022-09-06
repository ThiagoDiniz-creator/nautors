// MODULES
const Review = require('../models/reviewModel');
const HandlerFactory = require('./handlerFactory');

// This function will return all reviews, with the desired filtering, fields, sorting and pagination.
exports.getAllReviews = HandlerFactory.getMany(Review);

// Get only an specific review.
exports.getOneReview = HandlerFactory.getOne(Review);

// Set the tours and user ids to the correct values.
exports.getTourUserIds = (req, res, next) => {
  // 1) Guaranteeing that the createReview function will handle two types of operation.
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

// This function will create a new review. Must be logged-in to use it.
exports.createReview = HandlerFactory.createOne(Review);

// This function will delete an user's own review.
exports.deleteReview = HandlerFactory.deleteOne(Review);
