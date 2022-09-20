// MODULES
const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const HandlerFactory = require('./handlerFactory');
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
exports.getAllTours = HandlerFactory.getAll(Tour);

// Allows the client to find a specific tour.
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

// the getToursWithin returns the closest tours to the center of a point.
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { unity, latlgn, distance } = req.params;
  const [lat, lgn] = latlgn.split(',');
  const radius = unity === 'mi' ? distance / 3963.2 : distance / 6378.1;

  // 1) Check if the provided center is valid.
  if (!lat || !lgn) {
    return next(
      new AppError(
        'Please, provide latitude and longitude in the format: lat, lgn',
        400
      )
    );
  }

  // 2) Get the results close to the center.
  const closeTours = await Tour.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [[lgn, lat], radius],
      },
    },
  }).select('-guides');

  // 3) Send the response.
  res
    .status(200)
    .json({ status: 'success', results: closeTours.length, data: closeTours });
});

// This function will create a pipeline that returns useful information
// about the tours, dividing them by their difficulty.
exports.getTourStats = catchAsync(async (req, res) => {
  // noinspection JSUnresolvedFunction
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

// The monthly plan is an aggregation pipeline that makes it
// possible to see all the tours planned in a specific year
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

// Gets the distance of the closest tours.
exports.getDistances = catchAsync(async (req, res, next) => {
  const { unit, latlgn } = req.params;
  const [lat, lgn] = latlgn.split(',');
  // The $geoNear results are in meters, so we need to convert them to miles or km.
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  // 1) Check if the provided center is valid.
  if (!lat || !lgn) {
    return next(
      new AppError(
        'Please, provide latitude and longitude in the format: lat, lgn',
        400
      )
    );
  }

  const distances = await Tour.aggregate([
    {
      // Always needs to be the first stage. It also requires at least one of the
      // geospatial fields to be an index.
      $geoNear: {
        // All the distances will be calculated from this point.
        near: {
          type: 'Point',
          coordinates: [Number(lgn), Number(lat)],
        },
        // The name of the field that will receive the calculated distance.
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  // 3) Send the response.
  res
    .status(200)
    .json({ status: 'success', results: distances.length, data: distances });
});
