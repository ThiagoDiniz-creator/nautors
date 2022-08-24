// MODULES
const router = require('express').Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

// ROUTES
router.post('/signup', authController.signUp);
router.post('/signin', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);
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
