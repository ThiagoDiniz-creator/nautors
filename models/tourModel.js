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
        'A tour name must have less or equal than forty characters!',
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
        // Only accepting prices that are higher than 0.
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
        // Only accepting discounts that are smaller than the price.
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
        // Making it possible to only set the difficulty as easy
        // medium, or difficult.
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
      // Setting the default value (when no value is assigned
      // to this field) to the moment the document was created.
      default: Date.now(),
    },
    startDates: {
      // Setting the startDate type to an array of dates.
      type: [Date],
    },
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: { type: [Number] },
      address: { type: String },
      description: { type: String },
    },
    locations: [
      {
        type: { type: String, default: 'Point', enum: ['Point'] },
        coordinates: {
          type: [Number],
        },
        address: { type: String },
        description: { type: String },
        day: { type: Number },
      },
    ],
    // Creating a child reference to the guides.
    guides: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  {
    // Activating the virtual properties to JSON and
    // objects queries.
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

// This is a virtual property, but in this situation, it is a virtual populate, an special
// type o virtual property, that allows us to create a temporary reference to other collections.
// The information are in the second argument, that will receive an object with some configurations.
// The necessary is the ref (name of the collection that is being referenced), the foreignField (the
// name of the field in the collection that was defined in ref, that we want to compare with a local field),
// and localField (the field in this schema that will be used to determine if a certain document should be in
// the "population", or not).
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});
// After setting the virtual populate, we can get the values using the populate() function in any query,
// as we would do with a field that actually exists in the schema. In this example, it would be for example:
// Tour.find().populate({path: reviews}).

// MIDDLEWARES
// Creating a slug for every tour.
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

// Using the populate method to change the guides identifiers, to the actual documents.
tourSchema.pre(/^find/, function (next) {
  this.populate({ path: 'guides', select: '-__v -passwordChangedAt' });
  next();
});

// // Embedding the guides to the tour
// tourSchema.pre('save', async function (next) {
//   if (this.guides) {
//     const promises = this.guides.map((id) => User.findById(id));
//     this.guides = await Promise.all(promises);
//     console.log(this.guides);
//   }

//   next();
// });

// Removing the secret tours from the aggregation pipelines.
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

// MODEL
const tourModel = new mongoose.model('Tour', tourSchema);

// EXPORTING
module.exports = tourModel;
