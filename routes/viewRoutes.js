// MODULES
const router = require('express').Router();

const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

// ROUTES
router.use(bookingController.createBookingCheckout, authController.isLoggedIn);

// Tour overview
router.get('/', viewController.getOverview);

// Tour details page
router.get('/tour/:slug', authController.protect, viewController.getTour);

// Login page
router.get('/login', viewController.login);

// Profile page
router.get('/me', authController.protect, viewController.getAccount);

// Update user data
router.post(
  '/submit-user-data',
  authController.protect,
  viewController.updateUserData
);

// Bookings page
router.get('/my-tours', authController.protect, viewController.getMyTours);

// EXPORTING THE ROUTER
module.exports = router;
