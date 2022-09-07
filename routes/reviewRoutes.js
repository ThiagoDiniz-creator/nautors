// MODULES
// MERGING PARAMS, it means the if a nested route is redirected to this router, it
// will be able to get any param that was in this initial route, but that isn't in the
// route that is here. As an example, imagine that there is a route /tours/:tourId/reviews
// if the router is configured in the following way: router.use('/tours/:tourId/reviews', reviewRouter)
// there should be an id params, but as the route that is going to receive it doesn't have any
// (because it will be the '/' route, as there is not anything more of the route after it was redirected)
// our routes would be unable to properly handle the request. Therefore, the mergeParams will take care
// of the params that were sent, but don't exist in the route that will receive them, allowing the route
// to use params that weren't configured in it.
const router = require('express').Router({ mergeParams: true });
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

// Allowing only authenticated users to see reviews.
router.use(authController.protect);

// ROUTES
router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.getTourUserIds,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getOneReview)
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  )
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview
  );

// EXPORTING
module.exports = router;
