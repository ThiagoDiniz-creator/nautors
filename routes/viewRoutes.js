// MODULES
const router = require('express').Router();

const viewController = require('../controllers/viewController');

// ROUTES
// Tour overview
router.get('/', viewController.getOverview);

// Tour details page
router.get('/tour/:slug', viewController.getTour);

// Login page
router.get('/login', viewController.login);

// EXPORTING THE ROUTER
module.exports = router;
