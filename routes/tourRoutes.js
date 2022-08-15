// MODULES
const router = require('express').Router();

const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');

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
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);

// EXPORTING
module.exports = router;
