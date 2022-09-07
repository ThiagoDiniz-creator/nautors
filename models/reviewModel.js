// MODULES
const mongoose = require('mongoose');
const Tour = require('../models/tourModel');

// SCHEMA
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      maxLength: [
        200,
        'Review must have at maximum 200 characters of extension!',
      ],
      required: [true, 'Review should have a text!'],
    },
    rating: {
      type: Number,
      required: [true, 'A review must have a rating'],
      validate: [
        (value) => value >= 1.0 && value <= 5.0,
        'Rating must be between (including) 1.0 and (including) 5.0',
      ],
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must be written by an user!'],
    },
    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must be assigned to a specific tour!'],
    },
  },
  {
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    },
  }
);

// MIDDLEWARES
// Removing unnecessary data from queries.
reviewSchema.pre(/^find/g, function (next) {
  this.select('-__v');

  next();
});

// Populating the tour and user, when we search for reviews. Only in findOne queries, for performance reasons.
reviewSchema.pre(/^findOne/g, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  }).populate({
    path: 'tour',
    select: 'name',
  });
  next();
});

reviewSchema.pre('findOneAndUpdate', function (next) {
  next();
});

// MODEL
const Review = mongoose.model('Review', reviewSchema);

// EXPORTING
module.exports = Review;
