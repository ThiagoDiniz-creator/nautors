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
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getOneTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

// EXPORTING
module.exports = router;
