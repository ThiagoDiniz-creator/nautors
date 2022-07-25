const path = require('path');
const tourController = require(path.join(
  __dirname,
  '../controllers/tourController'
));
const router = require('express').Router();

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getOneTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
