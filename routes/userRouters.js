const path = require('path');
const userController = require(path.join(
  __dirname,
  '../controllers/userController'
));
const router = require('express').Router();

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getOneUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
