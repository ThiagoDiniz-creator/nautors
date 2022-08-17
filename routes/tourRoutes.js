// MODULES
// Getting a router, that will allow us to create new routes
// , use specific middlewares, and essentially create a new
// sub-application.
const router = require('express').Router();

const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');

// ROUTES
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
    authController.restrictTo('admin', 'lead-guide'),
    tourController.getMonthlyPlan
  );

router
  .route('/:id')
  .get(authController.protect, tourController.getOneTour)
  .patch(authController.protect, tourController.updateTour)
  .delete(authController.protect, tourController.deleteTour);

router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(authController.protect, tourController.createTour);

// EXPORTING
module.exports = router;
