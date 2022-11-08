// MODULES
const router = require('express').Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

// ROUTES
// signing routes
router.post('/signup', authController.signUp);
router.post('/signin', authController.login);
router.get('/logout', authController.logout);

// password reset, recover and update
router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);

// checking every user in the following routes.
router.use(authController.protect);

// updating user own password.
router.patch('/update-my-password', authController.updatePassword);

// user own profile routes
router.delete('/delete-me', authController.protect, userController.deleteMe);
router.patch(
  '/update-me',
  authController.protect,
  userController.getSinglePhoto,
  userController.resizeUserImage,
  userController.updateMe
);
router.get('/me', userController.getMe, userController.getOneUser);

// being sure that only admins can change or get info about the users
router.use(authController.restrictTo('admin'));

// user management routes
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getOneUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

// EXPORTING
module.exports = router;
