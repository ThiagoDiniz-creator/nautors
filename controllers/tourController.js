// MODULES
const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const HandlerFactory = require('./handlerFactory');

// MIDDLEWARE
exports.bestFiveAndCheapestTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.page = '1';
  req.query.sort = '-ratingAverage,price';
  req.query.fields = 'name,price,ratingAverage,summary,difficulty';

  next();
};

// FUNCTIONS
exports.getAllTours = HandlerFactory.getMany(Tour);

// Allows the client to find an specific tour.
exports.getOneTour = HandlerFactory.getOne(Tour, {
  path: 'reviews',
});

// This function allows the client to create a new tour.
exports.createTour = HandlerFactory.createOne(Tour);

// The updateTour function make it possible to change the current
// data of any existent tour.
exports.updateTour = HandlerFactory.updateOne(Tour);

// The deleteTour function allows to remove a document from the
// Tour collection.
exports.deleteTour = HandlerFactory.deleteOne(Tour);

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
