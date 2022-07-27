const path = require('path');

// PATHS
const tourControllerPath = path.join(
  __dirname,
  '../controllers/tourController'
);

const tourController = require(tourControllerPath);
const router = require('express').Router();

// O router define um middleware param, que será chamado apenas quando o parâmetro id
// for enviado pela rota.
// router.param('id', tourController.checkId);

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
