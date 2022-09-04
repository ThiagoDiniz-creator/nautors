// MODULES
const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// MIDDLEWARE
exports.bestFiveAndCheapestTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.page = '1';
  req.query.sort = '-ratingAverage,price';
  req.query.fields = 'name,price,ratingAverage,summary,difficulty';

  next();
};

// FUNCTIONS
exports.getAllTours = catchAsync(async (req, res) => {
  // Creating the query
  const featuresObj = new APIFeatures(Tour.find(), req.query);
  featuresObj.filter().sort().fields().paginate();

  // Invoking the query
  const allTours = await featuresObj.query;

  res.status(200).json({
    status: 'success',
    // The result property isn't in the JSEND pattern, but is a good
    // practice.
    results: allTours.length,
    data: allTours,
  });
});

// Allows the client to find an specific tour.
exports.getOneTour = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const tour = await Tour.findById(id).populate({
    path: 'reviews',
  });

  if (!tour) {
    return next(
      new AppError(
        'Invalid tour ID. Could not find any tour with this ID.',
        404
      )
    );
  }

  res.status(200).json({
    status: 'success',
    tours: tour,
  });
});

// This function allows the client to create a new tour.
exports.createTour = catchAsync(async (req, res) => {
  const newTour = await Tour.create(req.body);

  res.status(201).json({ status: 'success', data: newTour });
});

// The updateTour function make it possible to change the current
// data of any existent tour.
exports.updateTour = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const tour = await Tour.findByIdAndUpdate(
    { _id: id },
    { ...req.body },
    { returnDocument: 'after', runValidators: true, context: 'query' }
  );

  if (!tour) {
    return next(
      new AppError(
        'Invalid tour ID. Could not find any tour with this ID.',
        404
      )
    );
  }

  res.status(200).json({
    status: 'success',
    data: tour,
  });
});

// The deleteTour function allows to remove a document from the
// Tour collection.
exports.deleteTour = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const tour = await Tour.findByIdAndDelete(id);

  if (!tour) {
    return next(
      new AppError(
        'Invalid tour ID. Could not find any tour with this ID.',
        404
      )
    );
  }

  res.status(204).json({
    status: 'success',
    data: tour,
  });
});

// This function will create a pipeline that returns useful information
// about the tours, dividing them by their difficulty.
exports.getTourStats = catchAsync(async (req, res) => {
  const stats = await Tour.aggregate([
    {
      $match: {
        ratingAverage: {
          $gte: 4.5,
        },
      },
    },
    {
      $group: {
        // In the group stage the _id will group the documents
        // so, in this situation will we make all the tours
        // with the same difficulty be in the same group.
        _id: '$difficulty',
        numRatings: {
          $sum: '$rating',
        },
        numTours: {
          $count: {},
        },
        avgRating: {
          $avg: '$ratingAverage',
        },
        avgPrice: {
          $avg: '$price',
        },
        minPrice: {
          $min: '$price',
        },
        maxPrice: {
          $max: '$price',
        },
      },
    },
    {
      $sort: {
        avgPrice: -1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: stats,
  });
});

// The monthly plan is a aggregation pipeline that makes it
// possible to see all the tours planned in an specific year
// and month.
exports.getMonthlyPlan = catchAsync(async (req, res) => {
  const year = Number(req.params.year);
  const plan = await Tour.aggregate([
    { $unwind: '$startDates' },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: {
          $month: '$startDates',
        },
        numTours: {
          $sum: 1,
        },
        tours: {
          $push: '$name',
        },
      },
    },
    {
      $addFields: {
        month: '$_id',
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: {
        numTours: -1,
      },
    },
    {
      $limit: 6,
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: plan,
  });
});
