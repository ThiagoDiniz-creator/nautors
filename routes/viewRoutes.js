// MODULES
const router = require('express').Router();

const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');

// ROUTES
router.use(authController.isLoggedIn);

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

// EXPORTING THE ROUTER
module.exports = router;
