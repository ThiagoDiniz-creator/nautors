// MODULES
const Review = require('../models/reviewModel');
const HandlerFactory = require('./handlerFactory');

// This function will return all reviews, with the desired filtering, fields, sorting and pagination.
exports.getAllReviews = HandlerFactory.getAll(Review);

// Get only a specific review.
exports.getOneReview = HandlerFactory.getOne(Review);

// Set the tours and user ids to the correct values.
exports.getTourUserIds = (req, res, next) => {
  // 1) Guaranteeing that the createReview function will handle two types of operation.
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

// Allow users to update reviews.
exports.updateReview = HandlerFactory.updateOne(Review);

// This function will create a new review. Must be logged-in to use it.
exports.createReview = HandlerFactory.createOne(Review);

// This function will delete a user's own review.
exports.deleteReview = HandlerFactory.deleteOne(Review);
