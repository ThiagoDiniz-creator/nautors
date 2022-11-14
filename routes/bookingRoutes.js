const router = require('express').Router();
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

router.get(
  '/create-payment-intent/:tourId',
  authController.protect,
  bookingController.getCheckoutSession
);

module.exports = router;
