// PATH MODULE
const path = require('path');

// PATHS
const tourControllerPath = path.join(
  __dirname,
  '../controllers/tourController'
);

// MODULES
const tourController = require(tourControllerPath);
const router = require('express').Router();

// ROUTES
router
  .route('/top-5-cheap')
  .get(tourController.bestFiveAndCheapestTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/:id')
  .get(tourController.getOneTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);

// EXPORTING
module.exports = router;
