// MODULES
const path = require('path');

// PATHS
const userControllerPath = path.join(
  __dirname,
  '../controllers/userController'
);
const userController = require(userControllerPath);

// Criando um novo router, que permitirá configurar as rotas do user. Ele é como o app.
const router = require('express').Router();

// ROUTES
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getOneUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

// Exportando o router, para que ele seja aplicado como middleware
// EXPORTING
module.exports = router;
