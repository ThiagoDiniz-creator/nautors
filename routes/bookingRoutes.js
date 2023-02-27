const router = require('express').Router();
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

// Checking if all users are logged in
router.use(authController.protect);

// Create the checkout session
router.get('/checkout-session/:tourId', bookingController.getCheckoutSession);

// Restrict all the further actions to only admins and lead-guides, are they represent important aspects of the business.
router.use(authController.restrictTo('admin', 'lead-guide'));

// Using the common prefix /, to some methods
router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);

// Adding the :id parameter to restrict some actions scope
router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;
