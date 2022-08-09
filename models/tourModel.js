// MODULES
const mongoose = require('mongoose');
const slugify = require('slugify');

// SCHEMA
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name!'],
      unique: true,
      trim: true,
      maxLength: [
        40,
        'A tour name must have less or equal than fourty characters!',
      ],
      minLength: [
        10,
        'A tour name must have more or equal than ten characters!',
      ],
    },
    slug: {
      type: String,
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration!'],
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price!'],
      validate: {
        validator(value) {
          if (value > 0) return true;
          return false;
        },
        message: 'A tour price must be above 0!',
      },
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (value) {
          return value >= this.price;
        },
        message: 'Discount price should be below the regular price!',
      },
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a max group size!'],
    },
    rating: {
      type: Number,
      default: 4.5,
      min: [1.0, 'A tour rating must be above 1.0'],
      max: [5.0, 'A tour rating must be at maximum 5.0'],
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
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'A tour difficulty is either easy, medium or difficult',
      },
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
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

// VIRTUAL PROPERTIES
// Returning the field durationWeeks only in queries, as it is a virtual property.
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// MIDDLEWARES
// Creating the slug for every tour.
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Removing the secret tours from the queries.
tourSchema.pre(/^find/, function (next) {
  this.find({
    secretTour: {
      $ne: true,
    },
  });

  next();
});

// Removing the secret tours from the aggregation pipelines.
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

// MODEL
const tourModel = new mongoose.model('Tour', tourSchema);

// EXPORT
module.exports = tourModel;
