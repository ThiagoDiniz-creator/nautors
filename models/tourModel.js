// MODULES
const mongoose = require('mongoose');

// SCHEMA
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name!'],
    unique: true,
    trim: true,
  },
  duration: {
    type: Number,
    required: [true, 'A tour must have a duration!'],
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price!'],
  },
  priceDiscount: {
    type: Number,
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have a max group size!'],
  },
  rating: {
    type: Number,
    default: 4.5,
  },
  ratingAverage: {
    type: Number,
    default: 4.5,
  },
  ratingQuantity: {
    type: Number,
    default: 0,
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have a difficulty'],
  },
  summary: {
    type: String,
    required: [true, 'A tour must have a summary!'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  imageCover: {
    type: String,
    required: [true, 'A tour must have a hover image!'],
  },
  images: {
    type: [String],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  startDates: {
    type: [Date],
  },
});

// MODEL
const tourModel = new mongoose.model('Tour', tourSchema);

// EXPORT
module.exports = tourModel;
