// MODULES
const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');

// MIDDLEWARE
exports.bestFiveAndCheapestTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.page = '1';
  req.query.sort = '-ratingAverage,price';
  req.query.fields = 'name,price,ratingAverage,summary,difficulty';

  next();
};

// EXPORTING
exports.getAllTours = async (req, res) => {
  try {
    // Creating the query
    const featuresObj = new APIFeatures(Tour.find(), req.query);
    featuresObj.filter().sort().fields().paginate();

    // Invoking the query
    const allTours = await featuresObj.query;

    res.status(200).json({
      status: 'success',
      // O results não faz parte do JSend, mas é um padrão adotado no curso de Node
      results: allTours.length,
      data: allTours,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getOneTour = async (req, res) => {
  try {
    const { id } = req.params;
    const tour = await Tour.findById(id);

    if (!tour) throw new Error("Couldn't find the tour!");

    res.status(200).json({
      status: 'success',
      tours: tour,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: 'Invalid ID. Try again with a valid one!',
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({ status: 'success', data: newTour });
  } catch (err) {
    res.status(400).json({ status: 'fail', data: 'Invalid data sent!' });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const { id } = req.params;
    const tour = await Tour.findByIdAndUpdate(
      { _id: id },
      { ...req.body },
      { returnDocument: 'after', runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      data: tour,
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: "Couldn't execute the operation! Try again with valid data",
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    const { id } = req.params;
    const tour = await Tour.findByIdAndDelete(id);

    if (!tour) throw new Error();

    res.status(204).json({
      status: 'success',
      data: tour,
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: 'Could not delete the desired ID! Try again with other values!',
    });
  }

  // if (id > -1 && id < toursData.length) {
  //   res.status(204).json({ status: 'success', tours: null });
  // } else res.status(404).json({ status: 'fail', message: 'Invalid ID!' });
};

exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      // Esse é o estágio de preparação
      {
        $match: {
          ratingAverage: {
            $gte: 4.5,
          },
        },
      },
      {
        $group: {
          // _id é o campo que agrupará os documentos, um ex: Para agruparmos todos os tours por difficuldade ele será: _id: '$difficulty'.
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
      // {
      //   $match: {
      //     _id: {
      //       $ne: 'easy',
      //     },
      //   },
      // },
    ]);

    res.status(200).json({
      status: 'success',
      data: stats,
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: err,
    });
  }
};
