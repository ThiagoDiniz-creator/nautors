// MODULES
// Getting a router, that will allow us to create new routes
// , use specific middlewares, and essentially create a new
// sub-application.
const router = require('express').Router();

const reviewRouter = require('./reviewRoutes');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');

// MERGING ROUTES
// Nested routes are routes that start with one resource (like tour), but in the end
// want to get or modify information from another resource. /tours/:tourId/reviews is one
// nested route, in this situation it will be directed to this router, as it starts with /tours
// but in the end, is a request to the review router. To solve it, we can merge the routes, by
// using the reviewRouter as a middleware.
router.use('/:tourId/reviews', reviewRouter);

// ROUTES
router
  .route('/tours-within/:distance/center/:latlgn/unity/:unity')
  .get(tourController.getToursWithin);

router.route('/distances/:latlgn/unity/:unit').get(tourController.getDistances);

router
  .route('/top-5-cheap')
  .get(tourController.bestFiveAndCheapestTours, tourController.getAllTours);

router
  .route('/tour-stats')
  .get(authController.protect, tourController.getTourStats);
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );

router
  .route('/:id')
  .get(tourController.getOneTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.getTourPhotos,
    tourController.checkTourId,
    tourController.resizeImages,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );

// EXPORTING
module.exports = router;
