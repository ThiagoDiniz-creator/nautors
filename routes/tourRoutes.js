const path = require('path');
const tourController = require(path.join(
  __dirname,
  '../controllers/tourController'
));
const router = require('express').Router();

// O router define um middleware param, que será chamado apenas quando o parâmetro id
// for enviado pela rota.
router.param('id', tourController.checkId);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.checkTourData, tourController.createTour);

router
  .route('/:id')
  .get(tourController.getOneTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
